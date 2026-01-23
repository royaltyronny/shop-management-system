import { ipcMain } from 'electron'
import { ZodError } from 'zod'
import { ProductRepository } from '../database/repositories/productRepository'
import { SaleRepository } from '../database/repositories/salesRepository'
import { SupplierRepository } from '../database/repositories/supplierRepository'
import { PurchaseRepository } from '../database/repositories/purchaseRepository'
import { UserRepository } from '../database/repositories/userRepository'
import { StockAlertService } from '../services/stockAlertService'
import { RecommendationService } from '../services/recommendationService'
import { AuthService } from '../services/authService'
import {
  ProductSchema,
  CreateSaleSchema,
  SupplierSchema,
  CreatePurchaseSchema,
  SettingsSchema
} from './validators'
import { SettingsRepository } from '../database/repositories/settingsRepository'

// Helper to wrap handlers with error handling
const handle = async <T>(operation: () => T) => {
  try {
    const data = await Promise.resolve(operation())
    return { success: true, data }
  } catch (error: unknown) {
    console.error('IPC Error:', error)

    let message = 'Unknown error occurred'

    if (error instanceof ZodError) {
      message = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
    } else if (error instanceof Error) {
      message = error.message
    }

    return { success: false, error: message }
  }
}

export function registerHandlers() {
  const productRepo = new ProductRepository()
  const saleRepo = new SaleRepository()
  const supplierRepo = new SupplierRepository()
  const purchaseRepo = new PurchaseRepository()
  const userRepo = new UserRepository()
  const authService = new AuthService(userRepo)
  const alertService = new StockAlertService()
  const recService = new RecommendationService()

  // Product Handlers
  ipcMain.handle('products:create', (_, raw) =>
    handle(() => {
      console.log('DEBUG: products:create called with:', raw)
      const data = ProductSchema.parse(raw)
      return productRepo.create(data)
    })
  )

  ipcMain.handle('products:getAll', () => handle(() => productRepo.getAll()))

  ipcMain.handle('products:getById', (_, id) => handle(() => productRepo.getById(id)))

  ipcMain.handle('products:update', (_, { id, data }) =>
    handle(() => {
      // Partial validation could be complex, for now we assume data is partial product
      // Ideally we should have a specific UpdateSchema
      return productRepo.update(id, data)
    })
  )

  ipcMain.handle('products:delete', (_, id) => handle(() => productRepo.delete(id)))

  ipcMain.handle('products:search', (_, query) => handle(() => productRepo.search(query)))

  ipcMain.handle('products:getLowStock', () => handle(() => productRepo.getLowStock()))

  // Sales Handlers
  ipcMain.handle('sales:create', (_, raw) =>
    handle(() => {
      const { sale, items } = CreateSaleSchema.parse(raw)
      return saleRepo.create(sale, items)
    })
  )

  ipcMain.handle('sales:getAll', () => handle(() => saleRepo.getAll()))

  ipcMain.handle('sales:getDetailed', (_, id) => handle(() => saleRepo.getDetailed(id)))

  // Inventory/Insights
  ipcMain.handle('inventory:getAlerts', () => handle(() => alertService.getAlertSummary()))

  ipcMain.handle('inventory:getRecommendations', () =>
    handle(() => recService.generateRecommendations())
  )

  ipcMain.handle('inventory:adjustStock', (_, { productId, adjustment, reason }) =>
    handle(() => {
      const result = productRepo.adjustStock(productId, adjustment, reason)
      if (!result) {
        throw new Error('Product not found')
      }
      return result
    })
  )

  ipcMain.handle('inventory:getMovementHistory', (_, { productId, limit }) =>
    handle(() => productRepo.getStockMovementHistory(productId, limit || 50))
  )

  ipcMain.handle('inventory:getMetrics', (_, productId) =>
    handle(() => productRepo.getProductMetrics(productId))
  )

  ipcMain.handle('inventory:getAllMetrics', () =>
    handle(() => productRepo.getAllMetrics())
  )

  // Supplier Handlers
  ipcMain.handle('suppliers:create', (_, raw) =>
    handle(() => {
      const data = SupplierSchema.parse(raw)
      return supplierRepo.create(data)
    })
  )

  ipcMain.handle('suppliers:getAll', () => handle(() => supplierRepo.getAll()))

  ipcMain.handle('suppliers:getById', (_, id) => handle(() => supplierRepo.getById(id)))

  ipcMain.handle('suppliers:update', (_, { id, data }) =>
    handle(() => supplierRepo.update(id, data))
  )

  ipcMain.handle('suppliers:delete', (_, id) => handle(() => supplierRepo.delete(id)))

  ipcMain.handle('suppliers:search', (_, query) => handle(() => supplierRepo.search(query)))

  // Purchase Handlers
  ipcMain.handle('purchases:create', (_, raw) =>
    handle(() => {
      const { purchase, items } = CreatePurchaseSchema.parse(raw)
      return purchaseRepo.create(purchase, items)
    })
  )

  ipcMain.handle('purchases:getAll', () => handle(() => purchaseRepo.getAll()))

  ipcMain.handle('purchases:getDetailed', (_, id) => handle(() => purchaseRepo.getDetailed(id)))

  // Settings Handlers
  const settingsRepo = new SettingsRepository()

  ipcMain.handle('settings:getAll', () => handle(() => settingsRepo.getAll()))

  ipcMain.handle('settings:update', (_, raw) =>
    handle(() => {
      const data = SettingsSchema.parse(raw)
      settingsRepo.upsertMany(data)
      return { success: true }
    })
  )

  // Auth Handlers
  ipcMain.handle('auth:login', (_, { username, password }) =>
    handle(() => {
      const result = authService.login(username, password)
      if (!result) {
        throw new Error('Invalid username or password')
      }
      return result
    })
  )

  ipcMain.handle('auth:logout', (_, token) => handle(() => authService.logout(token)))

  ipcMain.handle('auth:validateToken', (_, token) =>
    handle(() => {
      const user = authService.validateToken(token)
      if (!user) {
        throw new Error('Invalid or expired token')
      }
      return user
    })
  )

  ipcMain.handle('auth:getCurrentUser', (_, token) =>
    handle(() => {
      const user = authService.getCurrentUser(token)
      if (!user) {
        throw new Error('Session expired')
      }
      return user
    })
  )

  // User Management Handlers
  ipcMain.handle('users:create', (_, { username, email, password, fullName, role }) =>
    handle(() => {
      if (userRepo.usernameExists(username)) {
        throw new Error('Username already exists')
      }
      if (userRepo.emailExists(email)) {
        throw new Error('Email already exists')
      }
      return authService.createUser(username, email, password, fullName, role)
    })
  )

  ipcMain.handle('users:getAll', () => handle(() => authService.getAllUsers()))

  ipcMain.handle('users:getById', (_, id) => handle(() => authService.getUserById(id)))

  ipcMain.handle('users:update', (_, { id, data }) =>
    handle(() => {
      const success = authService.updateUser(id, data)
      if (!success) {
        throw new Error('Failed to update user')
      }
      return authService.getUserById(id)
    })
  )

  ipcMain.handle('users:delete', (_, id) => handle(() => authService.deleteUser(id)))

  ipcMain.handle('users:changePassword', (_, { id, newPassword }) =>
    handle(() => {
      const success = authService.changePassword(id, newPassword)
      if (!success) {
        throw new Error('Failed to change password')
      }
      return { success: true }
    })
  )

  ipcMain.handle('users:deactivate', (_, id) =>
    handle(() => {
      const success = authService.deactivateUser(id)
      if (!success) {
        throw new Error('Failed to deactivate user')
      }
      return { success: true }
    })
  )

  ipcMain.handle('users:activate', (_, id) =>
    handle(() => {
      const success = authService.activateUser(id)
      if (!success) {
        throw new Error('Failed to activate user')
      }
      return { success: true }
    })
  )
}
