import { StepField, NumberInput, ReadOnlyField, SectionTitle } from '@/components/assessment/shared'
import { calcPercent } from '@/lib/clinical-utils'
import type { StepProps, RespiratoryStrengthData } from '@/types/assessment'

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
