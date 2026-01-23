import { ElectronAPI } from '@electron-toolkit/preload'
import { Product, Sale, SaleItem, Supplier, Purchase, PurchaseItem, User } from '../shared/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      auth: {
        login: (username: string, password: string) => Promise<{ user: User; token: string }>
        logout: (token: string) => Promise<boolean>
        validateToken: (token: string) => Promise<User>
        getCurrentUser: (token: string) => Promise<User>
      }
      users: {
        create: (data: {
          username: string
          email: string
          password: string
          fullName?: string
          role?: 'admin' | 'manager' | 'cashier'
        }) => Promise<User>
        getAll: () => Promise<User[]>
        getById: (id: number) => Promise<User | undefined>
        update: (id: number, data: Partial<User>) => Promise<User>
        delete: (id: number) => Promise<boolean>
        changePassword: (id: number, newPassword: string) => Promise<{ success: boolean }>
        deactivate: (id: number) => Promise<{ success: boolean }>
        activate: (id: number) => Promise<{ success: boolean }>
      }
      products: {
        getAll: () => Promise<Product[]>
        getById: (id: number) => Promise<Product | undefined>
        create: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<Product>
        update: (id: number, data: Partial<Product>) => Promise<boolean>
        delete: (id: number) => Promise<boolean>
        search: (query: string) => Promise<Product[]>
        getLowStock: () => Promise<Product[]>
      }
      sales: {
        create: (payload: {
          sale: Omit<Sale, 'id' | 'created_at' | 'sale_date'>
          items: Omit<SaleItem, 'id' | 'sale_id'>[]
        }) => Promise<Sale>
        getAll: () => Promise<Sale[]>
        getDetailed: (
          id: number
        ) => Promise<Sale & { items: (SaleItem & { product_name: string; product_sku: string })[] }>
      }
      suppliers: {
        create: (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => Promise<Supplier>
        getAll: () => Promise<Supplier[]>
        getById: (id: number) => Promise<Supplier | undefined>
        update: (id: number, data: Partial<Supplier>) => Promise<boolean>
        delete: (id: number) => Promise<boolean>
        search: (query: string) => Promise<Supplier[]>
      }
      purchases: {
        create: (payload: {
          purchase: Omit<Purchase, 'id' | 'created_at' | 'updated_at' | 'purchase_date'>
          items: Omit<PurchaseItem, 'id' | 'purchase_id'>[]
        }) => Promise<Purchase & { items: any[] }>
        getAll: () => Promise<Purchase[]>
        getDetailed: (id: number) => Promise<(Purchase & { items: any[] }) | undefined>
      }
      inventory: {
        getAlerts: () => Promise<{
          count: number
          items: { id: number; name: string; current: number; min: number }[]
        }>
        getRecommendations: () => Promise<
          {
            product: Product
            suggestedOrder: number
            reason: string
            urgency: 'critical' | 'high' | 'medium'
            profitImpact?: string
          }[]
        >
        getAllMetrics: () => Promise<any[]>
        adjustStock: (data: {
          productId: number
          adjustment: number
          reason: string
        }) => Promise<boolean>
      }
    }
  }
}
