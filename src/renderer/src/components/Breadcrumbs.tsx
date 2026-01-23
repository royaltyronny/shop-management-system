import { ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function Breadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  if (pathnames.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center">
      <ol className="flex items-center gap-2 text-sm text-muted-foreground/60 transition-colors">
        <li className="flex items-center gap-2 hover:text-foreground">
          <Link to="/">
            <Home className="h-4 w-4" />
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`
          const isLast = index === pathnames.length - 1
          const label = value.charAt(0).toUpperCase() + value.slice(1)

          return (
            <li key={to} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 opacity-50" />
              <Link
                to={to}
                className={cn(
                  'font-medium transition-colors hover:text-foreground',
                  isLast
                    ? 'text-foreground font-bold pointer-events-none'
                    : 'hover:underline underline-offset-4'
                )}
                aria-current={isLast ? 'page' : undefined}
              >
                {label}
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
