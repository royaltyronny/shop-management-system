import { Database } from 'better-sqlite3'
import { Product } from '../../../shared/types'
import { getDatabase } from '../connection'

export class ProductRepository {
  private db: Database

  constructor(db?: Database) {
    this.db = db || getDatabase()
  }

  create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Product {
    const stmt = this.db.prepare(`
      INSERT INTO products (
        name, description, sku, category_id, supplier_id, 
        buying_price, selling_price, current_stock, 
        minimum_stock_level, unit_of_measurement
      ) VALUES (
        @name, @description, @sku, @category_id, @supplier_id,
        @buying_price, @selling_price, @current_stock,
        @minimum_stock_level, @unit_of_measurement
      )
    `)

    const info = stmt.run({
      category_id: null,
      supplier_id: null,
      description: null,
      sku: null,
      ...product,
      buying_price: Math.round(product.buying_price * 100),
      selling_price: Math.round(product.selling_price * 100)
    })
    return this.getById(info.lastInsertRowid as number)!
  }

  private transformProduct(p: any): Product {
    return {
      ...p,
      buying_price: p.buying_price / 100,
      selling_price: p.selling_price / 100
    }
  }

  getAll(): Product[] {
    const products = this.db.prepare('SELECT * FROM products ORDER BY name').all()
    return products.map((p: any) => this.transformProduct(p))
  }

  getById(id: number): Product | undefined {
    const product = this.db.prepare('SELECT * FROM products WHERE id = ?').get(id)
    return product ? this.transformProduct(product) : undefined
  }

  update(id: number, product: Partial<Product>): boolean {
    const data = { ...product }

    // Convert prices if present
    if (data.buying_price !== undefined) data.buying_price = Math.round(data.buying_price * 100)
    if (data.selling_price !== undefined) data.selling_price = Math.round(data.selling_price * 100)

    const fields = Object.keys(data)
      .filter((key) => key !== 'id' && key !== 'created_at')
      .map((key) => `${key} = @${key}`)
      .join(', ')

    if (!fields) return false

    const stmt = this.db.prepare(`
      UPDATE products 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = @id
    `)

    const info = stmt.run({ ...data, id })
    return info.changes > 0
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM products WHERE id = ?')
    const info = stmt.run(id)
    return info.changes > 0
  }

  search(query: string): Product[] {
    const term = `%${query}%`
    const products = this.db
      .prepare(
        `
      SELECT * FROM products 
      WHERE name LIKE ? OR sku LIKE ? OR description LIKE ?
    `
      )
      .all(term, term, term)

    return products.map((p: any) => this.transformProduct(p))
  }

  getLowStock(): Product[] {
    const products = this.db
      .prepare(
        `
      SELECT * FROM products 
      WHERE current_stock <= minimum_stock_level
    `
      )
      .all()

    return products.map((p: any) => this.transformProduct(p))
  }

  adjustStock(id: number, adjustment: number, reason: string): Product | null {
    const product = this.getById(id)
    if (!product) return null

    const newStock = Math.max(0, product.current_stock + adjustment)

    this.db
      .prepare(
        `
      INSERT INTO stock_movements (product_id, movement_type, quantity, notes)
      VALUES (?, ?, ?, ?)
    `
      )
      .run(id, 'ADJUSTMENT', Math.abs(adjustment), `${adjustment > 0 ? '+' : ''}${adjustment} - ${reason}`)

    this.update(id, { current_stock: newStock })
    return this.getById(id) || null
  }

  getStockMovementHistory(productId: number, limit = 50): any[] {
    return this.db
      .prepare(
        `
      SELECT * FROM stock_movements 
      WHERE product_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `
      )
      .all(productId, limit)
  }

  getProductMetrics(productId: number): any {
    const product = this.getById(productId)
    if (!product) return null

    const movements = this.getStockMovementHistory(productId, 30)
    const outMovements = movements.filter((m) => m.movement_type === 'OUT' || m.movement_type === 'ADJUSTMENT')
    const lastMovement = movements[0]?.created_at

    const totalOutflow = outMovements.reduce((sum, m) => sum + m.quantity, 0)
    const daysSinceLastMovement = lastMovement
      ? Math.floor((new Date().getTime() - new Date(lastMovement).getTime()) / (1000 * 60 * 60 * 24))
      : 0

    return {
      productId,
      productName: product.name,
      currentStock: product.current_stock,
      minimumStock: product.minimum_stock_level,
      daysOfSupply: product.current_stock > 0 ? Math.ceil((product.current_stock * 30) / (totalOutflow || 1)) : 0,
      monthlyTurnover: totalOutflow,
      daysSinceLastMovement,
      profitMargin: ((product.selling_price - product.buying_price) / product.selling_price * 100).toFixed(1) + '%',
      stockHealth: this.getStockHealth(product.current_stock, product.minimum_stock_level)
    }
  }

  private getStockHealth(current: number, minimum: number): 'critical' | 'warning' | 'healthy' {
    if (current <= minimum) return 'critical'
    if (current <= minimum * 1.5) return 'warning'
    return 'healthy'
  }

  getAllMetrics(): any[] {
    const products = this.getAll()
    return products
      .map((p) => this.getProductMetrics(p.id))
      .filter((m) => m !== null)
      .sort((a, b) => {
        // Sort by stock health (critical first) then by days of supply
        const healthOrder = { critical: 0, warning: 1, healthy: 2 }
        const healthDiff = healthOrder[a.stockHealth] - healthOrder[b.stockHealth]
        return healthDiff !== 0 ? healthDiff : a.daysOfSupply - b.daysOfSupply
      })
  }
}
