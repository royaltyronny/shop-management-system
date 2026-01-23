import { useState } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
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
import { Search, Plus, Mail, Phone, Calendar, MoreVertical } from 'lucide-react'

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('')

  // Placeholder data
  const customers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 234 567 890',
      lastVisit: '2026-01-05',
      totalSpent: 1250.0
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1 987 654 321',
      lastVisit: '2026-01-04',
      totalSpent: 840.5
    },
    {
      id: 3,
      name: 'Mike Ross',
      email: 'mike@example.com',
      phone: '+1 555 123 456',
      lastVisit: '2025-12-30',
      totalSpent: 2100.2
    }
  ]

  return (
    <div className="p-10 h-screen flex flex-col gap-10 overflow-hidden animate-entrance">
      <div className="flex justify-between items-end shrink-0">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-gradient">
            Relationship Manager
          </h1>
          <p className="text-muted-foreground font-medium text-lg italic">
            Track and nurture your premium customer connections and history.
          </p>
        </div>
        <Button className="h-14 px-8 rounded-2xl font-black gap-2 shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all">
          <Plus className="h-5 w-5" />
          Add Client
        </Button>
      </div>

      <Card className="glass-premium border-none shadow-none flex-1 flex flex-col overflow-hidden">
        <CardHeader className="p-8 border-b border-white/10 flex flex-row items-center justify-between shrink-0 bg-white/5">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative max-w-md w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search clients by name, email or phone..."
                className="pl-12 h-14 bg-white/20 border-white/10 focus:bg-white/40 focus:ring-4 focus:ring-primary/10 transition-all rounded-2xl font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="h-10 w-px bg-white/10 mx-2" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Active:
              </span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-xl font-black text-sm tabular-nums">
                {customers.length}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-white/10">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="p-0 flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
              <TableRow className="hover:bg-transparent border-white/5 h-14">
                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest w-[35%]">
                  Client Profile
                </TableHead>
                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">
                  Contact Information
                </TableHead>
                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">
                  Last Activity
                </TableHead>
                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-right">
                  Lifetime Value
                </TableHead>
                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer, idx) => (
                <TableRow
                  key={customer.id}
                  className="border-white/5 hover:bg-white/10 transition-colors animate-entrance group"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-inner group-hover:scale-110 transition-transform">
                        {customer.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-base group-hover:text-primary transition-colors">
                          {customer.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
                          Partner ID: #{customer.id.toString().padStart(4, '0')}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Mail className="h-3.5 w-3.5 text-primary/60" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 text-primary/60" />
                        {customer.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground/80">
                      <Calendar className="h-3.5 w-3.5 text-primary/60" />
                      {new Date(customer.lastVisit).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-right">
                    <span className="text-xl font-black text-primary tabular-nums">
                      ${customer.totalSpent.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 pr-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl hover:bg-white/10 transition-all"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
