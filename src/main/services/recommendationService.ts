import { ProductRepository } from '../database/repositories/productRepository'
import { Product } from '../../shared/types'

export interface Recommendation {
  product: Product
  suggestedOrder: number
  reason: string
  urgency: 'critical' | 'high' | 'medium'
  profitImpact?: string
}

export class RecommendationService {
  private productRepo: ProductRepository

  constructor() {
    this.productRepo = new ProductRepository()
  }

  generateRecommendations(): Recommendation[] {
    const products = this.productRepo.getAll()
    const recommendations: Recommendation[] = []

    for (const product of products) {
      const metrics = this.productRepo.getProductMetrics(product.id)

      // Critical: Stock below minimum level
      if (product.current_stock <= product.minimum_stock_level) {
        const targetStock = Math.max(product.minimum_stock_level * 3, 10)
        const suggestedOrder = targetStock - product.current_stock

        recommendations.push({
          product,
          suggestedOrder,
          reason: `Stock critically low (${product.current_stock}/${product.minimum_stock_level})`,
          urgency: 'critical',
          profitImpact: `Margin: ${metrics.profitMargin}`
        })
      }
      // High: Stock within 50% of minimum and has good sales velocity
      else if (
        product.current_stock <= product.minimum_stock_level * 1.5 &&
        metrics.monthlyTurnover > 0
      ) {
        const targetStock = product.minimum_stock_level * 2.5
        const suggestedOrder = Math.ceil(targetStock - product.current_stock)

        recommendations.push({
          product,
          suggestedOrder,
          reason: `High velocity (${metrics.monthlyTurnover} units/month), stock approaching minimum`,
          urgency: 'high',
          profitImpact: `Margin: ${metrics.profitMargin}`
        })
      }
      // Medium: Low velocity items that may need rebalancing
      else if (
        metrics.daysSinceLastMovement > 60 &&
        product.current_stock > product.minimum_stock_level * 2
      ) {
        const suggestedOrder = -Math.floor(product.current_stock * 0.2)

        recommendations.push({
          product,
          suggestedOrder,
          reason: `Low velocity (no sales in ${metrics.daysSinceLastMovement} days), consider reducing stock`,
          urgency: 'medium',
          profitImpact: `Free up capital: ${(suggestedOrder * product.buying_price).toFixed(2)}`
        })
      }
    }

    // Sort by urgency and potential impact
    return recommendations.sort((a, b) => {
      const urgencyOrder = { critical: 0, high: 1, medium: 2 }
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    })
  }
}
