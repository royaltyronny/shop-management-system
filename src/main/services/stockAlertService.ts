import { ProductRepository } from '../database/repositories/productRepository'
import { Product } from '../../shared/types'

export class StockAlertService {
  private productRepo: ProductRepository

  constructor() {
    this.productRepo = new ProductRepository()
  }

  getLowStockProducts(): Product[] {
    return this.productRepo.getLowStock()
  }

  getAlertSummary() {
    const lowStock = this.getLowStockProducts()
    return {
      count: lowStock.length,
      items: lowStock.map((p) => ({
        id: p.id,
        name: p.name,
        current: p.current_stock,
        min: p.minimum_stock_level
      }))
    }
  }
}
