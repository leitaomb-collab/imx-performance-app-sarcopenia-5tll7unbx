import { StepField, NumberInput, ClinicalBadge, SectionTitle } from '@/components/assessment/shared'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getSarcFTotal,
  getSarcCalFTotal,
  getSarcopeniaRisk,
  getHandgripStatus,
  getALMIStatus,
  getSPPBStatus,
  suggestEWGSOP2Diagnosis,
} from '@/lib/clinical-utils'
import { cn } from '@/lib/utils'
import type { StepProps, SarcopeniaScreeningData, EWGSOP2AnalysisData } from '@/types/assessment'
import { DIAGNOSIS_OPTIONS as DIAG_OPTS } from '@/types/assessment'

const SARCF_QUESTIONS = [
  { key: 'strength', label: 'Força: dificuldade para levantar/carregar 5 kg?' },
  { key: 'assistanceWalking', label: 'Caminhada: dificuldade para atravessar um quarto?' },
  { key: 'riseChair', label: 'Levantar: dificuldade para levantar de uma cadeira?' },
  { key: 'climbStairs', label: 'Escadas: dificuldade para subir 10 degraus?' },
  { key: 'falls', label: 'Quedas: quantas vezes caiu no último ano?' },
] as const

const SARCF_OPTIONS = [
  { value: 0, label: 'Nenhuma' },
  { value: 1, label: 'Alguma' },
  { value: 2, label: 'Muita' },
] as const

export function Step10Screening({ form, patient, updateField }: StepProps) {
  const ss = form.sarcopeniaScreening
  const gender = patient?.gender ?? 'M'
  const sarcFTotal = getSarcFTotal([
    ss.strength,
    ss.assistanceWalking,
    ss.riseChair,
    ss.climbStairs,
    ss.falls,
  ])
  const sarcCalFTotal = getSarcCalFTotal(sarcFTotal, ss.calfCircumference, gender)
  const risk = getSarcopeniaRisk(sarcCalFTotal ?? sarcFTotal)
  const set = (patch: Partial<SarcopeniaScreeningData>) => {
    const next = { ...ss, ...patch }
    const total = getSarcFTotal([
      next.strength,
      next.assistanceWalking,
      next.riseChair,
      next.climbStairs,
      next.falls,
    ])
    next.sarcFTotal = total
    next.sarcCalFTotal = getSarcCalFTotal(total, next.calfCircumference, gender)
    next.risk = getSarcopeniaRisk(next.sarcCalFTotal ?? total) ?? undefined
    updateField('sarcopeniaScreening', next)
  }
  return (
    <div className="space-y-4">
      <SectionTitle title="Triagem de Sarcopenia" />
      <div className="space-y-3">
        {SARCF_QUESTIONS.map((q) => (
          <div key={q.key} className="rounded-lg border p-3 space-y-2.5">
            <Label className="text-sm font-medium">{q.label}</Label>
            <div className="grid grid-cols-3 gap-2">
              {SARCF_OPTIONS.map((opt) => {
                const isSelected = ss[q.key] === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set({ [q.key]: opt.value } as Partial<SarcopeniaScreeningData>)}
                    className={cn(
                      'flex flex-col items-center gap-0.5 rounded-md border-2 py-2 px-2 transition-all duration-200 min-h-[44px]',
                      isSelected
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/30 hover:bg-accent',
                    )}
                  >
                    <span className="text-lg font-bold">{opt.value}</span>
                    <span className="text-xs">{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <StepField label="Circunferência de Panturrilha" hint="Obrigatório · cm · 10 a 80">
        <NumberInput
          value={ss.calfCircumference}
          onChange={(v) => set({ calfCircumference: v })}
          step="0.1"
          min={10}
          max={80}
          inputMode="decimal"
          aria-label="Circunferência de Panturrilha em centímetros"
        />
      </StepField>
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <Badge variant="secondary">SARC-F: {sarcFTotal ?? '-'}</Badge>
        <Badge variant="secondary">SARC-CalF: {sarcCalFTotal ?? '-'}</Badge>
        {risk && (
          <Badge
            className={cn(
              'text-xs font-semibold uppercase border-0 px-2 py-0.5',
              risk === 'baixo' && 'clinical-badge-normal',
              risk === 'moderado' && 'clinical-badge-moderate',
              risk === 'alto' && 'clinical-badge-reduced',
            )}
          >
            Risco: {risk}
          </Badge>
        )}
      </div>
    </div>
  )
}

export function Step11EWGSOP2({ form, patient, updateField }: StepProps) {
  const gender = patient?.gender ?? 'M'
  const ms = form.muscleStrength
  const bc = form.bodyComposition
  const ba = form.balanceAssessment
  const handgrip =
    ms.handgripMax ??
    (ms.handgripLeft != null || ms.handgripRight != null
      ? Math.max(ms.handgripLeft ?? 0, ms.handgripRight ?? 0)
      : undefined)
  const hgLow = getHandgripStatus(handgrip, gender) === 'reduced'
  const almiLow = getALMIStatus(bc.almi, gender) === 'reduced'
  const sppbLow = getSPPBStatus(ba.sppbTotal) === 'reduced'
  const suggested = suggestEWGSOP2Diagnosis(hgLow, almiLow, sppbLow)
  const ea = form.ewgsop2Analysis

  const setDiagnosis = (diagnosis: string) => {
    const validDiagnosis = DIAG_OPTS.find((o) => o.value === diagnosis)?.value ?? 'nao_avaliado'
    updateField('ewgsop2Analysis', {
      ...ea,
      diagnosis: validDiagnosis as EWGSOP2AnalysisData['diagnosis'],
      muscleStrengthLow: hgLow,
      muscleMassLow: almiLow,
      physicalPerformanceLow: sppbLow,
    } as EWGSOP2AnalysisData)
    updateField('finalDiagnosis', validDiagnosis as EWGSOP2AnalysisData['diagnosis'])
  }

  const rows = [
    {
      label: 'SARC-F',
      value: form.sarcopeniaScreening.sarcFTotal,
      cutoff: '≥4',
      low: (form.sarcopeniaScreening.sarcFTotal ?? 0) >= 4,
    },
    { label: 'Handgrip (kg)', value: handgrip, cutoff: gender === 'M' ? '<27' : '<16', low: hgLow },
    {
      label: 'ALMI (kg/m²)',
      value: bc.almi,
      cutoff: gender === 'M' ? '<7.0' : '<6.0',
      low: almiLow,
    },
    { label: 'SPPB Total', value: ba.sppbTotal, cutoff: '<10', low: sppbLow },
  ]

  return (
    <div className="space-y-4">
      <SectionTitle title="Análise EWGSOP2" />
      <div className="rounded-lg overflow-hidden border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary">
              <th className="text-left py-2.5 px-3 text-xs font-semibold uppercase">Parâmetro</th>
              <th className="text-center text-xs font-semibold uppercase">Valor</th>
              <th className="text-center text-xs font-semibold uppercase">Cut-off</th>
              <th className="text-center text-xs font-semibold uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.label}
                className={cn('border-t animate-ewgsop2-row', i % 2 === 1 && 'bg-muted/20')}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <td className="py-2.5 px-3">{r.label}</td>
                <td className="text-center py-2.5 px-3">{r.value ?? '-'}</td>
                <td className="text-center py-2.5 px-3 text-muted-foreground">{r.cutoff}</td>
                <td className="text-center py-2.5 px-3">
                  {r.value != null && <ClinicalBadge status={r.low ? 'reduced' : 'normal'} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {suggested !== 'sem_sarcopenia' && (
        <p className="text-sm text-muted-foreground">
          Diagnóstico sugerido:{' '}
          <span className="font-medium text-foreground">
            {DIAG_OPTS.find((d) => d.value === suggested)?.label}
          </span>
        </p>
      )}
      <RadioGroup value={ea.diagnosis ?? form.finalDiagnosis} onValueChange={setDiagnosis}>
        <div className="grid md:grid-cols-2 gap-3">
          {DIAG_OPTS.map((opt) => {
            const isSelected = (ea.diagnosis ?? form.finalDiagnosis) === opt.value
            const isGrave = opt.value === 'sarcopenia_grave'
            const isSuggested = opt.value === suggested && suggested !== 'sem_sarcopenia'
            return (
              <label
                key={opt.value}
                className={cn(
                  'flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted',
                  isSelected && !isGrave && 'border-primary bg-primary/5',
                  isSelected && isGrave && 'border-destructive bg-destructive/5',
                  !isSelected && 'border-border',
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    isSelected && !isGrave && 'border-primary bg-primary',
                    isSelected && isGrave && 'border-destructive bg-destructive',
                    !isSelected && 'border-input',
                  )}
                >
                  {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                </span>
                <RadioGroupItem value={opt.value} className="sr-only" />
                <span className="text-sm font-medium">{opt.label}</span>
                {isSuggested && (
                  <span className="ml-auto text-[0.625rem] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    Sugerido
                  </span>
                )}
              </label>
            )
          })}
        </div>
      </RadioGroup>
    </div>
  )
}
