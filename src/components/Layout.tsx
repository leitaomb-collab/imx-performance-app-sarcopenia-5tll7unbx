import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, Users, Activity, LogOut, Moon, Sun, Menu } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/components/theme-provider'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const navLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'Pacientes', path: '/pacientes', icon: Users },
  { name: 'Avaliações', path: '/avaliacao/nova', icon: Activity },
]

export default function Layout() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()
  const [supportsVT, setSupportsVT] = useState(false)

  useEffect(() => {
    setSupportsVT('startViewTransition' in document)
  }, [])

  const NavItems = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex flex-col space-y-1 mt-6">
      {navLinks.map((link) => {
        const Icon = link.icon
        const isActive = location.pathname.startsWith(link.path)
        return (
          <Link
            key={link.path}
            to={link.path}
            viewTransition
            onClick={onNavigate}
            className={cn(
              'nav-link tactile flex items-center space-x-3 px-4 py-3 rounded-md',
              isActive
                ? 'nav-link-active text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon size={20} />
            <span>{link.name}</span>
          </Link>
        )
      })}
    </div>
  )

  const showFallback = !prefersReducedMotion && !supportsVT
  const showReduced = prefersReducedMotion && !supportsVT

  return (
    <div className="flex min-h-screen bg-background text-foreground animate-fade-in">
      <aside className="layout-sidebar hidden md:flex w-64 flex-col border-r bg-card shadow-sm fixed inset-y-0 z-10">
        <div className="p-6 pb-2">
          <h1 className="text-2xl font-bold text-primary tracking-tight">
            IMX<span className="text-foreground font-semibold">Performance</span>
          </h1>
        </div>
        <div className="flex-1 px-4">
          <NavItems />
        </div>
      </aside>

      <div className="flex-1 flex flex-col md:pl-64">
        <header className="layout-header sticky top-0 z-20 flex items-center justify-between px-4 md:px-8 py-4 backdrop-blur-md bg-background/80 border-b">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden mr-2 tactile">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="p-6 pb-2">
                  <h1 className="text-2xl font-bold text-primary tracking-tight">
                    IMX<span className="text-foreground font-semibold">Perf</span>
                  </h1>
                </div>
                <div className="px-4">
                  <NavItems />
                </div>
              </SheetContent>
            </Sheet>
            <h2 className="hidden md:block text-xl font-semibold capitalize">
              {location.pathname.split('/')[1] || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="tactile"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full tactile">
                  <Avatar>
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="font-medium">{user?.name}</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={signOut}
                  className="text-destructive cursor-pointer mt-1"
                >
                  <LogOut size={16} className="mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-[1400px] mx-auto">
          <div
            key={location.pathname}
            className={cn(
              showFallback && 'route-transition-fallback',
              showReduced && 'route-transition-reduced',
            )}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
