import { Link } from 'react-router-dom'
import { StepField, NumberInput, StepSection } from '@/components/assessment/shared'
import { BlurTextarea } from '@/components/assessment/blur-fields'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Users, CalendarClock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { StepProps } from '@/types/assessment'

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
          inputMode="numeric"
        />
      </StepField>
      <StepField label="PAD (mmHg)">
        <NumberInput
          value={v.bloodPressureDiastolic}
          onChange={(val) => set({ bloodPressureDiastolic: val })}
          inputMode="numeric"
        />
      </StepField>
      <StepField label="FC (bpm)">
        <NumberInput
          value={v.heartRate}
          onChange={(val) => set({ heartRate: val })}
          inputMode="numeric"
        />
      </StepField>
      <StepField label="FR (irpm)">
        <NumberInput
          value={v.respiratoryRate}
          onChange={(val) => set({ respiratoryRate: val })}
          inputMode="numeric"
        />
      </StepField>
      <StepField label="SpO₂ (%)">
        <NumberInput
          value={v.oxygenSaturation}
          onChange={(val) => set({ oxygenSaturation: val })}
          inputMode="numeric"
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

export function Step12Conclusion({ form, updateField, saving }: StepProps) {
  const calculateReassessmentDate = () => {
    if (!form.reassessmentMonths || form.reassessmentMonths <= 0) return
    const baseDate = new Date(form.assessmentDate + 'T00:00:00')
    baseDate.setMonth(baseDate.getMonth() + form.reassessmentMonths)
    const year = baseDate.getFullYear()
    const month = String(baseDate.getMonth() + 1).padStart(2, '0')
    const day = String(baseDate.getDate()).padStart(2, '0')
    updateField('reassessmentDate', `${year}-${month}-${day}`)
  }

  return (
    <div className="space-y-6">
      <StepSection title="Conclusão">
        <div className="space-y-2 md:col-span-2">
          <Label className="text-sm font-medium">Resumo Clínico</Label>
          <BlurTextarea
            rows={6}
            className="min-h-[12rem] rounded-lg text-sm"
            value={form.clinicalSummary}
            onCommit={(v) => updateField('clinicalSummary', v)}
            placeholder="Síntese dos achados, interpretação clínica e recomendações..."
          />
        </div>
        <StepField label="Reavaliação (meses)" hint="Padrão: 6 meses">
          <NumberInput
            value={form.reassessmentMonths}
            onChange={(val) => updateField('reassessmentMonths', val ?? 6)}
            min={1}
            max={36}
            inputMode="numeric"
          />
        </StepField>
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Recomendações de Exercício</Label>
            {saving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
          </div>
          <BlurTextarea
            aria-label="Recomendações de Exercício"
            rows={5}
            className="min-h-[8rem] rounded-lg text-sm"
            value={form.exerciseRecommendations}
            onCommit={(v) => updateField('exerciseRecommendations', v)}
            placeholder="Sem recomendações registradas"
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            Orientações de treinamento de força, equilíbrio e aeróbico baseadas nos resultados
          </p>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label className="text-sm font-medium">Recomendações Nutricionais</Label>
          <BlurTextarea
            aria-label="Recomendações Nutricionais"
            rows={5}
            className="min-h-[8rem] rounded-lg text-sm"
            value={form.nutritionRecommendations}
            onCommit={(v) => updateField('nutritionRecommendations', v)}
            placeholder="Sem recomendações registradas"
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            Sugestões de ingestão proteica e nutrientes importantes
          </p>
        </div>
        <StepField
          label="Data de Reavaliação Sugerida"
          hint="Data sugerida para a próxima avaliação"
        >
          <Input
            type="date"
            aria-label="Data de Reavaliação Sugerida"
            value={form.reassessmentDate ?? ''}
            onChange={(e) => updateField('reassessmentDate', e.target.value || null)}
            disabled={saving}
            className="h-11 min-h-[44px] rounded-lg text-sm"
          />
        </StepField>
        <div className="md:col-span-2">
          <Button
            type="button"
            variant="outline"
            onClick={calculateReassessmentDate}
            disabled={!form.reassessmentMonths || form.reassessmentMonths <= 0 || saving}
            className="h-11 min-h-[44px]"
          >
            <CalendarClock className="mr-2 h-4 w-4" />
            Calcular a partir de meses
          </Button>
        </div>
      </StepSection>
    </div>
  )
}
