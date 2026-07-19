import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { createPatient } from '@/services/patients'
import { getErrorMessage } from '@/lib/pocketbase/errors'

interface CreatePatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormErrors {
  name?: string
  birthDate?: string
  gender?: string
}

const emptyForm = {
  name: '',
  birthDate: '',
  gender: '',
  weight: '',
  height: '',
  chronicMedications: '',
  notes: '',
}

export function CreatePatientDialog({ open, onOpenChange }: CreatePatientDialogProps) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (!open) {
      setForm(emptyForm)
      setErrors({})
    }
  }, [open])

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

  const isFormValid = Boolean(form.name.trim() && form.birthDate && form.gender)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
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
      const patient = await createPatient(payload)
      toast.success('Paciente cadastrado com sucesso')
      onOpenChange(false)
      navigate(`/paciente/${patient.id}`)
    } catch (err) {
      toast.error('Não foi possível cadastrar o paciente', { description: getErrorMessage(err) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Paciente</DialogTitle>
          <DialogDescription>Preencha os dados para cadastrar um novo paciente.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthDate">Data de Nascimento</Label>
            <Input
              id="birthDate"
              type="date"
              required
              value={form.birthDate}
              onChange={(e) => updateForm('birthDate', e.target.value)}
            />
            {errors.birthDate && <p className="text-sm text-destructive">{errors.birthDate}</p>}
          </div>
          <div className="space-y-2">
            <Label>Gênero</Label>
            <Select value={form.gender} onValueChange={(v) => updateForm('gender', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Feminino</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                min={0}
                max={500}
                step={0.1}
                value={form.weight}
                onChange={(e) => updateForm('weight', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Estatura (m)</Label>
              <Input
                id="height"
                type="number"
                min={0.5}
                max={2.5}
                step={0.01}
                value={form.height}
                onChange={(e) => updateForm('height', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="meds">Medicamentos</Label>
            <Textarea
              id="meds"
              rows={3}
              placeholder="Medicamentos de uso contínuo"
              value={form.chronicMedications}
              onChange={(e) => updateForm('chronicMedications', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              rows={2}
              value={form.notes}
              onChange={(e) => updateForm('notes', e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !isFormValid}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
