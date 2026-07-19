import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu, LayoutDashboard, Users, Activity, Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const items = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Pacientes', href: '/pacientes', icon: Users },
  { title: 'Avaliações', href: '/avaliacoes', icon: Activity },
  { title: 'Configurações', href: '/configuracoes', icon: Settings },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetTitle className="text-left font-bold text-lg mb-6">Menu</SheetTitle>
        <div className="flex flex-col space-y-2">
          {items.map((item) => {
            const isActive = location.pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive
                    ? 'bg-accent text-accent-foreground border-l-4 border-primary rounded-l-none'
                    : 'text-muted-foreground',
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
