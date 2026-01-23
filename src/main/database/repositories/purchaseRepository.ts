import { Database } from 'better-sqlite3'
import { getDatabase } from '../connection'
import { Purchase, PurchaseItem } from '../../../shared/types'

export class PurchaseRepository {
  private db: Database

  constructor(db?: Database) {
    this.db = db || getDatabase()
  }

  create(
    purchase: Omit<Purchase, 'id' | 'created_at' | 'updated_at' | 'purchase_date'>,
    items: Omit<PurchaseItem, 'id' | 'purchase_id'>[]
  ): Purchase {
    const createPurchase = this.db.transaction(() => {
      // 1. Insert Purchase
      const purchaseStmt = this.db.prepare(`
        INSERT INTO purchases (supplier_id, total_amount, status)
        VALUES (@supplier_id, @total_amount, @status)
      `)
      const purchaseInfo = purchaseStmt.run(purchase)
      const purchaseId = Number(purchaseInfo.lastInsertRowid)

      // 2. Insert Items and Update Stock
      const itemStmt = this.db.prepare(`
        INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_price, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `)

      const stockStmt = this.db.prepare(`
        UPDATE products SET current_stock = current_stock + ?, buying_price = ? WHERE id = ?
      `)

      const movementStmt = this.db.prepare(`
        INSERT INTO stock_movements (product_id, movement_type, quantity, reference_id, notes)
        VALUES (?, 'IN', ?, ?, ?)
      `)

      for (const item of items) {
        itemStmt.run(purchaseId, item.product_id, item.quantity, item.unit_price, item.subtotal)

        // Update stock and buying price (moving average or last price)
        stockStmt.run(item.quantity, item.unit_price, item.product_id)

        // Record movement
        movementStmt.run(
          item.product_id,
          item.quantity,
          purchaseId,
          `Purchase #${purchaseId} received`
        )
      }

      return purchaseId
    })

    const newPurchaseId = createPurchase()
    return this.getDetailed(newPurchaseId)!
  }

  getAll(): Purchase[] {
    return this.db
      .prepare(
        `
      SELECT p.*, s.name as supplier_name 
      FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.purchase_date DESC
    `
      )
      .all() as Purchase[]
  }

  getById(id: number): Purchase | undefined {
    return this.db.prepare('SELECT * FROM purchases WHERE id = ?').get(id) as Purchase | undefined
  }

  getDetailed(id: number): (Purchase & { items: any[] }) | undefined {
    const purchase = this.db
      .prepare(
        `
      SELECT p.*, s.name as supplier_name 
      FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = ?
    `
      )
      .get(id) as any

    if (!purchase) return undefined

    const items = this.db
      .prepare(
        `
      SELECT pi.*, pr.name as product_name, pr.sku as product_sku
      FROM purchase_items pi
      JOIN products pr ON pi.product_id = pr.id
      WHERE pi.purchase_id = ?
    `
      )
      .all(id)

    return { ...purchase, items }
  }
}
