import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteAssessment } from '@/services/assessments'
import { formatDateBR } from '@/lib/patient-utils'
import type { Assessment } from '@/types'

interface DeleteAssessmentDialogProps {
  assessment: Assessment | null
  onOpenChange: (open: boolean) => void
  onSuccess: (id: string) => void
}

export function DeleteAssessmentDialog({
  assessment,
  onOpenChange,
  onSuccess,
}: DeleteAssessmentDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!assessment) return
    setLoading(true)
    try {
      await deleteAssessment(assessment.id)
      toast.success('Avaliação excluída')
      onOpenChange(false)
      onSuccess(assessment.id)
    } catch {
      toast.error('Não foi possível excluir a avaliação')
    } finally {
      setLoading(false)
    }
  }

  const dateLabel = assessment ? formatDateBR(assessment.assessmentDate) : ''

  return (
    <Dialog open={!!assessment} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex flex-col items-center gap-2 pb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
        </div>
        <DialogHeader className="text-center">
          <DialogTitle>Excluir Avaliação</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir a avaliação de {dateLabel}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading || !assessment}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
