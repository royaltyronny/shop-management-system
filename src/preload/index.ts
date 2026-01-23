import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Product, Sale, SaleItem, User } from '../shared/types'

import { ipcRenderer } from 'electron'

// Custom APIs for renderer
const invoke = async (channel: string, ...args: unknown[]) => {
  const res = await ipcRenderer.invoke(channel, ...args)
  if (!res.success) {
    throw new Error(res.error || 'Unknown error occurred')
  }
  return res.data
}

const api = {
  auth: {
    login: (username: string, password: string) => invoke('auth:login', { username, password }),
    logout: (token: string) => invoke('auth:logout', token),
    validateToken: (token: string) => invoke('auth:validateToken', token),
    getCurrentUser: (token: string) => invoke('auth:getCurrentUser', token)
  },
  users: {
    create: (data: {
      username: string
      email: string
      password: string
      fullName?: string
      role?: 'admin' | 'manager' | 'cashier'
    }) => invoke('users:create', data),
    getAll: () => invoke('users:getAll'),
    getById: (id: number) => invoke('users:getById', id),
    update: (id: number, data: Partial<User>) => invoke('users:update', { id, data }),
    delete: (id: number) => invoke('users:delete', id),
    changePassword: (id: number, newPassword: string) =>
      invoke('users:changePassword', { id, newPassword }),
    deactivate: (id: number) => invoke('users:deactivate', id),
    activate: (id: number) => invoke('users:activate', id)
  },
  products: {
    create: (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) =>
      invoke('products:create', data),
    getAll: () => invoke('products:getAll'),
    getById: (id: number) => invoke('products:getById', id),
    update: (id: number, data: Partial<Product>) => invoke('products:update', { id, data }),
    delete: (id: number) => invoke('products:delete', id),
    search: (query: string) => invoke('products:search', query),
    getLowStock: () => invoke('products:getLowStock')
  },
  sales: {
    create: (saleData: {
      sale: Omit<Sale, 'id' | 'created_at' | 'sale_date'>
      items: Omit<SaleItem, 'id' | 'sale_id'>[]
    }) => invoke('sales:create', saleData),
    getAll: () => invoke('sales:getAll'),
    getDetailed: (id: number) => invoke('sales:getDetailed', id)
  },
  suppliers: {
    create: (data: unknown) => invoke('suppliers:create', data),
    getAll: () => invoke('suppliers:getAll'),
    getById: (id: number) => invoke('suppliers:getById', id),
    update: (id: number, data: unknown) => invoke('suppliers:update', { id, data }),
    delete: (id: number) => invoke('suppliers:delete', id),
    search: (query: string) => invoke('suppliers:search', query)
  },
  purchases: {
    create: (data: unknown) => invoke('purchases:create', data),
    getAll: () => invoke('purchases:getAll'),
    getDetailed: (id: number) => invoke('purchases:getDetailed', id)
  },
  inventory: {
    getAlerts: () => invoke('inventory:getAlerts'),
    getRecommendations: () => invoke('inventory:getRecommendations'),
    getAllMetrics: () => invoke('inventory:getAllMetrics'),
    adjustStock: (data: { productId: number; adjustment: number; reason: string }) =>
      invoke('inventory:adjustStock', data)
  },
  settings: {
    getAll: () => invoke('settings:getAll'),
    update: (settings: Record<string, unknown>) => invoke('settings:update', settings)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
