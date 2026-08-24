import { ReportTable, SectionBlock, type ReportRow } from './ReportTable'
import { obj, fmt, hasData } from '@/lib/report-utils'
import { getHandgripStatus, getChairStandStatus, calcPercent } from '@/lib/clinical-utils'
import { ResumoSparkline } from '@/components/resumo/ResumoSparkline'
import { cn } from '@/lib/utils'
import type { Patient } from '@/types'

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
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Força Respiratória
            </h4>
            <ReportTable rows={respRows} />
          </div>
        ) : null}

        {hasStrength && (
          <div
            className={cn(
              'mt-4 border-l-4 rounded-r-lg p-4 text-sm font-medium break-inside-avoid',
              isReduced
                ? 'bg-amber-50 border-amber-400 text-amber-800 dark:bg-amber-950/20 dark:border-amber-700 dark:text-amber-400'
                : 'bg-green-50 border-green-400 text-green-800 dark:bg-green-950/20 dark:border-green-700 dark:text-green-400',
            )}
          >
            <p className="font-medium">
              {isReduced
                ? 'Força muscular reduzida segundo critérios EWGSOP2'
                : 'Força muscular preservada'}
            </p>
          </div>
        )}
      </SectionBlock>
    </div>
  )
}

function PlaceholderText() {
  return (
    <div className="bg-muted/30 rounded">
      <p className="text-muted-foreground text-sm italic py-4 text-center">
        Dados não coletados nesta avaliação
      </p>
    </div>
  )
}
