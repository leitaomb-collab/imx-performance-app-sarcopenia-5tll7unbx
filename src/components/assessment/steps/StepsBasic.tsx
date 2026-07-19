import { Link } from 'react-router-dom'
import { StepField, NumberInput, StepSection } from '@/components/assessment/shared'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { calculateAge, formatGender, calculateIMC, getIMCCategory } from '@/lib/patient-utils'
import { Users } from 'lucide-react'
import type { StepProps } from '@/types/assessment'
import type { PosturalAssessmentData } from '@/types/assessment'

export function Step1Identification({
  form,
  patient,
  patients,
  selectPatient,
  updateField,
}: StepProps) {
  const today = new Date().toISOString().split('T')[0]
  return (
    <div className="space-y-6">
      <StepSection title="Identificação">
        <StepField label="Data da Avaliação" hint="Não é permitida data futura">
          <Input
            type="date"
            required
            max={today}
            value={form.assessmentDate}
            onChange={(e) => updateField('assessmentDate', e.target.value)}
            className="h-11 rounded-lg text-sm"
          />
        </StepField>
        <div className="space-y-2 md:col-span-2">
          <Label className="text-sm font-medium">Paciente</Label>
          {patient ? (
            <Card className="bg-secondary/50">
              <CardContent className="flex flex-wrap items-center gap-3 py-3">
                <span className="font-medium">{patient.name}</span>
                {patient.birthDate && (
                  <Badge variant="secondary">{calculateAge(patient.birthDate)} anos</Badge>
                )}
                <Badge>{formatGender(patient.gender)}</Badge>
                {patient.weight && patient.height && (
                  <Badge variant="secondary">
                    IMC: {calculateIMC(patient.weight, patient.height).toFixed(1)} (
                    {getIMCCategory(calculateIMC(patient.weight, patient.height))})
                  </Badge>
                )}
              </CardContent>
            </Card>
          ) : patients && patients.length > 0 ? (
            <Select value={form.patientId} onValueChange={(v) => selectPatient?.(v)}>
              <SelectTrigger className="h-11 rounded-lg">
                <SelectValue placeholder="Selecione um paciente..." />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center border rounded-lg border-dashed">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhum paciente cadastrado.</p>
              <Link to="/pacientes" className="text-sm text-primary underline">
                Ir para cadastro de pacientes
              </Link>
            </div>
          )}
        </div>
      </StepSection>
    </div>
  )
}

export function Step2Vitals({ form, updateField }: StepProps) {
  const v = form.vitals
  const set = (patch: Partial<typeof v>) => updateField('vitals', { ...v, ...patch })
  return (
    <StepSection title="Sinais Vitais">
      <StepField label="PAS (mmHg)">
        <NumberInput
          value={v.bloodPressureSystolic}
          onChange={(val) => set({ bloodPressureSystolic: val })}
        />
      </StepField>
      <StepField label="PAD (mmHg)">
        <NumberInput
          value={v.bloodPressureDiastolic}
          onChange={(val) => set({ bloodPressureDiastolic: val })}
        />
      </StepField>
      <StepField label="FC (bpm)">
        <NumberInput value={v.heartRate} onChange={(val) => set({ heartRate: val })} />
      </StepField>
      <StepField label="FR (irpm)">
        <NumberInput value={v.respiratoryRate} onChange={(val) => set({ respiratoryRate: val })} />
      </StepField>
      <StepField label="SpO₂ (%)">
        <NumberInput
          value={v.oxygenSaturation}
          onChange={(val) => set({ oxygenSaturation: val })}
        />
      </StepField>
      <StepField label="Temp. (°C)">
        <NumberInput
          value={v.temperature}
          onChange={(val) => set({ temperature: val })}
          step="0.1"
        />
      </StepField>
    </StepSection>
  )
}

export function Step5Postural({ form, updateField }: StepProps) {
  const pa = form.posturalAssessment
  const set = (patch: Partial<PosturalAssessmentData>) =>
    updateField('posturalAssessment', { ...pa, ...patch })
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 border-b pb-3">
        <span className="h-3 w-3 bg-primary rounded-sm shrink-0" />
        <h3 className="text-lg font-semibold">Avaliação Postural</h3>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <StepField label="Cabeça">
          <Input
            value={pa.head ?? ''}
            onChange={(e) => set({ head: e.target.value })}
            className="h-11 rounded-lg text-sm"
          />
        </StepField>
        <StepField label="Ombros">
          <Input
            value={pa.shoulders ?? ''}
            onChange={(e) => set({ shoulders: e.target.value })}
            className="h-11 rounded-lg text-sm"
          />
        </StepField>
        <StepField label="Coluna">
          <Input
            value={pa.spine ?? ''}
            onChange={(e) => set({ spine: e.target.value })}
            className="h-11 rounded-lg text-sm"
          />
        </StepField>
        <StepField label="Pelve">
          <Input
            value={pa.pelvis ?? ''}
            onChange={(e) => set({ pelvis: e.target.value })}
            className="h-11 rounded-lg text-sm"
          />
        </StepField>
        <StepField label="Joelhos">
          <Input
            value={pa.knees ?? ''}
            onChange={(e) => set({ knees: e.target.value })}
            className="h-11 rounded-lg text-sm"
          />
        </StepField>
        <StepField label="Pés">
          <Input
            value={pa.feet ?? ''}
            onChange={(e) => set({ feet: e.target.value })}
            className="h-11 rounded-lg text-sm"
          />
        </StepField>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Switch
          checked={pa.photosAttached ?? false}
          onCheckedChange={(val) => set({ photosAttached: val })}
        />
        <Label>Fotografias anexas</Label>
      </div>
      <StepField label="Observações">
        <Textarea
          rows={3}
          value={pa.observations ?? ''}
          onChange={(e) => set({ observations: e.target.value })}
          className="rounded-lg text-sm"
        />
      </StepField>
    </div>
  )
}

export function Step12Conclusion({ form, updateField }: StepProps) {
  return (
    <div className="space-y-6">
      <StepSection title="Conclusão">
        <div className="space-y-2 md:col-span-2">
          <Label className="text-sm font-medium">Resumo Clínico</Label>
          <Textarea
            rows={6}
            className="min-h-[12rem] rounded-lg text-sm"
            value={form.clinicalSummary}
            onChange={(e) => updateField('clinicalSummary', e.target.value)}
            placeholder="Síntese dos achados, interpretação clínica e recomendações..."
          />
        </div>
        <StepField label="Reavaliação (meses)" hint="Padrão: 6 meses">
          <NumberInput
            value={form.reassessmentMonths}
            onChange={(val) => updateField('reassessmentMonths', val ?? 6)}
            min={1}
            max={36}
          />
        </StepField>
      </StepSection>
    </div>
  )
}
