import { SectionBlock } from './ReportTable'
import { obj, hasData, fmt } from '@/lib/report-utils'
import { RichText } from '@/components/patients/RichText'
import {
  getHandgripStatus,
  getALMIStatus,
  getSPPBTotal,
  getSPPBStatus,
  getTUGStatus,
} from '@/lib/clinical-utils'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, ChevronRight, ChevronDown } from 'lucide-react'
import type { Patient } from '@/types'

interface Props {
  assessment: Record<string, unknown>
  patient: Patient | null
}

interface StepInfo {
  label: string
  value: string
  pass: boolean
}

export function Section5Diagnosis({ assessment, patient }: Props) {
  const ms = obj(assessment.muscleStrength)
  const bc = obj(assessment.bodyComposition)
  const ba = obj(assessment.balanceAssessment)
  const sp = obj(assessment.spirometry)
  const ss = obj(assessment.sarcopeniaScreening)
  const gender = patient?.gender ?? 'M'

  const hasDiagData =
    hasData(ms) || hasData(bc) || hasData(ba) || hasData(ss) || assessment.finalDiagnosis != null

  const hgStatus = getHandgripStatus(ms.handgripMax as number | undefined, gender)
  const almiStatus = getALMIStatus(bc.almi as number | undefined, gender)
  const sppbTotal = getSPPBTotal(ba.sppbBalance, ba.sppbGait, ba.sppbChair)
  const sppbStatus = getSPPBStatus(sppbTotal)
  const tugStatus = getTUGStatus(ba.tugSimple as number | undefined)

  const strengthReduced = hgStatus === 'reduced'
  const massReduced = almiStatus === 'reduced'
  const perfReduced = sppbStatus === 'reduced' || tugStatus === 'reduced'
  const screeningRisk =
    ss.strength != null ||
    ss.assistanceWalking != null ||
    ss.riseChair != null ||
    ss.climbStairs != null ||
    ss.falls != null

  const steps: StepInfo[] = [
    {
      label: 'Triagem (SARC-F)',
      value: screeningRisk
        ? assessment.sarcopeniaScreening
          ? 'Risco detectado'
          : 'Sem risco'
        : 'Não avaliado',
      pass: !screeningRisk,
    },
    {
      label: 'Força Muscular (Handgrip)',
      value:
        hgStatus === 'normal' ? 'Normal' : hgStatus === 'reduced' ? 'Reduzida' : 'Não avaliado',
      pass: hgStatus === 'normal',
    },
    {
      label: 'Massa Muscular (ALMI)',
      value:
        almiStatus === 'normal' ? 'Normal' : almiStatus === 'reduced' ? 'Reduzida' : 'Não avaliado',
      pass: almiStatus === 'normal',
    },
    {
      label: 'Desempenho Físico (SPPB/TUG)',
      value:
        sppbStatus === 'normal' && tugStatus === 'normal'
          ? 'Normal'
          : sppbStatus === 'reduced' || tugStatus === 'reduced'
            ? 'Reduzido'
            : 'Não avaliado',
      pass: sppbStatus === 'normal' && tugStatus === 'normal',
    },
  ]

  let diagnosisText = 'Sem sarcopenia'
  let diagBoxCls =
    'diag-box-none bg-green-50 border-2 border-green-300 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400'
  if (strengthReduced && massReduced && perfReduced) {
    diagnosisText = 'Sarcopenia severa'
    diagBoxCls =
      'diag-box-severe bg-red-50 border-2 border-red-300 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400'
  } else if (strengthReduced && massReduced) {
    diagnosisText = 'Sarcopenia confirmada'
    diagBoxCls =
      'diag-box-confirmed bg-amber-50 border-2 border-amber-300 text-amber-800 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400'
  } else if (strengthReduced) {
    diagnosisText = 'Sarcopenia provável'
    diagBoxCls =
      'diag-box-probable bg-yellow-50 border-2 border-yellow-300 text-yellow-800 dark:bg-yellow-950/20 dark:border-yellow-800 dark:text-yellow-400'
  }

  const tugVal = ba.tugSimple as number | undefined
  let fallRisk = 'Não avaliado'
  let fallRiskCls = 'bg-muted text-muted-foreground'
  if (tugVal != null) {
    if (tugVal > 12) {
      fallRisk = 'Alto risco de quedas'
      fallRiskCls = 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
    } else if (tugVal >= 8) {
      fallRisk = 'Risco moderado de quedas'
      fallRiskCls = 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
    } else {
      fallRisk = 'Baixo risco de quedas'
      fallRiskCls = 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
    }
  }
  if (sppbTotal != null && sppbTotal < 7) {
    fallRisk = 'Alto risco de quedas'
    fallRiskCls = 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
  }

  const hasSpirometry = hasData(sp)

  return (
    <div aria-label="5. Diagnóstico" className="animate-fade-in">
      <SectionBlock number={5} title="Diagnóstico">
        {hasDiagData ? (
          <>
            <div className="mb-6 break-inside-avoid">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Algoritmo Diagnóstico EWGSOP2
              </h4>
              <div className="ewgsop2-flow flex flex-col lg:flex-row lg:items-stretch gap-2">
                {steps.map((step, i) => (
                  <div key={i} className="flex flex-col lg:flex-row lg:items-center gap-2 flex-1">
                    <div className="rounded-lg border p-4 flex flex-col items-center gap-2 min-w-0 flex-1">
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
                          step.pass ? 'bg-green-500 text-white' : 'bg-amber-500 text-white',
                        )}
                      >
                        {step.pass ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-center">
                        {step.label}
                      </p>
                      <p className="text-lg font-bold text-center">{step.value}</p>
                    </div>
                    {i < steps.length - 1 && (
                      <>
                        <ChevronRight className="hidden lg:block print:block h-5 w-5 text-muted-foreground shrink-0" />
                        <ChevronDown className="lg:hidden print:hidden h-5 w-5 text-muted-foreground shrink-0 self-center" />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={cn('mb-6 rounded-lg p-4 text-center break-inside-avoid', diagBoxCls)}>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                Diagnóstico Final
              </p>
              <p className="font-bold text-lg">{diagnosisText}</p>
            </div>

            <div className="border-t pt-4 mt-4 break-inside-avoid">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Conclusão Clínica
              </h4>
              <div className="p-4 border border-border/60 rounded-lg bg-secondary/20">
                <RichText
                  content={assessment.clinicalSummary as string}
                  emptyMsg="Sem conclusão clínica registrada."
                />
              </div>
            </div>

            <div className="mt-4 break-inside-avoid">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Risco de Quedas
              </h4>
              <span
                className={cn(
                  'inline-flex items-center px-3 py-1 text-sm font-medium rounded-full',
                  fallRiskCls,
                )}
              >
                {fallRisk}
              </span>
            </div>

            {hasSpirometry && (
              <div className="mt-4 break-inside-avoid">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Função Respiratória (Espirometria)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border border-border/60 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">VEF1</p>
                    <p className="text-sm font-semibold">{fmt(sp.fev1, 'L')}</p>
                  </div>
                  <div className="border border-border/60 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">CVF</p>
                    <p className="text-sm font-semibold">{fmt(sp.fvc, 'L')}</p>
                  </div>
                  <div className="border border-border/60 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Relação VEF1/CVF</p>
                    <p className="text-sm font-semibold">{fmt(sp.fev1FvcRatio)}</p>
                  </div>
                  <div className="border border-border/60 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Padrão</p>
                    <p className="text-sm font-semibold">{sp.pattern || '-'}</p>
                  </div>
                </div>
              </div>
            )}
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
