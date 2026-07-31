import { ReportTable, SectionBlock, type ReportRow } from './ReportTable'
import { obj, fmt, hasData } from '@/lib/report-utils'
import {
  getALMIStatus,
  getPhaseAngleStatus,
  getCalfCircumferenceStatus,
} from '@/lib/clinical-utils'
import { calculateIMC, getIMCCategory } from '@/lib/patient-utils'
import { cn } from '@/lib/utils'
import type { Patient } from '@/types'

interface Props {
  assessment: Record<string, unknown>
  patient: Patient | null
}

export function Section3MuscleMass({ assessment, patient }: Props) {
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

  const bcRows: ReportRow[] = [
    { label: 'Percentual de Gordura', value: fmt(bc.fatPercentage, '%') },
    {
      label: 'Ângulo de Fase',
      value: fmt(bc.phaseAngle, '°'),
      ref: gender === 'M' ? '≥ 5.0°' : '≥ 4.6°',
      interp: paStatus === 'normal' ? 'Normal' : paStatus === 'reduced' ? 'Reduzida' : undefined,
      interpClass:
        paStatus === 'normal' ? 'normal' : paStatus === 'reduced' ? 'reduced' : undefined,
    },
    { label: 'Massa Muscular Apendicular', value: fmt(bc.appendicularMuscleMass, 'kg') },
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
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  ALMI (Índice de Massa Muscular Apendicular)
                </p>
                <p className="text-2xl font-bold tabular-nums">{fmt(bc.almi, 'kg/m²')}</p>
                <p className="text-xs text-muted-foreground mt-1">Referência: {almiRef}</p>
                {almiStatus && (
                  <span
                    className={cn(
                      'mt-2 inline-flex items-center px-2.5 py-0.5 text-xs font-bold',
                      almiStatus === 'normal' ? 'clinical-badge-normal' : 'clinical-badge-reduced',
                    )}
                  >
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
