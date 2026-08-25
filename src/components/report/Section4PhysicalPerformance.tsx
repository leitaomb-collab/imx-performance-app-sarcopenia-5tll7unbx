import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ReportTable, SectionBlock, type ReportRow } from './ReportTable'
import { obj, fmt, hasData } from '@/lib/report-utils'
import { getSPPBStatus, getSPPBTotal, getTUGStatus } from '@/lib/clinical-utils'
import { ResumoSparkline } from '@/components/resumo/ResumoSparkline'
import { Eyebrow, InlineNote, PlaceholderText } from './ReportTable'

interface Props {
  assessment: Record<string, unknown>
  allAssessments?: Record<string, unknown>[]
}

function getMetricHistory(
  assessments: Record<string, unknown>[] | undefined,
  path: string,
): number[] {
  if (!assessments || assessments.length === 0) return []
  return assessments
    .map((a) => {
      const parts = path.split('.')
      let val: unknown = a
      for (const p of parts) val = (val as Record<string, unknown>)?.[p]
      return typeof val === 'number' ? val : NaN
    })
    .filter((v) => !isNaN(v))
}

function getTrendIcon(values: number[], higherIsBetter: boolean): ReactNode | undefined {
  if (values.length < 2) return undefined
  const prev = values[values.length - 2]
  const curr = values[values.length - 1]
  if (curr === prev) {
    return <Minus className="h-3 w-3 text-muted-foreground" />
  }
  const improved = higherIsBetter ? curr > prev : curr < prev
  if (improved) {
    return <TrendingUp className="h-3 w-3 text-green-600" />
  }
  return <TrendingDown className="h-3 w-3 text-red-600" />
}

function getSPPBTotalHistory(assessments: Record<string, unknown>[] | undefined): number[] {
  if (!assessments || assessments.length === 0) return []
  return assessments
    .map((a) => {
      const ba = (a.balanceAssessment as Record<string, unknown> | undefined) ?? {}
      if (typeof ba.sppbTotal === 'number') return ba.sppbTotal
      const total = getSPPBTotal(
        ba.sppbBalance as number | undefined,
        ba.sppbGait as number | undefined,
        ba.sppbChair as number | undefined,
      )
      return total != null ? total : NaN
    })
    .filter((v) => !isNaN(v))
}

export function Section4PhysicalPerformance({ assessment, allAssessments }: Props) {
  const ba = obj(assessment.balanceAssessment)

  const hasPerf = hasData(ba)

  const sppbTotal = getSPPBTotal(ba.sppbBalance, ba.sppbGait, ba.sppbChair)
  const sppbStatus = getSPPBStatus(sppbTotal)
  const tugStatus = getTUGStatus(ba.tugSimple as number | undefined)

  const isReduced = (sppbTotal != null && sppbTotal <= 7) || tugStatus === 'reduced'

  const sppbTotalHist = getSPPBTotalHistory(allAssessments)
  const tugSimpleHist = getMetricHistory(allAssessments, 'balanceAssessment.tugSimple')
  const gaitHist = getMetricHistory(allAssessments, 'balanceAssessment.sppbGait')

  const perfRows: ReportRow[] = [
    { label: 'Equilíbrio (SPPB)', value: fmt(ba.sppbBalance, 'pts') },
    {
      label: 'Marcha (SPPB)',
      value: fmt(ba.sppbGait, 'pts'),
      sparkline:
        allAssessments && ba.sppbGait != null ? <ResumoSparkline values={gaitHist} /> : undefined,
    },
    { label: 'Levantar da Cadeira (SPPB)', value: fmt(ba.sppbChair, 'pts') },
    {
      label: 'SPPB Total',
      value: fmt(sppbTotal, 'pts'),
      ref: '≥ 10 pts',
      sparkline:
        allAssessments && sppbTotal != null ? (
          <ResumoSparkline values={sppbTotalHist} />
        ) : undefined,
      interp:
        sppbStatus === 'normal' ? 'Normal' : sppbStatus === 'reduced' ? 'Reduzido' : undefined,
      interpClass:
        sppbStatus === 'normal' ? 'normal' : sppbStatus === 'reduced' ? 'reduced' : undefined,
      trendIcon: getTrendIcon(sppbTotalHist, true),
    },
    {
      label: 'TUG Simples',
      value: fmt(ba.tugSimple, 's'),
      ref: '≤ 12 s',
      sparkline:
        allAssessments && ba.tugSimple != null ? (
          <ResumoSparkline values={tugSimpleHist} />
        ) : undefined,
      interp: tugStatus === 'normal' ? 'Normal' : tugStatus === 'reduced' ? 'Alterada' : undefined,
      interpClass:
        tugStatus === 'normal' ? 'normal' : tugStatus === 'reduced' ? 'altered' : undefined,
      trendIcon: getTrendIcon(tugSimpleHist, false),
    },
    { label: 'TUG Dupla Tarefa', value: fmt(ba.tugDualTask, 's') },
  ]

  return (
    <div aria-label="4. Desempenho Físico" className="animate-fade-in">
      <SectionBlock number={4} title="Desempenho Físico">
        {hasPerf ? (
          <>
            <ReportTable rows={perfRows} />

            {(ba.stabilometryEyesOpen || ba.stabilometryEyesClosed) && (
              <div className="mt-4">
                <Eyebrow>Estabilometria</Eyebrow>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <div className="border border-report-line rounded-[10px] p-3">
                    <Eyebrow>Olhos Abertos</Eyebrow>
                    <p className="text-sm text-report-ink mt-1">{ba.stabilometryEyesOpen || '—'}</p>
                  </div>
                  <div className="border border-report-line rounded-[10px] p-3">
                    <Eyebrow>Olhos Fechados</Eyebrow>
                    <p className="text-sm text-report-ink mt-1">
                      {ba.stabilometryEyesClosed || '—'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <InlineNote tone={isReduced ? 'watch' : 'normal'}>
              {isReduced
                ? 'Performance física reduzida segundo critérios EWGSOP2'
                : 'Performance física preservada'}
            </InlineNote>
          </>
        ) : (
          <PlaceholderText />
        )}
      </SectionBlock>
    </div>
  )
}
