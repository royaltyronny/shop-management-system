import { z } from 'zod'

export const ProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.preprocess((val) => (val === '' ? undefined : val), z.string().optional()),
  sku: z.preprocess((val) => (val === '' ? undefined : val), z.string().optional()),
  category_id: z.preprocess(
    (val) =>
      val === '' || val === null || (typeof val === 'number' && isNaN(val)) ? undefined : val,
    z.number().optional()
  ),
  supplier_id: z.preprocess(
    (val) =>
      val === '' || val === null || (typeof val === 'number' && isNaN(val)) ? undefined : val,
    z.number().optional()
  ),
  buying_price: z.number().min(0),
  selling_price: z.number().min(0),
  current_stock: z.number().int().min(0),
  minimum_stock_level: z.number().int().min(0),
  unit_of_measurement: z.string().min(1).default('pcs')
})

export const SaleItemSchema = z.object({
  product_id: z.number(),
  quantity: z.number().int().min(1),
  unit_price: z.number().min(0),
  subtotal: z.number().min(0)
})

export const SaleSchema = z.object({
  total_amount: z.number().min(0),
  payment_method: z.enum(['CASH', 'CARD', 'MOBILE_MONEY']),
  customer_name: z.string().optional()
})

export const CreateSaleSchema = z.object({
  sale: SaleSchema,
  items: z.array(SaleItemSchema).min(1, 'At least one item is required')
})

export const SupplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional()
})

export const PurchaseItemSchema = z.object({
  product_id: z.number(),
  quantity: z.number().int().min(1),
  unit_price: z.number().min(0),
  subtotal: z.number().min(0)
})

export const PurchaseSchema = z.object({
  supplier_id: z.number().optional(),
  total_amount: z.number().min(0),
  status: z.enum(['PENDING', 'RECEIVED', 'CANCELLED'])
})

export const CreatePurchaseSchema = z.object({
  purchase: PurchaseSchema,
  items: z.array(PurchaseItemSchema).min(1, 'At least one item is required')
})

export const SettingsSchema = z.record(z.string(), z.any())
