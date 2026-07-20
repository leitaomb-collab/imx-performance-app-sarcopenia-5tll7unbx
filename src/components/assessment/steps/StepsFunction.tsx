import { StepField, NumberInput, ClinicalBadge, SectionTitle } from '@/components/assessment/shared'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  getHandgripStatus,
  getChairStandStatus,
  getTUGStatus,
  getSPPBStatus,
  getSPPBTotal,
} from '@/lib/clinical-utils'
import type { StepProps, MuscleStrengthData, BalanceAssessmentData } from '@/types/assessment'

export function Step6Strength({ form, patient, updateField }: StepProps) {
  const ms = form.muscleStrength
  const gender = patient?.gender ?? 'M'
  const max =
    ms.handgripMax ??
    (ms.handgripLeft != null || ms.handgripRight != null
      ? Math.max(ms.handgripLeft ?? 0, ms.handgripRight ?? 0)
      : undefined)
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
        </StepField>
        <StepField label="Handgrip Direito (kg)">
          <NumberInput
            value={ms.handgripRight}
            onChange={(v) => set({ handgripRight: v })}
            step="0.1"
          />
        </StepField>
        <StepField label="Handgrip Máximo (kg)">
          <div className="flex items-center gap-2">
            <NumberInput
              value={ms.handgripMax}
              onChange={(v) => set({ handgripMax: v })}
              step="0.1"
            />
            <ClinicalBadge status={getHandgripStatus(max, gender)} />
          </div>
        </StepField>
        <StepField label="Percentil Handgrip (%)">
          <NumberInput
            value={ms.handgripPercentile}
            onChange={(v) => set({ handgripPercentile: v })}
            inputMode="numeric"
          />
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
