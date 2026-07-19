import { useRouteTransition } from '@/hooks/use-route-transition'
import { cn } from '@/lib/utils'

export function NavigationProgress() {
  const { state, prefersReducedMotion } = useRouteTransition()

  if (prefersReducedMotion || state === 'idle') return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px] pointer-events-none overflow-hidden">
      <div
        className={cn(
          'h-full bg-primary',
          state === 'navigating' && 'nav-progress-loading',
          state === 'completing' && 'nav-progress-completing',
        )}
      />
    </div>
  )
}
