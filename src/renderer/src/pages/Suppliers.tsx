import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import { Search, Plus, Mail, Phone, MapPin, Truck, Edit, Trash2 } from 'lucide-react'
import { Supplier } from '../../../shared/types'
import { SupplierForm, SupplierFormValues } from '../components/SupplierForm'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>()
  const loadSuppliers = async () => {
    const data = await window.api.suppliers.getAll()
    setSuppliers(data)
  }

  useEffect(() => {
    loadSuppliers()
  }, [])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = await window.api.suppliers.search(query)
      setSuppliers(results)
    } else {
      loadSuppliers()
    }
  }

  const handleSave = async (values: SupplierFormValues) => {
    if (editingSupplier) {
      await window.api.suppliers.update(editingSupplier.id, values)
    } else {
      await window.api.suppliers.create(values)
    }
    setIsDialogOpen(false)
    setEditingSupplier(undefined)
    loadSuppliers()
  }

  const handleDelete = async (id: number) => {
    if (
      confirm(
        'Are you sure you want to delete this vendor? This might affect existing purchase records.'
      )
    ) {
      await window.api.suppliers.delete(id)
      loadSuppliers()
    }
  }

  return (
    <div className="p-10 space-y-12 animate-entrance overflow-auto h-screen pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Truck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-gradient">Vendors</h1>
          </div>
          <p className="text-muted-foreground font-medium text-lg max-w-2xl italic">
            Manage your supply chain and distributor partnerships with premium efficiency.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search by name, email..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-14 pl-12 bg-white/20 border-white/10 rounded-2xl focus:bg-white/40 focus:ring-4 focus:ring-primary/10 transition-all font-bold"
            />
          </div>
          <Button
            onClick={() => {
              setEditingSupplier(undefined)
              setIsDialogOpen(true)
            }}
            className="h-14 px-8 rounded-2xl font-black gap-2 shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all bg-primary"
          >
            <Plus className="h-6 w-6" />
            Add Supplier
          </Button>
        </div>
      </div>

      <Card className="glass-premium border-none shadow-none overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/10">
              <TableRow className="hover:bg-transparent border-white/5 h-16">
                <TableHead className="w-1/4 font-black text-xs uppercase tracking-widest pl-10">
                  Vendor Info
                </TableHead>
                <TableHead className="w-1/4 font-black text-xs uppercase tracking-widest text-center">
                  Contact
                </TableHead>
                <TableHead className="w-1/4 font-black text-xs uppercase tracking-widest text-center">
                  Location
                </TableHead>
                <TableHead className="w-[100px] font-black text-xs uppercase tracking-widest text-right pr-10">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                      <Truck className="h-12 w-12 opacity-20" />
                      <p className="text-xl font-bold">No vendors found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier) => (
                  <TableRow
                    key={supplier.id}
                    className="border-white/5 hover:bg-white/5 transition-colors h-24 group"
                  >
                    <TableCell className="pl-10">
                      <div className="flex flex-col">
                        <span className="text-lg font-black group-hover:text-primary transition-colors">
                          {supplier.name}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground uppercase opacity-60">
                          {supplier.contact_person || 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center gap-1">
                        {supplier.email && (
                          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {supplier.email}
                          </div>
                        )}
                        {supplier.phone && (
                          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {supplier.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground">
                        <MapPin className="h-4 w-4 opacity-40" />
                        {supplier.address || 'Global/Online'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingSupplier(supplier)
                            setIsDialogOpen(true)
                          }}
                          className="h-10 w-10 rounded-xl hover:bg-white/20 active:scale-90 transition-all"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(supplier.id)}
                          className="h-10 w-10 rounded-xl hover:bg-red-500/20 hover:text-red-500 active:scale-90 transition-all text-muted-foreground"
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
        <DialogContent className="max-w-3xl glass-premium border-none shadow-2xl p-10 outline-none">
          <DialogHeader>
            <DialogTitle className="text-4xl font-black tracking-tighter text-gradient leading-tight">
              {editingSupplier ? 'Update Vendor' : 'New Strategic Partner'}
            </DialogTitle>
          </DialogHeader>
          <SupplierForm
            initialValues={editingSupplier}
            onSubmit={handleSave}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
