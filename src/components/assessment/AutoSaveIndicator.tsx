import { CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function AutoSaveIndicator({
  saveState,
  hasUnsavedChanges,
  onRetry,
}: {
  saveState: SaveState
  hasUnsavedChanges: boolean
  onRetry: () => void
}) {
  if (saveState === 'saving') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-save-pulse" />
        Salvando...
      </span>
    )
  }
  if (saveState === 'saved') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-500">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Salvo automaticamente
      </span>
    )
  }
  if (saveState === 'error') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-destructive">
        <AlertCircle className="h-3.5 w-3.5" />
        Erro ao salvar
        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onRetry}>
          <RotateCcw className="h-3 w-3" />
        </Button>
      </span>
    )
  }
  if (hasUnsavedChanges) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
        <span className="h-1.5 w-1.5 rounded-full border border-muted-foreground/40" />
        Pronto para salvar
      </span>
    )
  }
  return null
}
