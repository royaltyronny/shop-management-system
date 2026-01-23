import { useEffect, useState } from 'react'
import { Product } from '../../../shared/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Search, Trash2, Edit, Filter, Download, AlertCircle, Package } from 'lucide-react'
import { ProductForm, ProductFormValues } from '../components/ProductForm'
import { cn } from '@/lib/utils'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await window.api.products.getAll()
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = await window.api.products.search(query)
      setProducts(results)
    } else {
      loadProducts()
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await window.api.products.delete(id)
      loadProducts()
      // Trigger inventory refresh
      window.dispatchEvent(new CustomEvent('inventory-update'))
    }
  }

  const handleSave = async (data: ProductFormValues) => {
    try {
      if (editingProduct) {
        await window.api.products.update(editingProduct.id, data)
      } else {
        await window.api.products.create(data)
      }
      setIsDialogOpen(false)
      loadProducts()
      // Trigger inventory refresh
      window.dispatchEvent(new CustomEvent('inventory-update'))
    } catch (error) {
      console.error('Failed to save product:', error)
      alert('Failed to save product')
    }
  }

  const openAddDialog = () => {
    setEditingProduct(undefined)
    setIsDialogOpen(true)
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  return (
    <div className="h-full flex flex-col gap-10 overflow-hidden animate-entrance selection:bg-primary/20">
      <div className="flex justify-between items-end shrink-0">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-foreground">
            Catalog Management
          </h1>
          <p className="text-muted-foreground font-medium text-lg italic">
            Your master registry of premium products and stock levels.
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="h-14 px-6 rounded-2xl border-white/20 hover:bg-white/10 transition-all font-bold gap-2"
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button
            className="h-14 px-8 rounded-2xl font-black gap-2 shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
            onClick={openAddDialog}
          >
            <Plus className="h-5 w-5" /> Add New Product
          </Button>
        </div>
      </div>

      <Card className="border-white/20 bg-white/40 backdrop-blur-3xl shadow-2xl flex-1 flex flex-col overflow-hidden rounded-3xl">
        <CardHeader className="p-6 border-b border-white/10 flex flex-row items-center justify-between shrink-0 bg-white/5">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative max-w-md w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60 group-focus-within:text-foreground transition-colors" />
              <Input
                placeholder="Search name, SKU, or category..."
                className="pl-12 h-14 bg-white/20 border-white/10 focus:bg-white/40 focus:ring-0 focus:border-white/30 transition-all rounded-2xl font-medium placeholder:text-muted-foreground/50"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="h-10 w-px bg-white/10 mx-2" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Total:
              </span>
              <span className="px-3 py-1 bg-white/20 text-foreground rounded-xl font-black text-sm tabular-nums shadow-sm border border-white/10">
                {products.length}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-xl hover:bg-white/10 hover:text-foreground"
            >
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 overflow-auto scrollbar-hide">
          <Table>
            <TableHeader className="bg-white/10 sticky top-0 z-10 backdrop-blur-md">
              <TableRow className="hover:bg-transparent border-white/5 h-12">
                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-muted-foreground w-[40%]">
                  Product Detail
                </TableHead>
                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                  Category
                </TableHead>
                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-muted-foreground text-right">
                  Inventory
                </TableHead>
                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-muted-foreground text-right">
                  MSRP
                </TableHead>
                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-muted-foreground text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell className="px-8 py-4">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-3/4 bg-white/10" />
                        <Skeleton className="h-4 w-1/4 bg-white/5" />
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-4">
                      <Skeleton className="h-6 w-24 rounded-full bg-white/5" />
                    </TableCell>
                    <TableCell className="px-8 py-4">
                      <div className="flex flex-col items-end space-y-2">
                        <Skeleton className="h-5 w-12 bg-white/10" />
                        <Skeleton className="h-3 w-20 bg-white/5" />
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-4">
                      <div className="flex justify-end">
                        <Skeleton className="h-6 w-16 bg-white/10" />
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-4">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-10 w-10 rounded-xl bg-white/5" />
                        <Skeleton className="h-10 w-10 rounded-xl bg-white/5" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-96">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                        <Package className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <p className="font-black uppercase tracking-[0.2em] text-sm text-muted-foreground">
                        No products found
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product, idx) => (
                  <TableRow
                    key={product.id}
                    className="border-white/5 hover:bg-white/10 transition-colors animate-entrance group"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <TableCell className="px-8 py-5">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                          {product.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-bold tracking-wider text-muted-foreground border-white/10 bg-white/5 uppercase"
                          >
                            {product.sku || 'NO SKU'}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-5">
                      <Badge
                        variant="secondary"
                        className="bg-white/10 text-foreground hover:bg-white/20 border-transparent text-[10px] font-bold tracking-wider uppercase"
                      >
                        {product.category_id || 'General'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-8 py-5 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <span
                          className={cn(
                            'font-black text-lg tabular-nums',
                            product.current_stock <= product.minimum_stock_level
                              ? 'text-destructive'
                              : 'text-foreground'
                          )}
                        >
                          {product.current_stock}
                        </span>
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                            MIN: {product.minimum_stock_level} {product.unit_of_measurement}
                          </span>
                        </div>
                        {product.current_stock <= product.minimum_stock_level && (
                          <Badge variant="destructive" className="h-5 px-1.5 gap-1 shadow-sm">
                            <AlertCircle className="h-3 w-3" />
                            <span className="text-[9px] font-black uppercase tracking-tighter">
                              Low Stock
                            </span>
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-5 text-right">
                      <span className="inline-block px-3 py-1 rounded-lg bg-green-500/10 text-green-600 font-black tracking-tight tabular-nums border border-green-500/20">
                        ${product.selling_price.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 pr-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl hover:bg-white/20 hover:text-primary transition-all"
                          onClick={() => openEditDialog(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="p-8 border-b border-black/5 bg-white/50">
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
              {editingProduct ? (
                <>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Edit className="h-5 w-5" />
                  </div>
                  Update Product
                </>
              ) : (
                <>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Plus className="h-5 w-5" />
                  </div>
                  New Registry Entry
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="p-8">
            <ProductForm
              initialData={editingProduct}
              onSubmit={handleSave}
              onCancel={() => setIsDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
