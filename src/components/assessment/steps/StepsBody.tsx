import {
  StepField,
  NumberInput,
  ReadOnlyField,
  ClinicalBadge,
  SectionTitle,
} from '@/components/assessment/shared'
import { Input } from '@/components/ui/input'
import { Info } from 'lucide-react'
import {
  getALMIStatus,
  getPhaseAngleStatus,
  getCalfCircumferenceStatus,
} from '@/lib/clinical-utils'
import { calculateIMC, getIMCCategory } from '@/lib/patient-utils'
import type { StepProps, BodyCompositionData, AnthropometryData } from '@/types/assessment'

export function Step3Bioimpedance({ form, patient, updateField }: StepProps) {
  const bc = form.bodyComposition
  const gender = patient?.gender ?? 'M'
  const set = (patch: Partial<BodyCompositionData>) =>
    updateField('bodyComposition', { ...bc, ...patch })
  return (
    <div className="space-y-4">
      <SectionTitle title="Bioimpedância" />
      <div className="grid md:grid-cols-2 gap-4">
        <StepField label="Massa Magra (kg)">
          <NumberInput value={bc.leanMass} onChange={(v) => set({ leanMass: v })} step="0.1" />
        </StepField>
        <StepField label="Massa Muscular Esquelética (kg)">
          <NumberInput
            value={bc.skeletalMuscleMass}
            onChange={(v) => set({ skeletalMuscleMass: v })}
            step="0.1"
          />
        </StepField>
        <StepField label="Massa Gorda (kg)">
          <NumberInput value={bc.fatMass} onChange={(v) => set({ fatMass: v })} step="0.1" />
        </StepField>
        <StepField label="% Gordura">
          <NumberInput
            value={bc.fatPercentage}
            onChange={(v) => set({ fatPercentage: v })}
            step="0.1"
          />
        </StepField>
        <StepField label="Massa Muscular Apendicular (kg)">
          <NumberInput
            value={bc.appendicularMuscleMass}
            onChange={(v) => set({ appendicularMuscleMass: v })}
            step="0.1"
          />
        </StepField>
        <StepField label="ALMI (kg/m²)">
          <div className="flex items-center gap-2">
            <NumberInput value={bc.almi} onChange={(v) => set({ almi: v })} step="0.01" />
            <ClinicalBadge status={getALMIStatus(bc.almi, gender)} />
          </div>
        </StepField>
        <StepField label="Ângulo de Fase (°)">
          <div className="flex items-center gap-2">
            <NumberInput
              value={bc.phaseAngle}
              onChange={(v) => set({ phaseAngle: v })}
              step="0.1"
            />
            <ClinicalBadge status={getPhaseAngleStatus(bc.phaseAngle, gender)} />
          </div>
        </StepField>
        <StepField label="Água Corporal Total (L)">
          <NumberInput
            value={bc.totalBodyWater}
            onChange={(v) => set({ totalBodyWater: v })}
            step="0.1"
          />
        </StepField>
        <StepField label="Taxa Metabólica Basal (kcal)">
          <NumberInput
            value={bc.basalMetabolicRate}
            onChange={(v) => set({ basalMetabolicRate: v })}
            inputMode="numeric"
          />
        </StepField>
        {patient?.weight && patient?.height && (
          <ReadOnlyField
            label="IMC Calculado"
            value={`${calculateIMC(patient.weight, patient.height).toFixed(1)} (${getIMCCategory(
              calculateIMC(patient.weight, patient.height),
            )})`}
          />
        )}
      </div>
    </div>
  )
}

export function Step4Anthropometry({ form, patient, updateField }: StepProps) {
  const an = form.anthropometry
  const gender = patient?.gender ?? 'M'
  const set = (patch: Partial<AnthropometryData>) =>
    updateField('anthropometry', { ...an, ...patch })
  return (
    <div className="space-y-4">
      <SectionTitle title="Antropometria" />
      <div className="grid md:grid-cols-2 gap-4">
        <StepField label="Circunferência da Panturrilha (cm)">
          <div className="flex items-center gap-2">
            <NumberInput
              value={an.calfCircumference}
              onChange={(v) => set({ calfCircumference: v })}
              step="0.1"
            />
            <ClinicalBadge status={getCalfCircumferenceStatus(an.calfCircumference, gender)} />
          </div>
        </StepField>
        <StepField label="Circunferência da Cintura (cm)">
          <NumberInput
            value={an.waistCircumference}
            onChange={(v) => set({ waistCircumference: v })}
            step="0.1"
          />
        </StepField>
        <StepField label="Somatotipo">
          <Input
            value={an.somatotype ?? ''}
            onChange={(e) => set({ somatotype: e.target.value })}
            className="h-11 rounded-md text-sm"
            placeholder="Ex: endomorfo, mesomorfo..."
          />
        </StepField>
      </div>
      <div className="rounded-lg bg-blue-500/5 p-3 text-sm text-muted-foreground flex items-start gap-2">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
        <div>
          Circunferência da panturrilha &lt; 34 cm (homens) ou &lt; 33 cm (mulheres) é indicador de
          risco para sarcopenia segundo critérios EWGSOP2.
        </div>
      </div>
    </div>
  )
}
