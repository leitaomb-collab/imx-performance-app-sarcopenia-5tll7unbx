import { useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { MetricChartCard } from './MetricChartCard'
import type { MetricTrendDirection } from '@/lib/patient-utils'
import type { Assessment, Patient } from '@/types'

interface MetricConfig {
  title: string
  unit: string
  direction: MetricTrendDirection
  data: Array<{ date: string; value: number }>
}

function extractMetrics(assessments: Assessment[], patient: Patient): MetricConfig[] {
  const sorted = [...assessments].sort(
    (a, b) => new Date(a.assessmentDate).getTime() - new Date(b.assessmentDate).getTime(),
  )

  const push = (arr: Array<{ date: string; value: number }>, date: string, val: unknown) => {
    if (typeof val === 'number' && !isNaN(val)) arr.push({ date, value: val })
  }

  const hg: Array<{ date: string; value: number }> = []
  const tug: Array<{ date: string; value: number }> = []
  const mip: Array<{ date: string; value: number }> = []
  const mep: Array<{ date: string; value: number }> = []
  const mm: Array<{ date: string; value: number }> = []
  const wt: Array<{ date: string; value: number }> = []

  for (const a of sorted) {
    const ms = a.muscleStrength as unknown as Record<string, any>
    const ba = a.balanceAssessment as unknown as Record<string, any>
    const rs = a.respiratoryStrength as unknown as Record<string, any>
    const bc = a.bodyComposition as unknown as Record<string, any>
    const an = a.anthropometry as unknown as Record<string, any>
    const d = a.assessmentDate

    const hgMax = ms?.handgripMax
    const hgL = ms?.handgripLeft
    const hgR = ms?.handgripRight
    if (hgMax != null) push(hg, d, hgMax)
    else if (hgL != null || hgR != null) push(hg, d, Math.max(hgL ?? 0, hgR ?? 0))

    push(tug, d, ba?.tugSimple)
    push(mip, d, rs?.pimaxActual ?? rs?.maximalInspiratoryPressure)
    push(mep, d, rs?.pemaxActual ?? rs?.maximalExpiratoryPressure)
    push(mm, d, bc?.skeletalMuscleMass ?? bc?.muscleMass ?? bc?.leanMass)
    push(wt, d, bc?.weight ?? an?.weight ?? patient.weight)
  }

  return [
    { title: 'Força de Preensão', unit: 'kg', direction: 'higher-is-better' as const, data: hg },
    { title: 'TUG', unit: 's', direction: 'lower-is-better' as const, data: tug },
    { title: 'MIP', unit: 'cmH₂O', direction: 'higher-is-better' as const, data: mip },
    { title: 'MEP', unit: 'cmH₂O', direction: 'higher-is-better' as const, data: mep },
    { title: 'Massa Muscular', unit: 'kg', direction: 'higher-is-better' as const, data: mm },
    { title: 'Peso', unit: 'kg', direction: 'neutral' as const, data: wt },
  ]
}

export function EvolutionCharts({
  assessments,
  patient,
}: {
  assessments: Assessment[]
  patient: Patient
}) {
  const metrics = useMemo(() => extractMetrics(assessments, patient), [assessments, patient])
  const visibleMetrics = useMemo(() => metrics.filter((m) => m.data.length > 0), [metrics])

  if (assessments.length === 0) return null

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold">Evolução de Parâmetros</h2>
      {assessments.length < 2 || visibleMetrics.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-3">
          <TrendingUp className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            Avaliação insuficiente para gráficos evolutivos.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleMetrics.map((metric, i) => (
            <MetricChartCard
              key={metric.title}
              title={metric.title}
              unit={metric.unit}
              data={metric.data}
              direction={metric.direction}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  )
}
