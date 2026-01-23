import { useForm, Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Product } from '../../../shared/types'
import { useEffect } from 'react'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().optional(),
  category_id: z.coerce.number().optional(),
  supplier_id: z.coerce.number().optional(),
  buying_price: z.coerce.number().min(0, 'Must be positive'),
  selling_price: z.coerce.number().min(0, 'Must be positive'),
  current_stock: z.coerce.number().int().min(0, 'Must be positive'),
  minimum_stock_level: z.coerce.number().int().min(0, 'Must be positive'),
  unit_of_measurement: z.string().default('pcs'),
  description: z.string().optional()
})

// Explicitly typing the schema inferrence to avoid compatibility issues with resolver
export type ProductFormValues = {
  name: string
  sku?: string
  category_id?: number
  supplier_id?: number
  buying_price: number
  selling_price: number
  current_stock: number
  minimum_stock_level: number
  unit_of_measurement: string
  description?: string
}

interface ProductFormProps {
  initialData?: Product
  onSubmit: (data: ProductFormValues) => void
  onCancel: () => void
}

export function ProductForm({ initialData, onSubmit, onCancel }: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormValues>,
    defaultValues: {
      name: '',
      sku: '',
      buying_price: 0,
      selling_price: 0,
      current_stock: 0,
      minimum_stock_level: 5,
      unit_of_measurement: 'pcs',
      description: ''
    }
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        sku: initialData.sku || '',
        category_id: initialData.category_id,
        supplier_id: initialData.supplier_id,
        buying_price: initialData.buying_price,
        selling_price: initialData.selling_price,
        current_stock: initialData.current_stock,
        minimum_stock_level: initialData.minimum_stock_level,
        unit_of_measurement: initialData.unit_of_measurement,
        description: initialData.description || ''
      })
    }
  }, [initialData, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Product Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="SKU" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unit_of_measurement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. pcs, kg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="buying_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buying Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="selling_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selling Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="current_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Stock</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minimum_stock_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Stock Level</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Product</Button>
        </div>
      </form>
    </Form>
  )
}
