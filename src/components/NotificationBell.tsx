import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Bell, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useNotifications } from '@/hooks/use-notifications'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'
import type { NotificationRecord } from '@/services/notifications'

export function NotificationBell() {
  const {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    refetch,
  } = useNotifications()
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [open, setOpen] = useState(false)

  const handleItemClick = useCallback(
    (notif: NotificationRecord) => {
      if (!notif.isRead) markAsRead(notif.id)
      setOpen(false)
      navigate(`/paciente/${notif.patientId}`)
    },
    [markAsRead, navigate],
  )

  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation()
      if (prefersReducedMotion) {
        removeNotification(id)
        return
      }
      setDeletingIds((prev) => new Set(prev).add(id))
      setTimeout(() => {
        removeNotification(id)
        setDeletingIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }, 200)
    },
    [removeNotification, prefersReducedMotion],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative tactile min-h-[44px] min-w-[44px]"
          aria-label="Notificações"
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-white font-bold"
              style={{ fontSize: '0.625rem' }}
              aria-live="polite"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-2rem)] sm:w-96 p-0 app-popover" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="text-sm font-semibold">Notificações</span>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
              Marcar todas como lidas
            </button>
          )}
        </div>

        <div
          role="menu"
          className="max-h-[400px] overflow-y-auto"
          onKeyDown={(e) => {
            const items = Array.from(
              document.querySelectorAll<HTMLDivElement>('[role="menuitem"]'),
            ).filter((el) => el.offsetParent !== null)
            const currentIndex = items.findIndex((el) => el === document.activeElement)
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              items[Math.min(currentIndex + 1, items.length - 1)]?.focus()
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              items[Math.max(currentIndex - 1, 0)]?.focus()
            } else if (e.key === 'Delete' && currentIndex >= 0) {
              e.preventDefault()
              const notif = notifications[currentIndex]
              if (notif) removeNotification(notif.id)
            }
          }}
        >
          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">{error}</p>
              <button onClick={refetch} className="text-xs text-primary hover:underline">
                Tentar novamente
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Sem notificações</p>
              <p className="text-xs text-muted-foreground mt-1">
                Você está em dia com as reavaliações.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  role="menuitem"
                  tabIndex={0}
                  onClick={() => handleItemClick(notif)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleItemClick(notif)
                  }}
                  className={cn(
                    'relative flex items-start gap-2 px-4 py-3 cursor-pointer transition-colors duration-200',
                    !notif.isRead && 'bg-primary/5',
                    deletingIds.has(notif.id) && 'opacity-0 transition-opacity duration-200',
                  )}
                >
                  {!notif.isRead && (
                    <span className="absolute left-1.5 top-4 h-2 w-2 rounded-full bg-primary" />
                  )}
                  <div className="flex-1 min-w-0 pl-2">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[0.625rem] font-medium',
                        notif.type === 'overdue'
                          ? 'bg-red-500 text-white'
                          : 'bg-yellow-400 text-black',
                      )}
                    >
                      {notif.type === 'overdue' ? 'Em atraso' : 'Próxima'}
                    </span>
                    <p className="text-[0.8125rem] mt-1 leading-snug">{notif.message}</p>
                    <p className="text-[0.6875rem] text-muted-foreground mt-1">
                      {format(new Date(notif.created), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 shrink-0 tactile"
                    onClick={(e) => handleDelete(e, notif.id)}
                    aria-label="Excluir notificação"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="border-t p-2">
            <Link
              to="/pacientes"
              onClick={() => setOpen(false)}
              className="block text-center text-xs text-primary hover:underline py-2"
            >
              Ver todos os pacientes
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
