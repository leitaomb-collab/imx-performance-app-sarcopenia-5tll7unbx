import { StepField, NumberInput, ClinicalBadge } from '@/components/assessment/shared'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
import type {
  StepProps,
  SarcopeniaScreeningData,
  EWGSOP2AnalysisData,
  DIAGNOSIS_OPTIONS,
} from '@/types/assessment'
import { DIAGNOSIS_OPTIONS as DIAG_OPTS } from '@/types/assessment'

const SARCF_QUESTIONS = [
  { key: 'strength', label: 'Força: dificuldade para levantar/carregar 5 kg?' },
  { key: 'assistanceWalking', label: 'Caminhada: dificuldade para atravessar um quarto?' },
  { key: 'riseChair', label: 'Levantar: dificuldade para levantar de uma cadeira?' },
  { key: 'climbStairs', label: 'Escadas: dificuldade para subir 10 degraus?' },
  { key: 'falls', label: 'Quedas: quantas vezes caiu no último ano?' },
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
  const sarcCalFTotal = getSarcCalFTotal(
    sarcFTotal,
    ss.calfCircumference ?? form.anthropometry.calfCircumference,
    gender,
  )
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
    next.sarcCalFTotal = getSarcCalFTotal(
      total,
      next.calfCircumference ?? form.anthropometry.calfCircumference,
      gender,
    )
    next.risk = getSarcopeniaRisk(next.sarcCalFTotal ?? total) ?? undefined
    updateField('sarcopeniaScreening', next)
  }
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">Triagem de Sarcopenia</h3>
      <div className="space-y-3">
        {SARCF_QUESTIONS.map((q) => (
          <div key={q.key} className="flex items-center justify-between gap-4">
            <Label className="text-sm flex-1">{q.label}</Label>
            <Select
              value={String(ss[q.key] ?? '')}
              onValueChange={(v) =>
                set({ [q.key]: parseInt(v) } as Partial<SarcopeniaScreeningData>)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="0" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 - Nenhuma</SelectItem>
                <SelectItem value="1">1 - Alguma</SelectItem>
                <SelectItem value="2">2 - Muita</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
      <StepField label="Circunferência da Panturrilha (cm) - SARC-CalF">
        <NumberInput
          value={ss.calfCircumference}
          onChange={(v) => set({ calfCircumference: v })}
          step="0.1"
        />
      </StepField>
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <Badge variant="secondary">SARC-F: {sarcFTotal ?? '-'}</Badge>
        <Badge variant="secondary">SARC-CalF: {sarcCalFTotal ?? '-'}</Badge>
        {risk && (
          <Badge
            className={cn(
              risk === 'baixo'
                ? 'bg-green-500 hover:bg-green-600'
                : risk === 'moderado'
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : 'bg-red-500 hover:bg-red-600',
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
    updateField('ewgsop2Analysis', {
      ...ea,
      diagnosis,
      muscleStrengthLow: hgLow,
      muscleMassLow: almiLow,
      physicalPerformanceLow: sppbLow,
    } as EWGSOP2AnalysisData)
    updateField('finalDiagnosis', diagnosis as EWGSOP2AnalysisData['diagnosis'])
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
      <h3 className="text-lg font-semibold border-b pb-2">Análise EWGSOP2</h3>
      <Card className="bg-secondary/50">
        <CardContent className="p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Parâmetro</th>
                <th className="text-center">Valor</th>
                <th className="text-center">Cut-off</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b last:border-0">
                  <td className="py-2">{r.label}</td>
                  <td className="text-center">{r.value ?? '-'}</td>
                  <td className="text-center text-muted-foreground">{r.cutoff}</td>
                  <td className="text-center">
                    {r.value != null && <ClinicalBadge status={r.low ? 'reduced' : 'normal'} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
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
          {DIAG_OPTS.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted',
                (ea.diagnosis ?? form.finalDiagnosis) === opt.value &&
                  'border-primary bg-primary/5',
              )}
            >
              <RadioGroupItem value={opt.value} />
              <span className="text-sm font-medium">{opt.label}</span>
            </label>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}
