import { AlertTriangle, RotateCcw, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function RecoveryBanner({
  timestamp,
  onRestore,
  onDiscard,
}: {
  timestamp: number
  onRestore: () => void
  onDiscard: () => void
}) {
  const dateStr = format(new Date(timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border-l-[3px] border-primary bg-accent/30 animate-fade-in">
      <div className="flex items-start gap-2 flex-1">
        <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-foreground">
          Você tem um rascunho não salvo de {dateStr}. Deseja continuar de onde parou ou recomeçar?
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button size="sm" variant="outline" onClick={onDiscard}>
          <RotateCcw className="h-3.5 w-3.5 mr-1" /> Recomeçar
        </Button>
        <Button size="sm" onClick={onRestore}>
          <FileText className="h-3.5 w-3.5 mr-1" /> Continuar rascunho
        </Button>
      </div>
    </div>
  )
}
