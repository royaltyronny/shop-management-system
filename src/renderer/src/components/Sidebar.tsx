import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Users,
  Truck,
  FileStack,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Search,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { User } from '../../../shared/types'

interface SidebarProps {
  onLogout: () => void
}

export function Sidebar({ onLogout }: SidebarProps) {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved !== null ? JSON.parse(saved) : true
  })
  const [currentUser, setCurrentUser] = React.useState<User | null>(null)

  React.useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      setCurrentUser(JSON.parse(userStr))
    }
  }, [])

  React.useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed))
  }, [isCollapsed])

  // Keyboard shortcut for collapsing sidebar (Cmd/Ctrl + B)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        setIsCollapsed((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const links = [
    { href: '/products', label: 'Products', icon: Package, shortcut: '⌘1' },
    { href: '/inventory', label: 'Inventory', icon: LayoutDashboard, shortcut: '⌘2' },
    { href: '/sales', label: 'Sales', icon: ShoppingCart, shortcut: '⌘3', badge: 'New' },
    { href: '/customers', label: 'Customers', icon: Users, shortcut: '⌘4' },
    { href: '/suppliers', label: 'Suppliers', icon: Truck, shortcut: '⌘5' },
    { href: '/purchases', label: 'Purchases', icon: FileStack, shortcut: '⌘6' },
    ...(currentUser?.role === 'admin' ? [{ href: '/users', label: 'Users', icon: Shield, shortcut: '⌘U' }] : []),
    { href: '/settings', label: 'Settings', icon: Settings, shortcut: '⌘,' }
  ]

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          'fixed left-0 top-0 m-4 flex h-[calc(100vh-2rem)] flex-col gap-4 rounded-3xl border border-white/20 bg-white/40 shadow-2xl backdrop-blur-3xl transition-all duration-500 ease-in-out z-40',
          isCollapsed ? 'w-24 p-4' : 'w-80 p-6'
        )}
      >
        {/* Collapse Toggle Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute -right-4 top-8 z-50 h-8 w-8 rounded-full border border-white/20 bg-background/50 shadow-lg backdrop-blur-md hover:bg-background"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsCollapsed((prev) => !prev)
          }}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>

        {/* Logo Section */}
        <div className={cn('flex items-center gap-3 px-2 py-2', isCollapsed && 'justify-center')}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95">
            <span className="text-2xl font-black text-white">S</span>
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in space-y-0.5 overflow-hidden">
              <h2 className="text-xl font-black tracking-tight text-foreground">Sunrise</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
                Admin Panel
              </p>
            </div>
          )}
        </div>

        {/* Search Bar - Only simplified when collapsed */}
        <div className={cn('mt-2 transition-all', isCollapsed ? 'px-0' : 'px-2')}>
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10"
                    onClick={() => {
                      const event = new KeyboardEvent('keydown', {
                        key: 'k',
                        ctrlKey: true,
                        bubbles: true
                      })
                      document.dispatchEvent(event)
                    }}
                  >
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Search (Cmd+K)</TooltipContent>
              </Tooltip>
            ) : (
              <button
                className="w-full"
                onClick={() => {
                  const event = new KeyboardEvent('keydown', {
                    key: 'k',
                    ctrlKey: true,
                    bubbles: true
                  })
                  document.dispatchEvent(event)
                }}
              >
                <div
                  className={cn(
                    'group flex h-10 w-full items-center gap-2 rounded-xl border border-white/10 bg-white/20 px-3 transition-colors hover:bg-white/30'
                  )}
                >
                  <Search className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground">
                    Search...
                  </span>
                  <span className="ml-auto flex items-center gap-0.5 rounded border border-white/10 bg-white/20 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    <span className="text-xs">⌘</span>K
                  </span>
                </div>
              </button>
            )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden py-4 scrollbar-hide">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname.startsWith(link.href)

            if (isCollapsed) {
              return (
                <Tooltip key={link.href}>
                  <TooltipTrigger asChild>
                    <Link
                      to={link.href}
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 mx-auto group relative',
                        isActive
                          ? 'bg-primary text-white shadow-lg shadow-primary/25'
                          : 'text-muted-foreground hover:bg-white/40 hover:text-foreground'
                      )}
                    >
                      <Icon className={cn('h-6 w-6', isActive && 'animate-pulse-subtle')} />
                      {link.badge && (
                        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-accent ring-2 ring-white" />
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="flex items-center gap-2">
                    {link.label}
                    <span className="rounded bg-white/20 px-1 py-0.5 text-[10px] uppercase text-muted-foreground">
                      {link.shortcut}
                    </span>
                  </TooltipContent>
                </Tooltip>
              )
            }

            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-300',
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-muted-foreground hover:bg-white/40 hover:text-foreground'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-transform duration-300 group-hover:scale-110',
                    isActive ? 'text-white' : 'text-muted-foreground group-hover:text-primary'
                  )}
                />
                <span className="flex-1">{link.label}</span>
                {link.badge && (
                  <Badge
                    variant="secondary"
                    className="bg-accent/10 text-accent font-bold h-5 px-1.5 text-[10px]"
                  >
                    {link.badge}
                  </Badge>
                )}
                {!isActive && (
                  <span className="opacity-0 transition-opacity group-hover:opacity-100 text-[10px] text-muted-foreground/50 font-medium border border-white/20 rounded px-1.5 py-0.5">
                    {link.shortcut}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Profile Section */}
        <div className={cn('border-t border-white/10 pt-4', isCollapsed ? 'items-center' : '')}>
          {isCollapsed ? (
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                className="h-12 w-12 rounded-2xl p-0 hover:bg-white/40"
              >
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.username || 'User'}`}
                  alt={currentUser?.username}
                  className="h-8 w-8 rounded-full bg-primary/20"
                />
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-2xl hover:bg-red-500/20 hover:text-red-500 mx-auto"
                    onClick={onLogout}
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white/20 border border-white/10 p-3 transition-colors hover:bg-white/30 cursor-pointer group">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.username || 'User'}`}
                  alt={currentUser?.username}
                  className="h-10 w-10 rounded-full bg-primary/20 shadow-sm"
                />
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-bold text-foreground">{currentUser?.full_name || currentUser?.username}</p>
                  <p className="truncate text-xs text-muted-foreground capitalize">{currentUser?.role}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-xl border-white/20 text-red-500 hover:bg-red-500/10 hover:text-red-600 gap-2"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
