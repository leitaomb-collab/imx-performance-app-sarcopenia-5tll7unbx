import { cn } from '@/lib/utils'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Activity, Settings } from 'lucide-react'

const items = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Pacientes',
    href: '/pacientes',
    icon: Users,
  },
  {
    title: 'Avaliações',
    href: '/avaliacoes',
    icon: Activity,
  },
  {
    title: 'Configurações',
    href: '/configuracoes',
    icon: Settings,
  },
]

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const location = useLocation()

  return (
    <div
      className={cn(
        'pb-12 h-screen border-r border-border bg-sidebar hidden md:block w-64 fixed left-0 top-16',
        className,
      )}
    >
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {items.map((item) => {
              const isActive = location.pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground',
                    isActive
                      ? 'bg-accent text-accent-foreground border-l-4 border-primary rounded-l-none'
                      : 'text-muted-foreground',
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
