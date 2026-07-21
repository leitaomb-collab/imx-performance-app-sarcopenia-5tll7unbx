import { useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface RefreshButtonProps {
  onRefresh: () => void
}

export function RefreshButton({ onRefresh }: RefreshButtonProps) {
  const [refreshing, setRefreshing] = useState(false)
  const reducedMotion = useReducedMotion()

  const handleClick = useCallback(() => {
    if (refreshing) return
    setRefreshing(true)
    onRefresh()
    setTimeout(() => setRefreshing(false), 600)
  }, [refreshing, onRefresh])

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={refreshing}
      className={cn(
        'h-11 min-h-[44px] shrink-0 gap-1.5 text-xs font-medium',
        refreshing && 'opacity-50 pointer-events-none',
      )}
    >
      <RefreshCw
        className={cn('h-4 w-4', refreshing && !reducedMotion && 'animate-refresh-rotate')}
      />
      {refreshing ? 'Atualizando...' : 'Atualizar'}
    </Button>
  )
}
