import {
  StepField,
  NumberInput,
  StepSection,
  ClinicalBadge,
  InfoBox,
  SectionTitle,
} from '@/components/assessment/shared'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getALMIStatus,
  getPhaseAngleStatus,
  getCalfCircumferenceStatus,
} from '@/lib/clinical-utils'
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
        <StepField label="Gordura (%)">
          <NumberInput
            value={bc.fatPercentage}
            onChange={(v) => set({ fatPercentage: v })}
            step="0.1"
          />
        </StepField>
        <StepField label="AMM (kg)">
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
        <StepField label="TMB (kcal)">
          <NumberInput
            value={bc.basalMetabolicRate}
            onChange={(v) => set({ basalMetabolicRate: v })}
          />
        </StepField>
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
        <StepField
          label="Circunferência da Panturrilha (cm)"
          hint="Protocolo: medida no ponto de maior circunferência"
        >
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
          <Select value={an.somatotype ?? ''} onValueChange={(v) => set({ somatotype: v })}>
            <SelectTrigger className="h-11 rounded-lg">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ectomorfo">Ectomorfo</SelectItem>
              <SelectItem value="mesomorfo">Mesomorfo</SelectItem>
              <SelectItem value="endomorfo">Endomorfo</SelectItem>
            </SelectContent>
          </Select>
        </StepField>
      </div>
      <InfoBox>
        Circunferência da panturrilha &lt; {gender === 'M' ? '34' : '33'} cm é um indicador de baixa
        massa muscular (EWGSOP2).
      </InfoBox>
    </div>
  )
}
