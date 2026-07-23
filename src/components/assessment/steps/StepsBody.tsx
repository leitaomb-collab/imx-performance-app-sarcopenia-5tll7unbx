import {
  StepField,
  NumberInput,
  ReadOnlyField,
  ClinicalBadge,
  SectionTitle,
} from '@/components/assessment/shared'
import { calculateIMC, getIMCCategory } from '@/lib/patient-utils'
import { getALMIStatus, getPhaseAngleStatus } from '@/lib/clinical-utils'
import type { StepProps, BodyCompositionData } from '@/types/assessment'

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
          <NumberInput
            value={bc.leanMass}
            onChange={(v) => set({ leanMass: v })}
            step="0.1"
            inputMode="decimal"
          />
        </StepField>
        <StepField label="Massa Muscular Esquelética (kg)">
          <NumberInput
            value={bc.skeletalMuscleMass}
            onChange={(v) => set({ skeletalMuscleMass: v })}
            step="0.1"
            inputMode="decimal"
          />
        </StepField>
        <StepField label="Massa Gorda (kg)">
          <NumberInput
            value={bc.fatMass}
            onChange={(v) => set({ fatMass: v })}
            step="0.1"
            inputMode="decimal"
          />
        </StepField>
        <StepField label="% Gordura">
          <NumberInput
            value={bc.fatPercentage}
            onChange={(v) => set({ fatPercentage: v })}
            step="0.1"
            inputMode="decimal"
          />
        </StepField>
        <StepField label="Massa Muscular Apendicular (kg)">
          <NumberInput
            value={bc.appendicularMuscleMass}
            onChange={(v) => set({ appendicularMuscleMass: v })}
            step="0.1"
            inputMode="decimal"
          />
        </StepField>
        <StepField label="ALMI (kg/m²)">
          <div className="flex items-center gap-2">
            <NumberInput
              value={bc.almi}
              onChange={(v) => set({ almi: v })}
              step="0.01"
              inputMode="decimal"
            />
            <ClinicalBadge status={getALMIStatus(bc.almi, gender)} />
          </div>
        </StepField>
        <StepField label="Ângulo de Fase (°)">
          <div className="flex items-center gap-2">
            <NumberInput
              value={bc.phaseAngle}
              onChange={(v) => set({ phaseAngle: v })}
              step="0.1"
              inputMode="decimal"
            />
            <ClinicalBadge status={getPhaseAngleStatus(bc.phaseAngle, gender)} />
          </div>
        </StepField>
        <StepField label="Água Corporal Total (L)">
          <NumberInput
            value={bc.totalBodyWater}
            onChange={(v) => set({ totalBodyWater: v })}
            step="0.1"
            inputMode="decimal"
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
