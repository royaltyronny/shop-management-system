import { useEffect, useState } from 'react'
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Search,
  Plus,
  FileStack,
  Calendar,
  User,
  Package,
  Trash2,
  CheckCircle2
} from 'lucide-react'
import { Purchase, Product, Supplier } from '../../../shared/types'
import { format } from 'date-fns'

interface NewPurchaseItem {
  product_id: number
  name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // New Purchase State
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')
  const [currentCart, setCurrentCart] = useState<NewPurchaseItem[]>([])
  const [searchProductQuery, setSearchProductQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])

  const loadData = async () => {
    const [purchData, suppData] = await Promise.all([
      window.api.purchases.getAll(),
      window.api.suppliers.getAll()
    ])
    setPurchases(purchData)
    setSuppliers(suppData)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleProductSearch = async (query: string) => {
    setSearchProductQuery(query)
    if (query.trim()) {
      const results = await window.api.products.search(query)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  const addToCart = (product: Product) => {
    const existing = currentCart.find((item) => item.product_id === product.id)
    if (existing) {
      setCurrentCart(
        currentCart.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unit_price
              }
            : item
        )
      )
    } else {
      setCurrentCart([
        ...currentCart,
        {
          product_id: product.id,
          name: product.name,
          quantity: 1,
          unit_price: product.buying_price || 0,
          subtotal: product.buying_price || 0
        }
      ])
    }
    setSearchProductQuery('')
    setSearchResults([])
  }

  const updateCartItem = (index: number, field: keyof NewPurchaseItem, value: number) => {
    const newCart = [...currentCart]
    const item = { ...newCart[index], [field]: value }
    item.subtotal = item.quantity * item.unit_price
    newCart[index] = item
    setCurrentCart(newCart)
  }

  const removeFromCart = (index: number) => {
    setCurrentCart(currentCart.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    return currentCart.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const handleCreatePurchase = async () => {
    if (!selectedSupplier || currentCart.length === 0) return

    await window.api.purchases.create({
      purchase: {
        supplier_id: Number(selectedSupplier),
        total_amount: calculateTotal(),
        status: 'RECEIVED'
      },
      items: currentCart.map(({ product_id, quantity, unit_price, subtotal }) => ({
        product_id,
        quantity,
        unit_price,
        subtotal
      }))
    })

    setIsDialogOpen(false)
    setSelectedSupplier('')
    setCurrentCart([])
    loadData()
  }

  return (
    <div className="p-10 space-y-12 animate-entrance overflow-auto h-screen pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <FileStack className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-gradient">Procurement</h1>
          </div>
          <p className="text-muted-foreground font-medium text-lg max-w-2xl italic">
            Track and manage purchase orders to keep your inventory healthy and profitable.
          </p>
        </div>

        <Button
          onClick={() => setIsDialogOpen(true)}
          className="h-14 px-8 rounded-2xl font-black gap-2 shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all bg-primary"
        >
          <Plus className="h-6 w-6" />
          Create Order
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 glass-premium border-none shadow-none overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5 bg-white/5">
            <CardTitle className="text-2xl font-black">Order Registry</CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary/60 italic">
              Historical procurement records
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-white/5 h-14">
                  <TableHead className="pl-8 font-black text-xs uppercase tracking-widest">
                    Date
                  </TableHead>
                  <TableHead className="font-black text-xs uppercase tracking-widest">
                    Supplier
                  </TableHead>
                  <TableHead className="font-black text-xs uppercase tracking-widest text-center">
                    Amount
                  </TableHead>
                  <TableHead className="font-black text-xs uppercase tracking-widest text-right pr-8">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-64 text-center">
                      <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <FileStack className="h-12 w-12 opacity-20" />
                        <p className="text-xl font-bold">No purchase orders found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  purchases.map((purchase) => (
                    <TableRow
                      key={purchase.id}
                      className="border-white/5 hover:bg-white/5 transition-colors h-20 group"
                    >
                      <TableCell className="pl-8">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground opacity-50" />
                          <span className="font-bold">
                            {format(new Date(purchase.purchase_date), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary/40" />
                          <span className="font-black">
                            {(purchase as any).supplier_name || 'Generic Vendor'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-black text-primary">
                        ${purchase.total_amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                          {purchase.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="glass-premium border-none shadow-none">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black">Stock Insights</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="p-6 rounded-[24px] bg-primary/5 border border-primary/10 flex flex-col gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-primary/60">
                  Total Spending
                </span>
                <span className="text-3xl font-black">
                  ${purchases.reduce((sum, p) => sum + p.total_amount, 0).toLocaleString()}
                </span>
              </div>
              <div className="p-6 rounded-[24px] bg-green-500/5 border border-green-500/10 flex flex-col gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-green-500/60">
                  Recent Orders
                </span>
                <span className="text-3xl font-black">{purchases.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl glass-premium border-none shadow-2xl p-0 outline-none overflow-hidden max-h-[85vh] flex flex-col">
          <DialogHeader className="p-10 pb-6 border-b border-white/5 bg-white/5">
            <DialogTitle className="text-4xl font-black tracking-tighter text-gradient leading-tight flex items-center gap-4">
              <Plus className="h-10 w-10 text-primary" />
              Strategic Procurement
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
            {/* Left side: Selection */}
            <div className="w-full lg:w-[400px] border-r border-white/5 p-8 space-y-8 flex flex-col min-h-0">
              <div className="space-y-4">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Select Supplier
                </label>
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger className="h-14 bg-white/10 border-white/5 rounded-2xl font-black focus:ring-4 focus:ring-primary/10 transition-all">
                    <SelectValue placeholder="Choosing partner..." />
                  </SelectTrigger>
                  <SelectContent className="glass-premium border-white/10 p-2">
                    {suppliers.map((s) => (
                      <SelectItem
                        key={s.id}
                        value={s.id.toString()}
                        className="rounded-xl font-bold py-3 hover:bg-primary/10 transition-colors"
                      >
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Catalog Search
                </label>
                <div className="relative group shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search products..."
                    value={searchProductQuery}
                    onChange={(e) => handleProductSearch(e.target.value)}
                    className="h-14 pl-12 bg-white/10 border-white/5 rounded-2xl focus:bg-white/20 transition-all font-bold"
                  />
                </div>

                <div className="flex-1 overflow-auto space-y-2 mt-4 pr-2 custom-scrollbar">
                  {searchResults.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="p-4 rounded-2xl bg-white/5 hover:bg-primary/10 border border-white/5 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex flex-col">
                        <span className="font-black text-sm group-hover:text-primary transition-colors">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">
                          {p.sku || 'No SKU'}
                        </span>
                      </div>
                      <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                  {searchProductQuery && searchResults.length === 0 && (
                    <p className="text-center text-xs font-bold text-muted-foreground pt-4">
                      No results found
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Items List */}
            <div className="flex-1 p-8 flex flex-col min-h-0">
              <div className="flex-1 overflow-auto space-y-4 pr-4 custom-scrollbar">
                {currentCart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-30 gap-4">
                    <Package className="h-16 w-16" />
                    <p className="font-black text-xl">Order is empty</p>
                  </div>
                ) : (
                  currentCart.map((item, index) => (
                    <div
                      key={item.product_id}
                      className="p-6 rounded-[32px] bg-white/5 border border-white/5 grid grid-cols-12 gap-6 items-center animate-entrance"
                    >
                      <div className="col-span-4 flex flex-col gap-1">
                        <span className="font-black text-lg truncate">{item.name}</span>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                          Procurement
                        </span>
                      </div>
                      <div className="col-span-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2 text-center">
                          Quantity
                        </label>
                        <div className="flex items-center justify-center gap-3">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateCartItem(index, 'quantity', Number(e.target.value))
                            }
                            className="h-10 w-20 text-center bg-white/10 border-white/5 rounded-xl font-bold"
                          />
                        </div>
                      </div>
                      <div className="col-span-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2 text-center">
                          Unit Price
                        </label>
                        <Input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) =>
                            updateCartItem(index, 'unit_price', Number(e.target.value))
                          }
                          className="h-10 w-full text-center bg-white/10 border-white/5 rounded-xl font-bold"
                        />
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(index)}
                          className="h-12 w-12 rounded-2xl hover:bg-red-500/20 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-muted-foreground uppercase tracking-widest">
                    Grand Total
                  </span>
                  <span className="text-4xl font-black leading-none">
                    ${calculateTotal().toLocaleString()}
                  </span>
                </div>
                <Button
                  disabled={!selectedSupplier || currentCart.length === 0}
                  onClick={handleCreatePurchase}
                  className="h-20 px-12 rounded-[28px] font-black gap-4 shadow-2xl shadow-primary/30 hover:scale-[1.05] active:scale-95 transition-all text-xl bg-primary disabled:opacity-20 translate-y-2"
                >
                  Confirm Procurement
                  <CheckCircle2 className="h-8 w-8" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
