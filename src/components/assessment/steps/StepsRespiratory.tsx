import { StepField, NumberInput } from '@/components/assessment/shared'
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
      <h3 className="text-lg font-semibold border-b pb-2">Força Respiratória</h3>
      <p className="text-xs text-muted-foreground">Valores previstos baseados em Neder et al.</p>
      <div className="grid md:grid-cols-3 gap-4">
        <StepField label="Pimax Real (cmH₂O)">
          <NumberInput value={rs.pimaxActual} onChange={(v) => set({ pimaxActual: v })} />
        </StepField>
        <StepField label="Pimax Previsto (cmH₂O)">
          <NumberInput value={rs.pimaxPredicted} onChange={(v) => set({ pimaxPredicted: v })} />
        </StepField>
        <StepField label="Pimax %">
          <NumberInput
            value={rs.pimaxPercent}
            onChange={(v) => set({ pimaxPercent: v })}
            disabled
          />
        </StepField>
        <StepField label="Pemax Real (cmH₂O)">
          <NumberInput value={rs.pemaxActual} onChange={(v) => set({ pemaxActual: v })} />
        </StepField>
        <StepField label="Pemax Previsto (cmH₂O)">
          <NumberInput value={rs.pemaxPredicted} onChange={(v) => set({ pemaxPredicted: v })} />
        </StepField>
        <StepField label="Pemax %">
          <NumberInput
            value={rs.pemaxPercent}
            onChange={(v) => set({ pemaxPercent: v })}
            disabled
          />
        </StepField>
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
      <h3 className="text-lg font-semibold border-b pb-2">Espirometria</h3>
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
        <StepField label="CVF %">
          <NumberInput value={sp.fvcPercent} disabled />
        </StepField>
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
        <StepField label="VEF1 %">
          <NumberInput value={sp.fev1Percent} disabled />
        </StepField>
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
        <div className="space-y-2">
          <Label>Padrão</Label>
          <Select
            value={sp.pattern ?? ''}
            onValueChange={(v) => set({ pattern: v as SpirometryData['pattern'] })}
          >
            <SelectTrigger>
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
