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
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { deletePatient } from '@/services/patients'
import type { Patient } from '@/types'

interface DeletePatientDialogProps {
  patient: Patient | null
  onOpenChange: (open: boolean) => void
  onSuccess: (id: string) => void
}

export function DeletePatientDialog({
  patient,
  onOpenChange,
  onSuccess,
}: DeletePatientDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!patient) return
    setLoading(true)
    try {
      await deletePatient(patient.id)
      toast.success('Paciente excluído')
      onOpenChange(false)
      onSuccess(patient.id)
    } catch {
      toast.error('Não foi possível excluir o paciente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={!!patient} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Paciente</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir {patient?.name}? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading || !patient}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
