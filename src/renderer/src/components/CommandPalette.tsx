'use client'

import * as React from 'react'
import {
  Calculator,
  Settings,
  Search,
  Package,
  LayoutDashboard,
  ShoppingCart,
  Users,
  Truck,
  FileStack
} from 'lucide-react'
import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent } from '@/components/ui/dialog'

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5 [&_[cmdk-item]]:cursor-pointer">
          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Type a command or search..."
              autoFocus
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
            <Command.Empty>No results found.</Command.Empty>
            <Command.Group heading="Suggestions">
              <Command.Item
                value="new-sale"
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground"
                onSelect={() => runCommand(() => navigate('/sales'))}
                onClick={() => runCommand(() => navigate('/sales'))}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                <span>New Sale</span>
              </Command.Item>
              <Command.Item
                value="view-products"
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground"
                onSelect={() => runCommand(() => navigate('/products'))}
                onClick={() => runCommand(() => navigate('/products'))}
              >
                <Package className="mr-2 h-4 w-4" />
                <span>View Products</span>
              </Command.Item>
              <Command.Item
                value="inventory-status"
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground"
                onSelect={() => runCommand(() => navigate('/inventory'))}
                onClick={() => runCommand(() => navigate('/inventory'))}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Inventory Status</span>
              </Command.Item>
            </Command.Group>
            <Command.Group heading="Navigation">
              <Command.Item
                value="customers"
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground"
                onSelect={() => runCommand(() => navigate('/customers'))}
                onClick={() => runCommand(() => navigate('/customers'))}
              >
                <Users className="mr-2 h-4 w-4" />
                <span>Customers</span>
              </Command.Item>
              <Command.Item
                value="suppliers"
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground"
                onSelect={() => runCommand(() => navigate('/suppliers'))}
                onClick={() => runCommand(() => navigate('/suppliers'))}
              >
                <Truck className="mr-2 h-4 w-4" />
                <span>Suppliers</span>
              </Command.Item>
              <Command.Item
                value="purchases"
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground"
                onSelect={() => runCommand(() => navigate('/purchases'))}
                onClick={() => runCommand(() => navigate('/purchases'))}
              >
                <FileStack className="mr-2 h-4 w-4" />
                <span>Purchases</span>
              </Command.Item>
              <Command.Item
                value="settings"
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground"
                onSelect={() => runCommand(() => navigate('/settings'))}
                onClick={() => runCommand(() => navigate('/settings'))}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Command.Item>
            </Command.Group>
            <Command.Group heading="Calculators">
              <Command.Item
                value="calculator"
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground"
                onSelect={() => runCommand(() => {})}
                onClick={() => runCommand(() => {})}
              >
                <Calculator className="mr-2 h-4 w-4" />
                <span>Calculator</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
