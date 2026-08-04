import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, Users, Activity, LogOut, Moon, Sun, Menu } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/components/theme-provider'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { usePageTitle } from '@/hooks/use-page-title'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { NotificationBell } from '@/components/NotificationBell'
import { SkipLink } from '@/components/SkipLink'
import { SrAnnouncer } from '@/components/SrAnnouncer'
import { cn } from '@/lib/utils'
import logoIemex from '@/assets/logo-iemex.png'

const navLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'Pacientes', path: '/pacientes', icon: Users },
  { name: 'Avaliações', path: '/avaliacao/nova', icon: Activity },
]

const ROUTE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  pacientes: 'Pacientes',
  paciente: 'Perfil do Paciente',
  avaliacao: 'Avaliação',
  relatorio: 'Relatório',
}

export default function Layout() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()
  const [supportsVT, setSupportsVT] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const routeKey = location.pathname.split('/')[1] || 'dashboard'
  usePageTitle(ROUTE_TITLES[routeKey] || 'IEMEX Performance')

  useEffect(() => {
    setSupportsVT('startViewTransition' in document)
  }, [])

  const handleNavKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const links = e.currentTarget.parentElement?.querySelectorAll<HTMLAnchorElement>('.nav-link')
      if (!links) return
      const dir = e.key === 'ArrowDown' ? 1 : -1
      const next = Math.min(Math.max(index + dir, 0), links.length - 1)
      links[next]?.focus()
    }
  }

  const NavItems = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav aria-label="Navegação principal" className="flex flex-col space-y-1 mt-6">
      {navLinks.map((link, index) => {
        const Icon = link.icon
        const isActive = location.pathname.startsWith(link.path)
        return (
          <Link
            key={link.path}
            to={link.path}
            viewTransition
            onClick={onNavigate}
            onKeyDown={(e) => handleNavKeyDown(e, index)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'nav-link tactile flex items-center space-x-3 px-4 py-3 rounded-md min-h-[44px]',
              isActive
                ? 'nav-link-active text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon size={20} aria-hidden="true" />
            <span>{link.name}</span>
          </Link>
        )
      })}
    </nav>
  )

  const showFallback = !prefersReducedMotion && !supportsVT
  const showReduced = prefersReducedMotion && !supportsVT

  return (
    <div className="flex min-h-screen bg-background text-foreground animate-fade-in">
      <SkipLink />
      <aside className="layout-sidebar app-sidebar hidden md:flex w-64 flex-col border-r bg-card shadow-sm fixed inset-y-0 z-10">
        <div className="flex items-center justify-center py-2">
          <div
            className="bg-transparent dark:bg-white rounded-md dark:px-2 dark:py-1"
            role="banner"
          >
            <img src={logoIemex} alt="IEMEX Performance" className="h-10 w-auto object-contain" />
          </div>
        </div>
        <div className="flex-1 px-4">
          <NavItems />
        </div>
      </aside>

      <div className="flex-1 flex flex-col md:pl-64">
        <header
          role="banner"
          className="layout-header app-header sticky top-0 z-20 flex items-center justify-between px-4 md:px-8 py-4 backdrop-blur-md bg-background/80 border-b"
        >
          <div className="flex items-center">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden mr-2 tactile min-h-[44px] min-w-[44px]"
                  aria-expanded={mobileNavOpen}
                  aria-controls="mobile-nav-sheet"
                  aria-label="Abrir menu de navegação"
                >
                  <Menu size={24} aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-64 p-0 app-sheet-content"
                id="mobile-nav-sheet"
              >
                <div className="flex items-center justify-center py-2">
                  <div
                    className="bg-transparent dark:bg-white rounded-md dark:px-2 dark:py-1"
                    role="banner"
                  >
                    <img
                      src={logoIemex}
                      alt="IEMEX Performance"
                      className="h-9 w-auto object-contain"
                    />
                  </div>
                </div>
                <div className="px-4">
                  <NavItems onNavigate={() => setMobileNavOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <h2 className="hidden md:block text-xl font-semibold capitalize">
              {location.pathname.split('/')[1] || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationBell />
            <Button
              variant="ghost"
              size="icon"
              className="tactile min-h-[44px] min-w-[44px]"
              aria-label="Alternar tema escuro"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun size={20} aria-hidden="true" />
              ) : (
                <Moon size={20} aria-hidden="true" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 min-h-[44px] min-w-[44px] rounded-full tactile"
                  aria-label="Menu do usuário"
                >
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
                  <LogOut size={16} className="mr-2" aria-hidden="true" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main
          id="main-content"
          role="main"
          tabIndex={-1}
          className="main-content-wrapper flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-[1400px] mx-auto focus:outline-none"
        >
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

        <footer
          role="contentinfo"
          className="border-t px-4 md:px-8 py-3 text-center text-xs text-muted-foreground"
          style={{ paddingBottom: 'max(0.75rem, var(--sab))' }}
        >
          © {new Date().getFullYear()} IEMEX Performance
        </footer>
      </div>
      <SrAnnouncer />
    </div>
  )
}
