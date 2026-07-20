import { CheckCircle2, Loader2 } from 'lucide-react'
import type { SaveState } from '@/hooks/use-auto-save'

export function AutoSaveIndicator({
  saveState,
  hasUnsavedChanges,
}: {
  saveState: SaveState
  hasUnsavedChanges: boolean
}) {
  if (saveState === 'saving') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-primary">
        <Loader2 className="h-3 w-3 animate-spin" />
        Salvando...
      </span>
    )
  }

  if (saveState === 'saved') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-500 animate-saved-indicator">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Salvo
      </span>
    )
  }

  if (hasUnsavedChanges) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
        <span className="h-1.5 w-1.5 rounded-full border border-muted-foreground/40" />
        Não salvo
      </span>
    )
  }

  return null
}
