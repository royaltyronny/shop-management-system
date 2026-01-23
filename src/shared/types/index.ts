export interface Category {
  id: number
  name: string
  description?: string
  created_at: string
}

export interface Supplier {
  id: number
  name: string
  contact_person?: string
  phone?: string
  email?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: number
  name: string
  description?: string
  sku?: string
  category_id?: number
  supplier_id?: number
  buying_price: number
  selling_price: number
  current_stock: number
  minimum_stock_level: number
  unit_of_measurement: string
  created_at: string
  updated_at: string
}

export interface Sale {
  id: number
  sale_date: string
  total_amount: number
  payment_method: 'CASH' | 'CARD' | 'MOBILE_MONEY'
  customer_name?: string
  created_at: string
}

export interface SaleItem {
  id: number
  sale_id: number
  product_id: number
  quantity: number
  unit_price: number
  subtotal: number
}

export interface StockMovement {
  id: number
  product_id: number
  movement_type: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  reference_id?: number
  notes?: string
  created_at: string
}

export interface Purchase {
  id: number
  supplier_id?: number
  purchase_date: string
  total_amount: number
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED'
  created_at: string
  updated_at: string
}

export interface PurchaseItem {
  id: number
  purchase_id: number
  product_id: number
  quantity: number
  unit_price: number
  subtotal: number
}
export interface User {
  id: number
  username: string
  email: string
  full_name?: string
  role: 'admin' | 'manager' | 'cashier'
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface AuthUser extends Omit<User, 'password_hash'> {}