import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ReportTable, SectionBlock, type ReportRow } from './ReportTable'
import { obj, fmt, hasData } from '@/lib/report-utils'
import { getHandgripStatus, getChairStandStatus, calcPercent } from '@/lib/clinical-utils'
import { ResumoSparkline } from '@/components/resumo/ResumoSparkline'
import type { Patient } from '@/types'
import { Eyebrow, InlineNote, PlaceholderText } from './ReportTable'

interface Props {
  assessment: Record<string, unknown>
  patient: Patient | null
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

export function Section2MuscleStrength({ assessment, patient, allAssessments }: Props) {
  const ms = obj(assessment.muscleStrength)
  const rs = obj(assessment.respiratoryStrength)
  const gender = patient?.gender ?? 'M'

  const hasStrength = hasData(ms)
  const hasResp = hasData(rs)

  const hgStatus = getHandgripStatus(ms.handgripMax as number | undefined, gender)
  const csStatus = getChairStandStatus(ms.chairStandTime as number | undefined)

  const pimaxPct = rs.pimaxPercent ?? calcPercent(rs.pimaxActual, rs.pimaxPredicted)
  const pemaxPct = rs.pemaxPercent ?? calcPercent(rs.pemaxActual, rs.pemaxPredicted)

  const hgLeftHist = getMetricHistory(allAssessments, 'muscleStrength.handgripLeft')
  const hgRightHist = getMetricHistory(allAssessments, 'muscleStrength.handgripRight')
  const hgMaxHist = getMetricHistory(allAssessments, 'muscleStrength.handgripMax')
  const csHist = getMetricHistory(allAssessments, 'muscleStrength.chairStandTime')

  const pimaxHist = getMetricHistory(allAssessments, 'respiratoryStrength.pimaxActual')
  const pemaxHist = getMetricHistory(allAssessments, 'respiratoryStrength.pemaxActual')

  const strengthRows: ReportRow[] = [
    {
      label: 'Handgrip Esquerdo',
      value: fmt(ms.handgripLeft, 'kg'),
      ref: gender === 'M' ? '≥ 27 kg' : '≥ 16 kg',
      sparkline:
        allAssessments && ms.handgripLeft != null ? (
          <ResumoSparkline values={hgLeftHist} />
        ) : undefined,
    },
    {
      label: 'Handgrip Direito',
      value: fmt(ms.handgripRight, 'kg'),
      ref: gender === 'M' ? '≥ 27 kg' : '≥ 16 kg',
      sparkline:
        allAssessments && ms.handgripRight != null ? (
          <ResumoSparkline values={hgRightHist} />
        ) : undefined,
    },
    {
      label: 'Handgrip Máximo',
      value: fmt(ms.handgripMax, 'kg'),
      ref: gender === 'M' ? '≥ 27 kg' : '≥ 16 kg',
      sparkline:
        allAssessments && ms.handgripMax != null ? (
          <ResumoSparkline values={hgMaxHist} />
        ) : undefined,
      interp: hgStatus === 'normal' ? 'Normal' : hgStatus === 'reduced' ? 'Reduzida' : undefined,
      interpClass:
        hgStatus === 'normal' ? 'normal' : hgStatus === 'reduced' ? 'reduced' : undefined,
      trendIcon: getTrendIcon(hgMaxHist, true),
    },
    {
      label: 'Levantar da Cadeira (5x)',
      value: fmt(ms.chairStandTime, 's'),
      ref: '≤ 15 s',
      sparkline:
        allAssessments && ms.chairStandTime != null ? (
          <ResumoSparkline values={csHist} />
        ) : undefined,
      interp: csStatus === 'normal' ? 'Normal' : csStatus === 'reduced' ? 'Reduzida' : undefined,
      interpClass:
        csStatus === 'normal' ? 'normal' : csStatus === 'reduced' ? 'reduced' : undefined,
      trendIcon: getTrendIcon(csHist, false),
    },
  ]

  const respRows: ReportRow[] = [
    {
      label: 'PImax Atual',
      value: fmt(rs.pimaxActual, 'cmH₂O'),
      sparkline:
        allAssessments && rs.pimaxActual != null ? (
          <ResumoSparkline values={pimaxHist} />
        ) : undefined,
    },
    { label: 'PImax Previsto', value: fmt(rs.pimaxPredicted, 'cmH₂O') },
    {
      label: 'PImax % do Previsto',
      value: pimaxPct != null ? `${pimaxPct}%` : '-',
      ref: '≥ 80%',
      interp: pimaxPct != null ? (pimaxPct >= 80 ? 'Normal' : 'Alterada') : undefined,
      interpClass: pimaxPct != null ? (pimaxPct >= 80 ? 'normal' : 'altered') : undefined,
      trendIcon: getTrendIcon(pimaxHist, true),
    },
    {
      label: 'PEmax Atual',
      value: fmt(rs.pemaxActual, 'cmH₂O'),
      sparkline:
        allAssessments && rs.pemaxActual != null ? (
          <ResumoSparkline values={pemaxHist} />
        ) : undefined,
    },
    { label: 'PEmax Previsto', value: fmt(rs.pemaxPredicted, 'cmH₂O') },
    {
      label: 'PEmax % do Previsto',
      value: pemaxPct != null ? `${pemaxPct}%` : '-',
      ref: '≥ 80%',
      interp: pemaxPct != null ? (pemaxPct >= 80 ? 'Normal' : 'Alterada') : undefined,
      interpClass: pemaxPct != null ? (pemaxPct >= 80 ? 'normal' : 'altered') : undefined,
      trendIcon: getTrendIcon(pemaxHist, true),
    },
  ]

  const isReduced = hgStatus === 'reduced' || csStatus === 'reduced'

  return (
    <div aria-label="2. Força Muscular" className="animate-fade-in">
      <SectionBlock number={2} title="Força Muscular">
        {hasStrength ? (
          <>
            <ReportTable rows={strengthRows} />
            {ms.handgripPercentile != null && (
              <p className="text-sm mt-2">
                Percentil:{' '}
                <span className="font-semibold tabular-nums">{ms.handgripPercentile}º</span>
              </p>
            )}
          </>
        ) : (
          <PlaceholderText />
        )}

        {hasResp ? (
          <div className="mt-4">
            <Eyebrow>Força Respiratória</Eyebrow>
            <div className="mt-2">
              <ReportTable rows={respRows} />
            </div>
          </div>
        ) : null}

        {hasStrength && (
          <InlineNote tone={isReduced ? 'watch' : 'normal'}>
            {isReduced
              ? 'Força muscular reduzida segundo critérios EWGSOP2'
              : 'Força muscular preservada'}
          </InlineNote>
        )}
      </SectionBlock>
    </div>
  )
}
