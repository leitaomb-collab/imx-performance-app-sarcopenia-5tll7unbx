import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { updateAssessment } from '@/services/assessments'
import { DIAGNOSIS_OPTIONS } from '@/types/assessment'
import { extractFieldErrors, getErrorMessage, type FieldErrors } from '@/lib/pocketbase/errors'

interface FinalizeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assessmentId: string
  currentDiagnosis: string
  onSuccess: () => void
}

export function FinalizeDialog({
  open,
  onOpenChange,
  assessmentId,
  currentDiagnosis,
  onSuccess,
}: FinalizeDialogProps) {
  const [diagnosis, setDiagnosis] = useState<string>(currentDiagnosis)
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setDiagnosis(currentDiagnosis)
      setFieldErrors({})
      setErrorMessage(null)
    }
  }, [open, currentDiagnosis])

  const handleConfirm = async () => {
    setLoading(true)
    setFieldErrors({})
    setErrorMessage(null)
    try {
      await updateAssessment(assessmentId, {
        status: 'concluida',
        finalDiagnosis: diagnosis,
      })
      toast.success('Avaliação finalizada com sucesso')
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      console.error('Finalize assessment error:', err)
      const fieldErrs = extractFieldErrors(err)
      const msg = getErrorMessage(err)
      setFieldErrors(fieldErrs)
      setErrorMessage(msg)
      toast.error('Erro ao finalizar avaliação', {
        description: msg,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalizar Avaliação</DialogTitle>
          <DialogDescription>
            Esta ação irá bloquear a avaliação para edição. Confirme o diagnóstico final abaixo.
          </DialogDescription>
        </DialogHeader>
        <RadioGroup value={diagnosis} onValueChange={setDiagnosis}>
          <div className="grid grid-cols-2 gap-3">
            {DIAGNOSIS_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  'flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors',
                  diagnosis === opt.value ? 'border-primary bg-primary/5' : 'border-border',
                )}
              >
                <RadioGroupItem value={opt.value} />
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
        </RadioGroup>
        {(errorMessage || Object.keys(fieldErrors).length > 0) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-1">
              <p>{errorMessage || 'Erro ao finalizar avaliação.'}</p>
              {Object.entries(fieldErrors).map(([field, msg]) => (
                <p key={field} className="text-xs">
                  <span className="font-medium">{field}:</span> {msg}
                </p>
              ))}
            </AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Finalizar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
