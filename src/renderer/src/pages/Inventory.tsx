import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertTriangle, TrendingUp, Info, Plus, RefreshCw, Package, ArrowUp, ArrowDown, BarChart3, Download, Filter, X, Clock, Zap } from 'lucide-react'
import { Product } from '../../../shared/types'

type FilterType = 'all' | 'critical' | 'warning' | 'healthy' | 'slow-moving'

export default function InventoryPage() {
  const [alerts, setAlerts] = useState<{
    count: number
    items: { id: number; name: string; current: number; min: number }[]
  }>({ count: 0, items: [] })
  const [recommendations, setRecommendations] = useState<
    { product: Product; suggestedOrder: number; reason: string; urgency: 'critical' | 'high' | 'medium'; profitImpact?: string }[]
  >([])
  const [metrics, setMetrics] = useState<any[]>([])
  const [filteredMetrics, setFilteredMetrics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [adjustmentValue, setAdjustmentValue] = useState<string>('')
  const [adjustmentReason, setAdjustmentReason] = useState<string>('')
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [selectedProductHistory, setSelectedProductHistory] = useState<any>(null)
  const [movementHistory, setMovementHistory] = useState<any[]>([])

  useEffect(() => {
    loadData()

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      loadData(true) // silent refresh
    }, 10000)

    // Listen for inventory update events from other pages
    const handleInventoryUpdate = () => loadData(true)
    window.addEventListener('inventory-update', handleInventoryUpdate)

    return () => {
      clearInterval(interval)
      window.removeEventListener('inventory-update', handleInventoryUpdate)
    }
  }, [])

  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      setIsRefreshing(true)

      const [alertsData, recsData, metricsData] = await Promise.all([
        window.api.inventory.getAlerts(),
        window.api.inventory.getRecommendations(),
        window.api.inventory.getAllMetrics()
      ])

      setAlerts(alertsData)
      setRecommendations(recsData)
      setMetrics(metricsData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load inventory data:', error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    loadData()
  }

  const openAdjustmentDialog = (product: Product, type: 'add' | 'remove' = 'add') => {
    setSelectedProduct(product)
    setAdjustmentType(type)
    setAdjustmentValue('')
    setAdjustmentReason('')
    setAdjustmentDialogOpen(true)
  }

  const handleAdjustStock = async () => {
    if (!selectedProduct || !adjustmentValue || !adjustmentReason) {
      alert('Please fill in all fields')
      return
    }

    try {
      const adjustment = adjustmentType === 'add' ? parseInt(adjustmentValue) : -parseInt(adjustmentValue)
      await window.api.inventory.adjustStock({
        productId: selectedProduct.id,
        adjustment,
        reason: adjustmentReason
      })
      setAdjustmentDialogOpen(false)
      loadData()
      window.dispatchEvent(new CustomEvent('inventory-update'))
    } catch (error) {
      console.error('Failed to adjust stock:', error)
      alert('Failed to adjust stock')
    }
  }

  const openHistoryDialog = async (metric: any) => {
    setSelectedProductHistory(metric)
    setMovementHistory([]) // Will be implemented in next update
    setHistoryDialogOpen(true)
  }

  const applyFilters = () => {
    let filtered = [...metrics]

    // Apply health filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'slow-moving') {
        filtered = filtered.filter((m) => m.daysSinceLastMovement > 60)
      } else {
        filtered = filtered.filter((m) => m.stockHealth === activeFilter)
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.productName.toLowerCase().includes(query) || m.productId.toString().includes(query)
      )
    }

    setFilteredMetrics(filtered)
  }

  useEffect(() => {
    applyFilters()
  }, [metrics, searchQuery, activeFilter])

  const exportToCSV = () => {
    const headers = [
      'Product ID',
      'Product Name',
      'Current Stock',
      'Minimum Stock',
      'Days of Supply',
      'Monthly Turnover',
      'Profit Margin',
      'Stock Health'
    ]
    const rows = filteredMetrics.map((m) => [
      m.productId,
      m.productName,
      m.currentStock,
      m.minimumStock,
      m.daysOfSupply,
      m.monthlyTurnover,
      m.profitMargin,
      m.stockHealth
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getTimeAgo = () => {
    const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000)
    if (seconds < 10) return 'just now'
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    return `${Math.floor(minutes / 60)}h ago`
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'text-red-500 bg-red-500/10'
      case 'high':
        return 'text-orange-500 bg-orange-500/10'
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10'
      default:
        return 'text-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse font-medium">Analyzing stock data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-10 space-y-12 animate-entrance overflow-auto h-screen pb-20">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-black tracking-tighter text-gradient">Stock Intelligence</h1>
          <p className="text-muted-foreground font-medium text-lg max-w-2xl italic">
            Advanced insights, real-time alerts, and AI-driven recommendations for optimal inventory management.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isRefreshing && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
            <span className="font-medium">Updated {getTimeAgo()}</span>
          </div>
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="h-12 px-6 rounded-2xl font-black gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-12 px-6 rounded-2xl font-black gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Alerts Section */}
        <Card className="glass-premium border-none shadow-none hover-lift group flex flex-col min-h-[400px]">
          <CardHeader className="flex flex-row items-center justify-between p-8 shrink-0">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-black">Active Alerts</CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary/60 italic">
                Items below safe threshold
              </CardDescription>
            </div>
            <div className="h-14 w-14 bg-red-500/10 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-7 w-7 text-red-500" />
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-0 flex-1 flex flex-col">
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-6xl font-black text-red-500 tabular-nums">{alerts.count}</span>
              <span className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
                High Priority
              </span>
            </div>

            <div className="flex-1 border border-white/10 rounded-3xl overflow-hidden bg-white/5 backdrop-blur-md">
              <Table>
                <TableHeader className="bg-white/10">
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead className="px-6 h-12 font-black uppercase text-[10px] tracking-widest">
                      Product
                    </TableHead>
                    <TableHead className="px-6 h-12 font-black uppercase text-[10px] tracking-widest text-right">
                      Stock
                    </TableHead>
                    <TableHead className="px-6 h-12 font-black uppercase text-[10px] tracking-widest text-right">
                      Target
                    </TableHead>
                    <TableHead className="px-6 h-12 font-black uppercase text-[10px] tracking-widest text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.items.map((item, idx) => (
                    <TableRow
                      key={item.id}
                      className="border-white/5 hover:bg-white/10 transition-colors animate-entrance"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <TableCell className="px-6 py-4 font-bold text-sm">{item.name}</TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full font-black text-xs">
                          {item.current}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right font-black text-xs text-muted-foreground/60 tabular-nums">
                        {item.min}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const product = metrics.find((m) => m.productId === item.id)
                            if (product) openAdjustmentDialog({ id: item.id } as Product, 'add')
                          }}
                          className="h-6 gap-1 hover:bg-primary/20"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {alerts.items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-20">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                          <Info className="h-12 w-12" />
                          <p className="font-black uppercase tracking-[0.2em] text-sm italic">
                            All systems healthy
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations Section */}
        <Card className="glass-premium border-none shadow-none hover-lift group flex flex-col min-h-[400px]">
          <CardHeader className="flex flex-row items-center justify-between p-8 shrink-0">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-black">Smart Restock</CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary/60 italic">
                AI-driven procurement advice
              </CardDescription>
            </div>
            <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <TrendingUp className="h-7 w-7 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-0 flex-1 flex flex-col">
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-6xl font-black text-primary tabular-nums">
                {recommendations.length}
              </span>
              <span className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
                Opportunities
              </span>
            </div>

            <div className="flex-1 border border-white/10 rounded-3xl overflow-hidden bg-white/5 backdrop-blur-md">
              <Table>
                <TableHeader className="bg-white/10">
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead className="px-6 h-12 font-black uppercase text-[10px] tracking-widest">
                      Product
                    </TableHead>
                    <TableHead className="px-6 h-12 font-black uppercase text-[10px] tracking-widest text-right">
                      Order
                    </TableHead>
                    <TableHead className="px-6 h-12 font-black uppercase text-[10px] tracking-widest">
                      Insight
                    </TableHead>
                    <TableHead className="px-6 h-12 font-black uppercase text-[10px] tracking-widest text-right">
                      Priority
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recommendations.map((rec, i) => (
                    <TableRow
                      key={i}
                      className="border-white/5 hover:bg-white/10 transition-colors animate-entrance"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <TableCell className="px-6 py-4 font-bold text-sm">
                        {rec.product.name}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1 font-black text-primary text-sm">
                          <Plus className="h-3 w-3" />
                          {rec.suggestedOrder}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase text-muted-foreground italic leading-tight">
                              {rec.reason}
                            </span>
                          </div>
                          {rec.profitImpact && (
                            <span className="text-[9px] text-muted-foreground/60 ml-3">{rec.profitImpact}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <span
                          className={`px-2 py-1 rounded-full font-black text-xs uppercase ${getUrgencyColor(
                            rec.urgency
                          )}`}
                        >
                          {rec.urgency}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {recommendations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-20">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                          <TrendingUp className="h-12 w-12" />
                          <p className="font-black uppercase tracking-[0.2em] text-sm italic">
                            Inventory Optimized
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Dashboard */}
      <Card className="glass-premium border-none shadow-none hover-lift">
        <CardHeader className="flex flex-row items-center justify-between p-8">
          <div className="space-y-2">
            <CardTitle className="text-3xl font-black">Inventory Analytics</CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary/60 italic">
              Detailed metrics and performance indicators
            </CardDescription>
          </div>
          <div className="h-14 w-14 bg-blue-500/10 rounded-2xl flex items-center justify-center shadow-inner">
            <BarChart3 className="h-7 w-7 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 items-center flex-wrap">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-64 rounded-lg"
              />
              <Button
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('all')}
                size="sm"
                className="gap-1"
              >
                <Filter className="h-3 w-3" />
                All ({metrics.length})
              </Button>
              <Button
                variant={activeFilter === 'critical' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('critical')}
                size="sm"
                className="gap-1 border-red-500/30 text-red-600"
              >
                Critical
              </Button>
              <Button
                variant={activeFilter === 'warning' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('warning')}
                size="sm"
                className="gap-1 border-orange-500/30 text-orange-600"
              >
                Warning
              </Button>
              <Button
                variant={activeFilter === 'healthy' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('healthy')}
                size="sm"
                className="gap-1 border-green-500/30 text-green-600"
              >
                Healthy
              </Button>
              <Button
                variant={activeFilter === 'slow-moving' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('slow-moving')}
                size="sm"
                className="gap-1 border-purple-500/30 text-purple-600"
              >
                Slow Moving
              </Button>
              {(activeFilter !== 'all' || searchQuery) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setActiveFilter('all')
                    setSearchQuery('')
                  }}
                  size="sm"
                  className="gap-1"
                >
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>
            {filteredMetrics.length < metrics.length && (
              <p className="text-xs text-muted-foreground">
                Showing {filteredMetrics.length} of {metrics.length} products
              </p>
            )}
          </div>

          <div className="border border-white/10 rounded-3xl overflow-auto bg-white/5 backdrop-blur-md">
            <Table>
              <TableHeader className="bg-white/10">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="px-6 h-12 font-black uppercase text-[10px] tracking-widest whitespace-nowrap">
                    Product
                  </TableHead>
                  <TableHead className="px-6 h-12 font-black uppercase text-[10px] tracking-widest text-right whitespace-nowrap">
                    Current Stock
                  </TableHead>
                  <TableHead className="px-6 h-12 font-black uppercase text-[10px] tracking-widest text-right whitespace-nowrap">
                    Days of Supply
                  </TableHead>
                  <TableHead className="px-6 h-12 font-black uppercase text-[10px] tracking-widest text-right whitespace-nowrap">
                    Monthly Turnover
                  </TableHead>
                  <TableHead className="px-6 h-12 font-black uppercase text-[10px] tracking-widest text-right whitespace-nowrap">
                    Margin
                  </TableHead>
                  <TableHead className="px-6 h-12 font-black uppercase text-[10px] tracking-widest text-right whitespace-nowrap">
                    Health
                  </TableHead>
                  <TableHead className="px-6 h-12 font-black uppercase text-[10px] tracking-widest text-right whitespace-nowrap">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMetrics.length > 0 ? (
                  filteredMetrics.map((metric, idx) => (
                    <TableRow
                      key={metric.productId}
                      className="border-white/5 hover:bg-white/10 transition-colors animate-entrance"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <TableCell className="px-6 py-4 font-bold text-sm whitespace-nowrap">{metric.productName}</TableCell>
                      <TableCell className="px-6 py-4 text-right font-black text-xs">{metric.currentStock}</TableCell>
                      <TableCell className="px-6 py-4 text-right text-xs">
                        <span className="font-black">{metric.daysOfSupply}</span> days
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right text-xs">
                        <span className="font-black text-primary">{metric.monthlyTurnover}</span> units
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right font-black text-xs text-green-500">
                        {metric.profitMargin}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <span
                          className={`px-2 py-1 rounded-full font-black text-xs uppercase ${
                            metric.stockHealth === 'critical'
                              ? 'bg-red-500/10 text-red-500'
                              : metric.stockHealth === 'warning'
                                ? 'bg-orange-500/10 text-orange-500'
                                : 'bg-green-500/10 text-green-500'
                          }`}
                        >
                          {metric.stockHealth}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openHistoryDialog(metric)}
                          className="h-6 gap-1 hover:bg-blue-500/20 hover:text-blue-500"
                          title="View history"
                        >
                          <Clock className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            openAdjustmentDialog(
                            { id: metric.productId, name: metric.productName } as Product,
                            'add'
                          )
                        }
                        className="h-6 gap-1 hover:bg-green-500/20 hover:text-green-500"
                        title="Add stock"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openAdjustmentDialog(
                            { id: metric.productId, name: metric.productName } as Product,
                            'remove'
                          )
                        }
                        className="h-6 gap-1 hover:bg-red-500/20 hover:text-red-500"
                        title="Remove stock"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-20">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <BarChart3 className="h-12 w-12" />
                        <p className="font-black uppercase tracking-[0.2em] text-sm italic">
                          No products match filters
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {metrics.length > 0 && (
            <p className="text-center text-muted-foreground text-xs mt-4 italic">
              Displaying {filteredMetrics.length} of {metrics.length} products • Sorted by stock health and supply days
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stock Adjustment Dialog */}
      <Dialog open={adjustmentDialogOpen} onOpenChange={setAdjustmentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adjust Stock - {selectedProduct?.name}</DialogTitle>
            <DialogDescription>Make manual adjustments to inventory levels</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest">Type</label>
              <div className="flex gap-2">
                <Button
                  variant={adjustmentType === 'add' ? 'default' : 'outline'}
                  onClick={() => setAdjustmentType('add')}
                  className="flex-1 gap-2"
                >
                  <ArrowUp className="h-4 w-4" />
                  Add Stock
                </Button>
                <Button
                  variant={adjustmentType === 'remove' ? 'default' : 'outline'}
                  onClick={() => setAdjustmentType('remove')}
                  className="flex-1 gap-2"
                >
                  <ArrowDown className="h-4 w-4" />
                  Remove Stock
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest">Quantity</label>
              <Input
                type="number"
                min="1"
                value={adjustmentValue}
                onChange={(e) => setAdjustmentValue(e.target.value)}
                placeholder="Enter quantity"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest">Reason</label>
              <Input
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="e.g., Stock count discrepancy, damaged goods"
                className="rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setAdjustmentDialogOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAdjustStock} className="flex-1 gap-2">
              <Package className="h-4 w-4" />
              Confirm Adjustment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Movement History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Stock History - {selectedProductHistory?.productName}
            </DialogTitle>
            <DialogDescription>Recent inventory movements and adjustments</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-auto">
            {movementHistory.length > 0 ? (
              movementHistory.map((movement, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="mt-0.5">
                    {movement.movement_type === 'OUT' ? (
                      <ArrowDown className="h-4 w-4 text-red-500" />
                    ) : movement.movement_type === 'IN' ? (
                      <ArrowUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <Zap className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-bold capitalize">
                          {movement.movement_type === 'OUT'
                            ? 'Stock Out'
                            : movement.movement_type === 'IN'
                              ? 'Stock In'
                              : 'Adjustment'}
                        </p>
                        <p className="text-xs text-muted-foreground">{movement.notes}</p>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <p
                          className={`text-sm font-black ${
                            movement.movement_type === 'OUT' ? 'text-red-500' : 'text-green-500'
                          }`}
                        >
                          {movement.movement_type === 'OUT' ? '-' : '+'}
                          {movement.quantity}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(movement.created_at).toLocaleDateString()} {new Date(movement.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 opacity-50">
                <Clock className="h-8 w-8 mb-2" />
                <p className="text-sm text-muted-foreground">No movement history</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
