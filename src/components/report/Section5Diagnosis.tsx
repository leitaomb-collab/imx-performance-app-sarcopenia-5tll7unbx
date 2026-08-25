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
import type { Patient } from '@/types'
import {
  Eyebrow,
  StatusPill,
  DiagnosticPathway,
  VerdictBanner,
  PlaceholderText,
  type Tone,
  type PathwayStep,
} from './ReportTable'

interface Props {
  assessment: Record<string, unknown>
  patient: Patient | null
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

  const steps: PathwayStep[] = [
    {
      label: 'Triagem',
      sub: screeningRisk
        ? assessment.sarcopeniaScreening
          ? 'Risco detectado'
          : 'Sem risco'
        : 'Não avaliado',
      status: !screeningRisk ? 'pending' : 'pass',
    },
    {
      label: 'Força',
      sub: hgStatus === 'normal' ? 'Normal' : hgStatus === 'reduced' ? 'Reduzida' : 'Não avaliado',
      status: hgStatus == null ? 'pending' : hgStatus === 'normal' ? 'pass' : 'fail',
    },
    {
      label: 'Massa',
      sub:
        almiStatus === 'normal' ? 'Normal' : almiStatus === 'reduced' ? 'Reduzida' : 'Não avaliado',
      status: almiStatus == null ? 'pending' : almiStatus === 'normal' ? 'pass' : 'fail',
    },
    {
      label: 'Desempenho',
      sub:
        sppbStatus === 'normal' && tugStatus === 'normal'
          ? 'Normal'
          : sppbStatus === 'reduced' || tugStatus === 'reduced'
            ? 'Reduzido'
            : 'Não avaliado',
      status:
        sppbStatus == null && tugStatus == null
          ? 'pending'
          : sppbStatus === 'normal' && tugStatus === 'normal'
            ? 'pass'
            : 'fail',
    },
  ]

  const sarcFTotal = ss.sarcFTotal as number | undefined
  const sarcCalFTotal = ss.sarcCalFTotal as number | undefined
  const sarcFPositive = sarcFTotal != null && sarcFTotal >= 4
  const sarcCalFPositive = sarcCalFTotal != null && sarcCalFTotal >= 11

  let diagnosisText = 'Normal'
  let diagTone: Tone = 'normal'
  let diagDetail = 'Força, massa muscular e desempenho físico dentro da normalidade.'
  if (strengthReduced && massReduced && perfReduced) {
    diagnosisText = 'Sarcopenia grave'
    diagTone = 'low'
    diagDetail = 'Força, massa muscular e desempenho físico reduzidos — quadro de maior gravidade.'
  } else if (strengthReduced && massReduced) {
    diagnosisText = 'Sarcopenia'
    diagTone = 'watch'
    diagDetail = 'Força e massa muscular reduzidas, confirmando o diagnóstico.'
  } else if (strengthReduced && !massReduced) {
    diagnosisText = 'Risco de sarcopenia'
    diagTone = 'watch'
    diagDetail = 'Força reduzida com massa muscular preservada. Recomenda-se monitoramento.'
  } else if (sarcFPositive || sarcCalFPositive) {
    diagnosisText = 'Risco de sarcopenia'
    diagTone = 'watch'
    diagDetail = 'Triagem positiva (SARC-F/SARC-CalF). Recomenda-se investigação complementar.'
  }

  steps.push({
    label: 'Veredito',
    sub: diagnosisText,
    status: diagTone === 'normal' ? 'pass' : 'fail',
  })

  const tugVal = ba.tugSimple as number | undefined
  let fallRisk = 'Não avaliado'
  let fallRiskTone: Tone = 'na'
  if (tugVal != null) {
    if (tugVal > 12) {
      fallRisk = 'Alto risco de quedas'
      fallRiskTone = 'low'
    } else if (tugVal >= 8) {
      fallRisk = 'Risco moderado de quedas'
      fallRiskTone = 'watch'
    } else {
      fallRisk = 'Baixo risco de quedas'
      fallRiskTone = 'normal'
    }
  }
  if (sppbTotal != null && sppbTotal < 7) {
    fallRisk = 'Alto risco de quedas'
    fallRiskTone = 'low'
  }

  const hasSpirometry = hasData(sp)

  return (
    <div aria-label="5. Diagnóstico" className="animate-fade-in">
      <SectionBlock number={5} title="Diagnóstico">
        {hasDiagData ? (
          <>
            <div className="mb-6 break-inside-avoid">
              <Eyebrow>Percurso Diagnóstico EWGSOP2</Eyebrow>
              <div className="mt-3">
                <DiagnosticPathway steps={steps} />
              </div>
            </div>

            <div className="mb-6 break-inside-avoid">
              <VerdictBanner
                eyebrow="Diagnóstico Final"
                title={diagnosisText}
                detail={diagDetail}
                tone={diagTone}
              />
            </div>

            <div className="border-t border-report-line pt-4 mt-4 break-inside-avoid">
              <Eyebrow>Conclusão Clínica</Eyebrow>
              <div className="p-4 border-l-[3px] border-report-ink-soft bg-report-paper-soft rounded-r-[8px] mt-2">
                <RichText
                  content={assessment.clinicalSummary as string}
                  emptyMsg="Sem conclusão clínica registrada."
                />
              </div>
            </div>

            <div className="mt-4 break-inside-avoid">
              <Eyebrow>Risco de Quedas</Eyebrow>
              <div className="mt-2">
                <StatusPill tone={fallRiskTone} text={fallRisk} />
              </div>
            </div>

            {hasSpirometry && (
              <div className="mt-4 break-inside-avoid">
                <Eyebrow>Função Respiratória (Espirometria)</Eyebrow>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <div className="border border-report-line rounded-[10px] p-3">
                    <p className="text-[0.7rem] text-report-ink-soft">VEF1</p>
                    <p className="text-sm font-report-mono font-semibold text-report-ink">
                      {fmt(sp.fev1, 'L')}
                    </p>
                  </div>
                  <div className="border border-report-line rounded-[10px] p-3">
                    <p className="text-[0.7rem] text-report-ink-soft">CVF</p>
                    <p className="text-sm font-report-mono font-semibold text-report-ink">
                      {fmt(sp.fvc, 'L')}
                    </p>
                  </div>
                  <div className="border border-report-line rounded-[10px] p-3">
                    <p className="text-[0.7rem] text-report-ink-soft">Relação VEF1/CVF</p>
                    <p className="text-sm font-report-mono font-semibold text-report-ink">
                      {fmt(sp.fev1FvcRatio)}
                    </p>
                  </div>
                  <div className="border border-report-line rounded-[10px] p-3">
                    <p className="text-[0.7rem] text-report-ink-soft">Padrão</p>
                    <p className="text-sm font-report-mono font-semibold text-report-ink">
                      {sp.pattern || '—'}
                    </p>
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
