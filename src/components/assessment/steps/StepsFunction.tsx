import { StepField, NumberInput, ClinicalBadge, SectionTitle } from '@/components/assessment/shared'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  getChairStandStatus,
  getTUGStatus,
  getSPPBStatus,
  getSPPBTotal,
} from '@/lib/clinical-utils'
import { cn } from '@/lib/utils'
import { calculateAge } from '@/lib/patient-utils'
import { getHandgripPercentile, getHandgripNorms } from '@/constants/handgripNorms'
import type { StepProps, MuscleStrengthData, BalanceAssessmentData } from '@/types/assessment'

function HandgripInterpretation({
  value,
  patient,
}: {
  value?: number
  patient: StepProps['patient']
}) {
  const sex = patient?.gender === 'F' ? 'F' : 'M'
  const sexKnown = patient?.gender === 'M' || patient?.gender === 'F'
  const sexLabel = sex === 'M' ? 'homem' : 'mulher'
  const cutoff = sex === 'M' ? 27 : 16

  const citation = (
    <p className="text-[0.625rem] text-muted-foreground/70">
      Valores normativos: estudo internacional com 2,4 milhões de adultos de 69 países (2024).
      Cutoff de sarcopenia: consenso EWGSOP2 (2019).
    </p>
  )

  if (!patient?.birthDate) {
    return (
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Data de nascimento não cadastrada</p>
        {sexKnown && citation}
      </div>
    )
  }

  const age = calculateAge(patient.birthDate)
  const hasValue = value != null && !isNaN(value) && value >= 0
  const result = hasValue ? getHandgripPercentile(sex, age, value) : null
  const norms = getHandgripNorms(sex, age)
  const noNorms = !norms.ageGroup

  return (
    <div className="space-y-1">
      {noNorms ? (
        <p className="text-xs text-muted-foreground">
          Dados normativos não disponíveis para esta faixa etária
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Referência para {sexLabel} de {norms.ageGroup}: normal acima de {norms.p5Value} kg (P5 da
          população)
        </p>
      )}

      {result?.percentile != null && (
        <p className="text-xs text-muted-foreground">Percentil: {result.percentile}º</p>
      )}

      {result?.interpretation && (
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap',
            result.interpretation === 'Normal'
              ? 'clinical-badge-normal'
              : 'clinical-badge-moderate',
          )}
        >
          {result.interpretation === 'Normal' ? 'Normal' : 'Força Reduzida'}
        </span>
      )}

      {hasValue && result?.ewgsop2Status && (
        <div className="pt-1.5 mt-1 border-t space-y-0.5">
          <p className="text-xs font-medium text-muted-foreground">
            Rastreio de sarcopenia (EWGSOP2)
          </p>
          <p className="text-xs text-muted-foreground">
            Limite: {cutoff} kg para {sex === 'M' ? 'homens' : 'mulheres'}
          </p>
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap',
              result.ewgsop2Status === 'Sem indicativo de sarcopenia'
                ? 'clinical-badge-normal'
                : 'clinical-badge-moderate',
            )}
          >
            {result.ewgsop2Status}
          </span>
        </div>
      )}

      {sexKnown && citation}
    </div>
  )
}

export function Step6Strength({ form, patient, updateField }: StepProps) {
  const ms = form.muscleStrength
  const set = (patch: Partial<MuscleStrengthData>) =>
    updateField('muscleStrength', { ...ms, ...patch })
  return (
    <div className="space-y-4">
      <SectionTitle title="Força Muscular" />
      <div className="grid md:grid-cols-2 gap-4">
        <StepField label="Handgrip Esquerdo (kg)">
          <NumberInput
            value={ms.handgripLeft}
            onChange={(v) => set({ handgripLeft: v })}
            step="0.1"
          />
          <HandgripInterpretation value={ms.handgripLeft} patient={patient} />
        </StepField>
        <StepField label="Handgrip Direito (kg)">
          <NumberInput
            value={ms.handgripRight}
            onChange={(v) => set({ handgripRight: v })}
            step="0.1"
          />
          <HandgripInterpretation value={ms.handgripRight} patient={patient} />
        </StepField>
        <StepField label="Tempo Sentar-Levantar (s)">
          <div className="flex items-center gap-2">
            <NumberInput
              value={ms.chairStandTime}
              onChange={(v) => set({ chairStandTime: v })}
              step="0.1"
            />
            <ClinicalBadge status={getChairStandStatus(ms.chairStandTime)} />
          </div>
        </StepField>
      </div>
    </div>
  )
}

export function Step7Balance({ form, updateField }: StepProps) {
  const ba = form.balanceAssessment
  const sppbTotal = getSPPBTotal(ba.sppbBalance, ba.sppbGait, ba.sppbChair)
  const set = (patch: Partial<BalanceAssessmentData>) => {
    const next = { ...ba, ...patch }
    next.sppbTotal = getSPPBTotal(next.sppbBalance, next.sppbGait, next.sppbChair)
    updateField('balanceAssessment', next)
  }
  return (
    <div className="space-y-4">
      <SectionTitle title="Equilíbrio & Mobilidade" />
      <div className="grid md:grid-cols-2 gap-4">
        <StepField label="TUG Simples (s)">
          <div className="flex items-center gap-2">
            <NumberInput value={ba.tugSimple} onChange={(v) => set({ tugSimple: v })} step="0.1" />
            <ClinicalBadge status={getTUGStatus(ba.tugSimple)} variant="tug" />
          </div>
        </StepField>
        <StepField label="TUG Dupla Tarefa (s)">
          <NumberInput
            value={ba.tugDualTask}
            onChange={(v) => set({ tugDualTask: v })}
            step="0.1"
          />
        </StepField>
      </div>
      <div className="space-y-2 pt-2">
        <Label className="font-semibold">SPPB</Label>
        <div className="grid md:grid-cols-3 gap-4">
          <StepField label="Equilíbrio (0-4)">
            <NumberInput
              value={ba.sppbBalance}
              onChange={(v) => set({ sppbBalance: v })}
              min={0}
              max={4}
              inputMode="numeric"
            />
          </StepField>
          <StepField label="Marcha (0-4)">
            <NumberInput
              value={ba.sppbGait}
              onChange={(v) => set({ sppbGait: v })}
              min={0}
              max={4}
              inputMode="numeric"
            />
          </StepField>
          <StepField label="Sentar-Levantar (0-4)">
            <NumberInput
              value={ba.sppbChair}
              onChange={(v) => set({ sppbChair: v })}
              min={0}
              max={4}
              inputMode="numeric"
            />
          </StepField>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">SPPB Total: {sppbTotal ?? '-'}</span>
          <ClinicalBadge status={getSPPBStatus(sppbTotal)} />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <Label className="font-semibold">Estabilometria</Label>
        <div className="grid md:grid-cols-2 gap-4">
          <StepField label="Olhos Abertos">
            <Input
              value={ba.stabilometryEyesOpen ?? ''}
              onChange={(e) => set({ stabilometryEyesOpen: e.target.value })}
              className="h-11 rounded-lg text-sm"
            />
          </StepField>
          <StepField label="Olhos Fechados">
            <Input
              value={ba.stabilometryEyesClosed ?? ''}
              onChange={(e) => set({ stabilometryEyesClosed: e.target.value })}
              className="h-11 rounded-lg text-sm"
            />
          </StepField>
        </div>
      </div>
    </div>
  )
}
