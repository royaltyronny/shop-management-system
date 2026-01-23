import { Database } from 'better-sqlite3'
import { Sale, SaleItem } from '../../../shared/types'
import { getDatabase } from '../connection'

export class SaleRepository {
  private db: Database

  constructor(db?: Database) {
    this.db = db || getDatabase()
  }

  create(
    sale: Omit<Sale, 'id' | 'created_at' | 'sale_date'>,
    items: Omit<SaleItem, 'id' | 'sale_id'>[]
  ): Sale {
    const createSale = this.db.transaction(() => {
      // 1. Create Sale record
      const saleStmt = this.db.prepare(`
        INSERT INTO sales (total_amount, payment_method, customer_name)
        VALUES (@total_amount, @payment_method, @customer_name)
      `)

      const saleInfo = saleStmt.run({
        ...sale,
        total_amount: Math.round(sale.total_amount * 100)
      })
      const saleId = saleInfo.lastInsertRowid as number

      // 2. Create Sale Items and update stock
      const itemStmt = this.db.prepare(`
        INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `)

      const stockStmt = this.db.prepare(`
        UPDATE products SET current_stock = current_stock - ? WHERE id = ?
      `)

      const movementStmt = this.db.prepare(`
        INSERT INTO stock_movements (product_id, movement_type, quantity, reference_id, notes)
        VALUES (?, 'OUT', ?, ?, ?)
      `)

      for (const item of items) {
        // Insert sale item (convert prices to cents)
        itemStmt.run(
          saleId,
          item.product_id,
          item.quantity,
          Math.round(item.unit_price * 100),
          Math.round(item.subtotal * 100)
        )

        // Reduce stock
        stockStmt.run(item.quantity, item.product_id)

        // Record movement
        movementStmt.run(item.product_id, item.quantity, saleId, 'Sale generated movement')
      }

      return saleId
    })

    const newSaleId = createSale() as unknown as number
    return this.getById(newSaleId)!
  }

  /* Helpers for transforming cents to dollars */
  private transformSale(s: any): Sale {
    return {
      ...s,
      total_amount: s.total_amount / 100
    }
  }

  private transformItem(i: any): SaleItem {
    return {
      ...i,
      unit_price: i.unit_price / 100,
      subtotal: i.subtotal / 100
    }
  }

  getAll(): Sale[] {
    const sales = this.db.prepare('SELECT * FROM sales ORDER BY sale_date DESC').all()
    return sales.map((s) => this.transformSale(s))
  }

  getById(id: number): Sale | undefined {
    const sale = this.db.prepare('SELECT * FROM sales WHERE id = ?').get(id)
    return sale ? this.transformSale(sale) : undefined
  }

  getItems(saleId: number): SaleItem[] {
    const items = this.db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(saleId)
    return items.map((i) => this.transformItem(i))
  }

  getDetailed(saleId: number) {
    const sale = this.getById(saleId)
    if (!sale) return undefined

    // Note: this query joins products, so be careful if products have prices we want to transform?
    // We only select product details (name, sku).
    const items = this.db
      .prepare(
        `
      SELECT si.*, p.name as product_name, p.sku as product_sku
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `
      )
      .all(saleId)

    // items from this query have si.* which includes prices
    return {
      ...sale,
      items: items.map((i) => this.transformItem(i))
    }
  }
}
