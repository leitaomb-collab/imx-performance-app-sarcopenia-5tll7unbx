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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { updatePatient } from '@/services/patients'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import type { Patient } from '@/types'

interface EditPatientDialogProps {
  patient: Patient | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (patient: Patient) => void
}

interface FormErrors {
  name?: string
  birthDate?: string
  gender?: string
}

export function EditPatientDialog({
  patient,
  open,
  onOpenChange,
  onSuccess,
}: EditPatientDialogProps) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [form, setForm] = useState({
    name: '',
    birthDate: '',
    gender: '',
    weight: '',
    height: '',
    chronicMedications: '',
    notes: '',
  })

  useEffect(() => {
    if (open && patient) {
      setForm({
        name: patient.name || '',
        birthDate: patient.birthDate ? patient.birthDate.split('T')[0].split(' ')[0] : '',
        gender: patient.gender || '',
        weight: patient.weight != null ? String(patient.weight) : '',
        height: patient.height != null ? String(patient.height) : '',
        chronicMedications: patient.chronicMedications || '',
        notes: patient.notes || '',
      })
      setErrors({})
    }
  }, [open, patient])

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!form.name.trim()) e.name = 'Nome é obrigatório'
    if (!form.birthDate) e.birthDate = 'Data de nascimento é obrigatória'
    else if (form.birthDate > new Date().toISOString().split('T')[0])
      e.birthDate = 'Data não pode ser futura'
    if (!form.gender) e.gender = 'Selecione o gênero'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patient || !validate()) return
    setLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        birthDate: form.birthDate,
        gender: form.gender as 'M' | 'F',
        ...(form.weight ? { weight: parseFloat(form.weight) } : {}),
        ...(form.height ? { height: parseFloat(form.height) } : {}),
        chronicMedications: form.chronicMedications,
        notes: form.notes,
      }
      const updated = await updatePatient(patient.id, payload)
      toast.success('Dados do paciente atualizados')
      onOpenChange(false)
      onSuccess(updated)
    } catch (err) {
      toast.error('Não foi possível atualizar o paciente', {
        description: getErrorMessage(err),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Editar Paciente</DialogTitle>
          <DialogDescription>Atualize os dados do paciente.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome</Label>
            <Input
              id="edit-name"
              required
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'edit-name-error' : undefined}
            />
            {errors.name && (
              <p id="edit-name-error" className="text-sm text-destructive">
                {errors.name}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-birthDate">Data de Nascimento</Label>
            <Input
              id="edit-birthDate"
              type="date"
              required
              value={form.birthDate}
              onChange={(e) => updateForm('birthDate', e.target.value)}
              aria-invalid={!!errors.birthDate}
              aria-describedby={errors.birthDate ? 'edit-birthDate-error' : undefined}
            />
            {errors.birthDate && (
              <p id="edit-birthDate-error" className="text-sm text-destructive">
                {errors.birthDate}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Gênero</Label>
            <Select value={form.gender} onValueChange={(v) => updateForm('gender', v)}>
              <SelectTrigger
                aria-invalid={!!errors.gender}
                aria-describedby={errors.gender ? 'edit-gender-error' : undefined}
              >
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Feminino</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p id="edit-gender-error" className="text-sm text-destructive">
                {errors.gender}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-weight">Peso (kg)</Label>
              <Input
                id="edit-weight"
                type="number"
                min={0}
                max={500}
                step={0.1}
                inputMode="decimal"
                value={form.weight}
                onChange={(e) => updateForm('weight', e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-height">Estatura (m)</Label>
              <Input
                id="edit-height"
                type="number"
                min={0.5}
                max={2.5}
                step={0.01}
                inputMode="decimal"
                value={form.height}
                onChange={(e) => updateForm('height', e.target.value)}
                className="h-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-meds">Medicamentos de Uso Contínuo</Label>
            <Textarea
              id="edit-meds"
              rows={3}
              value={form.chronicMedications}
              onChange={(e) => updateForm('chronicMedications', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Observações</Label>
            <Textarea
              id="edit-notes"
              rows={2}
              value={form.notes}
              onChange={(e) => updateForm('notes', e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="min-h-[44px]">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
