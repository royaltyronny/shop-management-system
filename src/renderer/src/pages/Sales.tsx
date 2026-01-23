import { useState, useEffect, useRef, useCallback } from 'react'
import { Product } from '../../../shared/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card'
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  User,
  CheckCircle2,
  TrendingUp,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CartItem extends Product {
  quantity: number
}

interface Sale {
  id: number
  sale_date: string
  total_amount: number
  payment_method: string
  customer_name: string
  created_at: string
  items?: Array<{
    id: number
    quantity: number
    unit_price: number
    product_name: string
    product_sku: string
  }>
}

export default function SalesPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'MOBILE_MONEY'>('CASH')
  const [isProcessing, setIsProcessing] = useState(false)
  const [recentSales, setRecentSales] = useState<Sale[]>([])
  const [loadingSales, setLoadingSales] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)

  // Load recent sales
  const loadRecentSales = useCallback(async () => {
    setLoadingSales(true)
    try {
      const sales = await window.api.sales.getAll()
      const sortedSales = sales.sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime()).slice(0, 10)
      
      // Fetch detailed info (with items) for each sale
      const detailedSales = await Promise.all(
        sortedSales.map(sale => window.api.sales.getDetailed(sale.id))
      )
      
      setRecentSales(detailedSales.filter((sale) => sale !== undefined) as Sale[])
    } catch (error) {
      console.error('Failed to load sales:', error)
    } finally {
      setLoadingSales(false)
    }
  }, [])

  useEffect(() => {
    loadRecentSales()

    // Listen for sales updates
    const handleSalesUpdate = () => {
      loadRecentSales()
    }

    window.addEventListener('sales-update', handleSalesUpdate)
    return () => window.removeEventListener('sales-update', handleSalesUpdate)
  }, [])

  const handleSearch = useCallback(async () => {
    // Only search if query is meaningful or empty (to clear)
    if (searchQuery.length >= 0) {
      // Logic handled inside: if empty, handled by backend or clear
      if (searchQuery.trim().length === 0) {
        setSearchResults([])
        return
      }
      const results = await window.api.products.search(searchQuery)
      setSearchResults(results.filter((p) => p.current_stock > 0))
    }
  }, [searchQuery])

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      handleSearch()
    }, 300)
    return () => clearTimeout(timer)
  }, [handleSearch])

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        if (existing.quantity < product.current_stock) {
          toast({
            title: 'Updated Cart',
            description: `Increased quantity of ${product.name}`,
            duration: 1500
          })
          return prev.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        } else {
          toast({
            title: 'Stock Limit Reached',
            description: `Cannot add more ${product.name}. Max stock reached.`,
            variant: 'destructive'
          })
          return prev
        }
      }
      toast({
        title: 'Added to Cart',
        description: `${product.name} added to order.`,
        duration: 2000
      })
      return [...prev, { ...product, quantity: 1 }]
    })
    setSearchQuery('')
    searchInputRef.current?.focus()
  }

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta
          if (newQty < 1) return item // Prevent going below 1 via this button, maybe allow delete?

          if (newQty > item.current_stock) {
            toast({
              title: 'Stock Limit',
              description: 'Cannot exceed available stock.',
              variant: 'warning'
            })
            return item
          }
          return { ...item, quantity: newQty }
        }
        return item
      })
    )
  }

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.selling_price * item.quantity, 0)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setIsProcessing(true)

    try {
      const sale = {
        total_amount: calculateTotal(),
        payment_method: paymentMethod,
        customer_name: customerName || 'Walk-in Customer'
      }

      const items = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.selling_price,
        subtotal: item.selling_price * item.quantity
      }))

      const result = await window.api.sales.create({ sale, items })

      // Success feedback
      toast({
        title: 'Sale Completed Successfully!',
        description: `Order #${result.id} processed for $${sale.total_amount.toFixed(2)}`, // Assuming result has id
        variant: 'success',
        duration: 5000
      })

      setCart([])
      setCustomerName('')
      setSearchQuery('')
      
      // Trigger sales and inventory refresh
      window.dispatchEvent(new CustomEvent('sales-update'))
      window.dispatchEvent(new CustomEvent('inventory-update'))
    } catch (error) {
      console.error('Checkout failed:', error)
      toast({
        title: 'Transaction Failed',
        description: 'Could not process the sale. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="h-full flex flex-col gap-8 overflow-hidden animate-entrance selection:bg-primary/20">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Point of Sale</h1>
          <p className="text-muted-foreground mt-1 font-medium italic">
            Process orders and manage transactions seamlessly.
          </p>
        </div>
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden min-h-0">
        {/* Left: Product Search and Selection */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          <Card className="glass-premium border-none shadow-none shrink-0 group">
            <CardHeader className="p-6">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                <Input
                  ref={searchInputRef}
                  placeholder="Scan SKU or search products..."
                  className="pl-14 h-16 bg-white/40 border-white/20 focus:bg-white/60 focus:ring-0 focus:border-white/40 transition-all rounded-2xl text-lg font-medium placeholder:text-muted-foreground/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
          </Card>

          <div className={cn(
            'flex-1 overflow-hidden min-h-0',
            searchResults.length > 0 ? 'flex gap-6' : 'flex flex-col'
          )}>
            {/* Product Search Results */}
            {searchResults.length > 0 && (
              <div className="flex-1 relative overflow-hidden flex flex-col gap-4">
                <div className="flex flex-col gap-3 overflow-auto pr-4 pb-8 scrollbar-hide">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="glass-premium border-none p-4 text-left hover-lift glow-on-hover flex items-center justify-between group animate-entrance rounded-2xl transition-all hover:z-10 hover:relative"
                    >
                      <div className="flex-1 min-w-0 group-hover:min-w-full">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner group-hover:scale-110 transition-transform shrink-0">
                            {product.name.charAt(0)}
                          </div>
                          <div className="group-hover:min-w-full group-hover:flex-1">
                            <h3 className="font-black text-base group-hover:truncate-none group-hover:whitespace-normal leading-tight text-foreground group-hover:bg-white/20 group-hover:rounded group-hover:px-2 group-hover:py-1 truncate">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className="text-[9px] font-bold tracking-wider text-muted-foreground border-white/10 bg-white/5 uppercase shrink-0"
                              >
                                {product.sku || 'NO SKU'}
                              </Badge>
                              <span
                                className={cn(
                                  'text-[9px] font-black uppercase tracking-widest shrink-0',
                                  product.current_stock < 10 ? 'text-red-500' : 'text-green-600'
                                )}
                              >
                                {product.current_stock} in stock
                              </span>
                              <span className="text-[9px] font-bold text-muted-foreground/50 shrink-0">
                                ({product.unit_of_measurement})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 pl-4 shrink-0">
                        <span className="text-lg font-black text-primary tabular-nums">
                          ${product.selling_price.toFixed(2)}
                        </span>
                        <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-all">
                          <Plus className="h-5 w-5" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Sales - Shows on right when searching, below when not */}
            <Card className={cn(
              'glass-premium border-none shadow-none overflow-hidden rounded-3xl bg-white/60 flex flex-col',
              searchResults.length > 0 ? 'w-80 shrink-0' : 'w-full flex-1'
            )}>
              <CardHeader className="p-6 border-b border-black/5 flex flex-col gap-3 shrink-0 bg-white/20 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black">Recent Sales</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest">
                      Last 10 transactions
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-[10px] font-bold h-8 w-full"
                  onClick={loadRecentSales}
                >
                  Refresh
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-4 flex flex-col gap-2 scrollbar-hide">
                {loadingSales ? (
                  <div className="flex items-center justify-center h-20">
                    <div className="h-5 w-5 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : recentSales.length > 0 ? (
                  recentSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="p-3 bg-white/50 hover:bg-white/80 rounded-xl flex flex-col gap-2 transition-all border border-transparent hover:border-primary/10 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm truncate text-foreground">#{sale.id}</p>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[8px] font-bold h-5',
                              sale.payment_method === 'CASH'
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : sale.payment_method === 'CARD'
                                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                                  : 'bg-purple-100 text-purple-700 border-purple-200'
                            )}
                          >
                            {sale.payment_method}
                          </Badge>
                        </div>
                        <p className="font-black text-sm text-primary">
                          ${(sale.total_amount / 100).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-[10px] text-muted-foreground truncate font-bold">
                          {sale.customer_name}
                        </p>
                        {sale.items && sale.items.length > 0 && (
                          <div className="text-[9px] text-muted-foreground/80 space-y-0.5">
                            {sale.items.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="truncate">
                                • {item.product_name} x{item.quantity}
                              </div>
                            ))}
                            {sale.items.length > 2 && (
                              <div className="text-[8px] italic">+{sale.items.length - 2} more</div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-muted-foreground/70">
                        <Clock className="h-3 w-3" />
                        {new Date(sale.sale_date).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground opacity-50 text-sm font-bold">
                    No sales yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right: Cart and Checkout */}
        <div className="w-[450px] flex flex-col gap-6 overflow-hidden">
          <Card className="glass-premium border-none flex-1 flex flex-col shadow-none overflow-hidden rounded-3xl bg-white/60">
            <CardHeader className="p-8 border-b border-black/5 flex flex-row items-center justify-between shrink-0 bg-white/20 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black text-foreground">
                    Current Order
                  </CardTitle>
                  <CardDescription className="font-bold uppercase text-[10px] tracking-widest text-primary/80">
                    {cart.length} Items Selected
                  </CardDescription>
                </div>
              </div>
              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  onClick={() => {
                    if (confirm('Clear entire cart?')) setCart([])
                  }}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              )}
            </CardHeader>

            <CardContent className="flex-1 overflow-auto p-4 flex flex-col gap-3 min-h-0 scrollbar-hide">
              {cart.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 bg-white/50 hover:bg-white/80 rounded-2xl flex items-center gap-4 transition-all group animate-entrance border border-transparent hover:border-primary/10 hover:shadow-lg"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <Badge className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-110 transition-transform">
                    {item.quantity}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate text-foreground">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                      ${item.selling_price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-black/5">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-primary transition-colors disabled:opacity-30"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-primary transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="text-right pl-2 w-20">
                    <p className="font-black text-lg text-foreground">
                      ${(item.selling_price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center opacity-40 select-none py-20">
                  <div className="h-24 w-24 rounded-full border-4 border-dashed border-primary/20 flex items-center justify-center mb-6">
                    <Plus className="h-10 w-10 text-primary/40" />
                  </div>
                  <p className="font-black text-sm uppercase tracking-[0.3em] text-muted-foreground">
                    Cart is empty
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="p-8 border-t border-white/10 bg-white/40 flex flex-col gap-6 shrink-0 backdrop-blur-md">
              <div className="w-full grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">
                    Customer Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <Input
                      placeholder="Guest Customer"
                      className="pl-11 bg-white/40 border-white/10 rounded-xl font-bold h-12 transition-all focus:bg-white/80"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">
                    Payment Method
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentMethod('CASH')}
                      className={cn(
                        'flex-1 flex items-center justify-center h-12 rounded-xl transition-all duration-300 border border-transparent',
                        paymentMethod === 'CASH'
                          ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.05]'
                          : 'bg-white/40 text-muted-foreground hover:bg-white/60 hover:border-white/20'
                      )}
                    >
                      <Banknote className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setPaymentMethod('CARD')}
                      className={cn(
                        'flex-1 flex items-center justify-center h-12 rounded-xl transition-all duration-300 border border-transparent',
                        paymentMethod === 'CARD'
                          ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.05]'
                          : 'bg-white/40 text-muted-foreground hover:bg-white/60 hover:border-white/20'
                      )}
                    >
                      <CreditCard className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full flex items-center justify-between pt-4 border-t border-black/5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Total Amount
                  </p>
                  <p className="text-5xl font-black text-primary leading-none mt-1 shadow-primary drop-shadow-sm">
                    ${calculateTotal().toFixed(2)}
                  </p>
                </div>
                <Button
                  className="h-20 px-10 rounded-3xl text-xl font-black gap-4 shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all duration-500 bg-gradient-to-br from-primary to-primary/80"
                  size="lg"
                  disabled={cart.length === 0 || isProcessing}
                  onClick={handleCheckout}
                >
                  {isProcessing ? (
                    <div className="h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Checkout
                      <CheckCircle2 className="h-6 w-6" />
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
