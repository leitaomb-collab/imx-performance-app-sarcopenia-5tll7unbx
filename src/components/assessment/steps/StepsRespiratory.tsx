import { StepField, NumberInput, ReadOnlyField, SectionTitle } from '@/components/assessment/shared'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { calcPercent } from '@/lib/clinical-utils'
import type { StepProps, RespiratoryStrengthData, SpirometryData } from '@/types/assessment'

export function Step8Respiratory({ form, updateField }: StepProps) {
  const rs = form.respiratoryStrength
  const set = (patch: Partial<RespiratoryStrengthData>) => {
    const next = { ...rs, ...patch }
    next.pimaxPercent = calcPercent(next.pimaxActual, next.pimaxPredicted)
    next.pemaxPercent = calcPercent(next.pemaxActual, next.pemaxPredicted)
    updateField('respiratoryStrength', next)
  }
  return (
    <div className="space-y-4">
      <SectionTitle title="Força Respiratória" />
      <p className="text-xs italic text-muted-foreground">
        Valores previstos baseados em Neder et al.
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        <StepField label="Pimax Real (cmH₂O)">
          <NumberInput
            value={rs.pimaxActual}
            onChange={(v) => set({ pimaxActual: v })}
            inputMode="numeric"
          />
        </StepField>
        <StepField label="Pimax Previsto (cmH₂O)">
          <NumberInput
            value={rs.pimaxPredicted}
            onChange={(v) => set({ pimaxPredicted: v })}
            inputMode="numeric"
          />
        </StepField>
        <ReadOnlyField label="Pimax %" value={rs.pimaxPercent} />
        <StepField label="Pemax Real (cmH₂O)">
          <NumberInput
            value={rs.pemaxActual}
            onChange={(v) => set({ pemaxActual: v })}
            inputMode="numeric"
          />
        </StepField>
        <StepField label="Pemax Previsto (cmH₂O)">
          <NumberInput
            value={rs.pemaxPredicted}
            onChange={(v) => set({ pemaxPredicted: v })}
            inputMode="numeric"
          />
        </StepField>
        <ReadOnlyField label="Pemax %" value={rs.pemaxPercent} />
      </div>
    </div>
  )
}

export function Step9Spirometry({ form, updateField }: StepProps) {
  const sp = form.spirometry
  const set = (patch: Partial<SpirometryData>) => {
    const next = { ...sp, ...patch }
    next.fvcPercent = calcPercent(next.fvc, next.fvcPredicted)
    next.fev1Percent = calcPercent(next.fev1, next.fev1Predicted)
    next.fef2575Percent = calcPercent(next.fef2575, next.fef2575Predicted)
    next.peakExpiratoryFlowPercent = calcPercent(
      next.peakExpiratoryFlow,
      next.peakExpiratoryFlowPredicted,
    )
    updateField('spirometry', next)
  }
  return (
    <div className="space-y-4">
      <SectionTitle title="Espirometria" />
      <div className="grid md:grid-cols-2 gap-4">
        <StepField label="CVF (L)">
          <NumberInput value={sp.fvc} onChange={(v) => set({ fvc: v })} step="0.01" />
        </StepField>
        <StepField label="CVF Previsto (L)">
          <NumberInput
            value={sp.fvcPredicted}
            onChange={(v) => set({ fvcPredicted: v })}
            step="0.01"
          />
        </StepField>
        <ReadOnlyField label="CVF %" value={sp.fvcPercent} />
        <StepField label="VEF1 (L)">
          <NumberInput value={sp.fev1} onChange={(v) => set({ fev1: v })} step="0.01" />
        </StepField>
        <StepField label="VEF1 Previsto (L)">
          <NumberInput
            value={sp.fev1Predicted}
            onChange={(v) => set({ fev1Predicted: v })}
            step="0.01"
          />
        </StepField>
        <ReadOnlyField label="VEF1 %" value={sp.fev1Percent} />
        <StepField label="VEF1/CVF (%)">
          <NumberInput
            value={sp.fev1FvcRatio}
            onChange={(v) => set({ fev1FvcRatio: v })}
            step="0.1"
          />
        </StepField>
        <StepField label="FEF25-75% (L/s)">
          <NumberInput value={sp.fef2575} onChange={(v) => set({ fef2575: v })} step="0.01" />
        </StepField>
        <StepField label="PFE (L/s)">
          <NumberInput
            value={sp.peakExpiratoryFlow}
            onChange={(v) => set({ peakExpiratoryFlow: v })}
            step="0.01"
          />
        </StepField>
        <div className="space-y-1.5 mb-5">
          <Label className="text-sm font-medium">Padrão</Label>
          <Select
            value={sp.pattern ?? ''}
            onValueChange={(v) => set({ pattern: v as SpirometryData['pattern'] })}
          >
            <SelectTrigger className="h-11 rounded-lg">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="obstrutivo">Obstrutivo</SelectItem>
              <SelectItem value="restritivo">Restritivo</SelectItem>
              <SelectItem value="misto">Misto</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
