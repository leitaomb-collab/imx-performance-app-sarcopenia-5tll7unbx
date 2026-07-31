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
  let diagnosisCls = 'clinical-badge-normal'
  if (strengthReduced && massReduced && perfReduced) {
    diagnosisText = 'Sarcopenia severa'
    diagnosisCls = 'clinical-badge-reduced'
  } else if (strengthReduced && massReduced) {
    diagnosisText = 'Sarcopenia confirmada'
    diagnosisCls = 'clinical-badge-reduced'
  } else if (strengthReduced) {
    diagnosisText = 'Sarcopenia provável'
    diagnosisCls = 'clinical-badge-moderate'
  }

  const tugVal = ba.tugSimple as number | undefined
  let fallRisk = 'Não avaliado'
  if (tugVal != null) {
    if (tugVal > 12) fallRisk = 'Alto risco de quedas'
    else if (tugVal >= 8) fallRisk = 'Risco moderado de quedas'
    else fallRisk = 'Baixo risco de quedas'
  }
  if (sppbTotal != null && sppbTotal < 7) fallRisk = 'Alto risco de quedas'

  const hasSpirometry = hasData(sp)

  return (
    <div aria-label="5. Diagnóstico" className="animate-fade-in">
      <SectionBlock number={5} title="Diagnóstico">
        {hasDiagData ? (
          <>
            <div className="mb-6 break-inside-avoid">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Algoritmo Diagnóstico EWGSOP2
              </h4>
              <div className="flex flex-col md:flex-row md:items-stretch gap-2">
                {steps.map((step, i) => (
                  <div key={i} className="flex flex-col md:flex-row md:items-center gap-2 flex-1">
                    <div
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-lg border flex-1 min-w-0',
                        step.pass
                          ? 'border-green-300 bg-green-50 dark:bg-green-950/20'
                          : 'border-amber-300 bg-amber-50 dark:bg-amber-950/20',
                      )}
                    >
                      {step.pass ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-muted-foreground">Etapa {i + 1}</p>
                        <p className="text-sm font-medium truncate">{step.label}</p>
                        <p className="text-xs text-muted-foreground">{step.value}</p>
                      </div>
                    </div>
                    {i < steps.length - 1 && (
                      <>
                        <ChevronRight className="hidden md:block h-5 w-5 text-muted-foreground shrink-0" />
                        <ChevronDown className="md:hidden h-5 w-5 text-muted-foreground shrink-0 self-center" />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6 p-4 border-2 border-primary/30 bg-primary/5 rounded-lg break-inside-avoid">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                Diagnóstico Final
              </p>
              <p className="text-lg font-bold">{diagnosisText}</p>
            </div>

            <div className="mb-6 break-inside-avoid">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Conclusão Clínica
              </h4>
              <div className="p-4 border border-border/60 rounded-lg bg-secondary/20">
                <RichText
                  content={assessment.clinicalSummary as string}
                  emptyMsg="Sem conclusão clínica registrada."
                />
              </div>
            </div>

            <div className="mb-6 break-inside-avoid">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Risco de Quedas
              </h4>
              <p className="text-sm">{fallRisk}</p>
            </div>

            {hasSpirometry && (
              <div className="break-inside-avoid">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
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
    <p className="text-sm text-muted-foreground py-3 italic">Dados não coletados nesta avaliação</p>
  )
}
