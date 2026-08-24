import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ReportTable, SectionBlock, type ReportRow } from './ReportTable'
import { obj, fmt, hasData } from '@/lib/report-utils'
import {
  getALMIStatus,
  getPhaseAngleStatus,
  getCalfCircumferenceStatus,
} from '@/lib/clinical-utils'
import { calculateIMC, getIMCCategory } from '@/lib/patient-utils'
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

export function Section3MuscleMass({ assessment, patient, allAssessments }: Props) {
  const bc = obj(assessment.bodyComposition)
  const an = obj(assessment.anthropometry)
  const gender = patient?.gender ?? 'M'

  const hasMass = hasData(bc) || hasData(an)
  const hasBC = hasData(bc)
  const hasAnth = hasData(an)

  const almiStatus = getALMIStatus(bc.almi as number | undefined, gender)
  const paStatus = getPhaseAngleStatus(bc.phaseAngle as number | undefined, gender)
  const ccStatus = getCalfCircumferenceStatus(an.calfCircumference as number | undefined, gender)

  const almiRef = gender === 'M' ? '≥ 7.0 kg/m²' : '≥ 5.4 kg/m²'

  const almiHist = getMetricHistory(allAssessments, 'bodyComposition.almi')
  const fatHist = getMetricHistory(allAssessments, 'bodyComposition.fatPercentage')
  const paHist = getMetricHistory(allAssessments, 'bodyComposition.phaseAngle')
  const ammHist = getMetricHistory(allAssessments, 'bodyComposition.appendicularMuscleMass')
  const leanHist = getMetricHistory(allAssessments, 'bodyComposition.leanMass')
  const tbwHist = getMetricHistory(allAssessments, 'bodyComposition.totalBodyWater')

  const bcRows: ReportRow[] = [
    {
      label: 'Percentual de Gordura',
      value: fmt(bc.fatPercentage, '%'),
      sparkline:
        allAssessments && bc.fatPercentage != null ? (
          <ResumoSparkline values={fatHist} />
        ) : undefined,
    },
    {
      label: 'Ângulo de Fase',
      value: fmt(bc.phaseAngle, '°'),
      ref: gender === 'M' ? '≥ 5.0°' : '≥ 4.6°',
      sparkline:
        allAssessments && bc.phaseAngle != null ? <ResumoSparkline values={paHist} /> : undefined,
      interp: paStatus === 'normal' ? 'Normal' : paStatus === 'reduced' ? 'Reduzida' : undefined,
      interpClass:
        paStatus === 'normal' ? 'normal' : paStatus === 'reduced' ? 'reduced' : undefined,
      trendIcon: getTrendIcon(paHist, true),
    },
    {
      label: 'Massa Muscular Apendicular',
      value: fmt(bc.appendicularMuscleMass, 'kg'),
      sparkline:
        allAssessments && bc.appendicularMuscleMass != null ? (
          <ResumoSparkline values={ammHist} />
        ) : undefined,
    },
    ...(bc.leanMass != null
      ? [
          {
            label: 'Massa Magra',
            value: fmt(bc.leanMass, 'kg'),
            sparkline: allAssessments ? <ResumoSparkline values={leanHist} /> : undefined,
          },
        ]
      : []),
    ...(bc.totalBodyWater != null
      ? [
          {
            label: 'Água Corporal Total',
            value: fmt(bc.totalBodyWater, 'L'),
            sparkline: allAssessments ? <ResumoSparkline values={tbwHist} /> : undefined,
          },
        ]
      : []),
  ]

  const heightM = (patient?.height ?? 0) > 3 ? (patient?.height ?? 0) / 100 : (patient?.height ?? 0)
  const imc = calculateIMC(patient?.weight ?? 0, heightM)
  const imcCat = imc ? getIMCCategory(imc) : null

  const anthRows: ReportRow[] = [
    {
      label: 'Circunferência da Panturrilha',
      value: fmt(an.calfCircumference, 'cm'),
      ref: gender === 'M' ? '≥ 34 cm' : '≥ 33 cm',
      interp: ccStatus === 'normal' ? 'Normal' : ccStatus === 'reduced' ? 'Reduzida' : undefined,
      interpClass:
        ccStatus === 'normal' ? 'normal' : ccStatus === 'reduced' ? 'reduced' : undefined,
    },
    { label: 'Circunferência da Cintura', value: fmt(an.waistCircumference, 'cm') },
    {
      label: 'IMC',
      value: imc ? `${imc} ${imcCat ? `(${imcCat})` : ''}` : '-',
      ref: '18.5-24.9 kg/m²',
    },
  ]

  const isReduced = almiStatus === 'reduced'

  return (
    <div aria-label="3. Massa Muscular" className="animate-fade-in">
      <SectionBlock number={3} title="Massa Muscular">
        {hasMass ? (
          <>
            {bc.almi != null && (
              <div className="mb-4 border border-border/60 rounded-lg p-4 break-inside-avoid">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      ALMI (Índice de Massa Muscular Apendicular)
                    </p>
                    <p className="text-2xl font-bold tabular-nums">{fmt(bc.almi, 'kg/m²')}</p>
                    <p className="text-xs text-muted-foreground mt-1">Referência: {almiRef}</p>
                  </div>
                  {allAssessments && (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-muted-foreground uppercase font-medium mb-1">
                        Evolução
                      </span>
                      <ResumoSparkline values={almiHist} />
                    </div>
                  )}
                </div>
                {almiStatus && (
                  <span
                    className={cn(
                      'mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full',
                      almiStatus === 'normal' ? 'clinical-badge-normal' : 'clinical-badge-reduced',
                    )}
                  >
                    {getTrendIcon(almiHist, true)}
                    {almiStatus === 'normal' ? 'Normal' : 'Reduzida'}
                  </span>
                )}
              </div>
            )}

            {hasBC && <ReportTable rows={bcRows} />}

            {hasAnth && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Antropometria
                </h4>
                <ReportTable rows={anthRows} />
              </div>
            )}

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
                  ? 'Massa muscular reduzida segundo critérios EWGSOP2'
                  : 'Massa muscular preservada'}
              </p>
            </div>
          </>
        ) : (
          <PlaceholderText />
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
