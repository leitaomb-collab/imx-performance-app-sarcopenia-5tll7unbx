import { obj, fmt, hasData } from '@/lib/report-utils'
import {
  getSarcFTotal,
  getSarcCalFTotal,
  getHandgripStatus,
  getALMIStatus,
  getPhaseAngleStatus,
  getSPPBTotal,
  getSPPBStatus,
  getTUGStatus,
  getChairStandStatus,
  calcPercent,
} from '@/lib/clinical-utils'
import {
  calculateAge,
  calculateIMC,
  formatGender,
  formatDateBR,
  getIMCCategory,
  getDiagnosisInfo,
} from '@/lib/patient-utils'
import { Logo } from '@/components/Logo'
import { RichText } from '@/components/patients/RichText'
import type { Patient, User } from '@/types'
import {
  Eyebrow,
  SectionHeading,
  SubHeading,
  PlaceholderText,
  StatusPill,
  ReadingCard,
  DataTable,
  DiagnosticPathway,
  VerdictBanner,
  RecommendationCard,
  type Tone,
  type PathwayStep,
} from './ReportTable'

interface Props {
  assessment: Record<string, unknown>
  patient: Patient | null
  evaluator: User | null
}

/** Maps the clinical 'normal' | 'reduced' | null status vocabulary onto the report's tone palette. */
function toTone(status: 'normal' | 'reduced' | null | undefined): Tone {
  if (status === 'normal') return 'normal'
  if (status === 'reduced') return 'low'
  return 'na'
}

export function ReportPrint({ assessment, patient, evaluator: _evaluator }: Props) {
  const gender = patient?.gender ?? 'M'

  // Derived data objects
  const ss = obj(assessment.sarcopeniaScreening)
  const ms = obj(assessment.muscleStrength)
  const rs = obj(assessment.respiratoryStrength)
  const bc = obj(assessment.bodyComposition)
  const an = obj(assessment.anthropometry)
  const ba = obj(assessment.balanceAssessment)

  const sarcFTotal = getSarcFTotal([
    ss.strength as number | undefined,
    ss.assistanceWalking as number | undefined,
    ss.riseChair as number | undefined,
    ss.climbStairs as number | undefined,
    ss.falls as number | undefined,
  ])
  const sarcCalFTotal = getSarcCalFTotal(
    sarcFTotal,
    ss.calfCircumference as number | undefined,
    gender,
  )

  const heightM = (patient?.height ?? 0) > 3 ? (patient?.height ?? 0) / 100 : (patient?.height ?? 0)
  const weight = patient?.weight ?? an.weight
  const imc = calculateIMC(weight ?? 0, heightM)
  const imcCategory = imc ? getIMCCategory(imc) : null
  const imcNormal = imc ? imc >= 18.5 && imc <= 24.9 : null

  const hgStatus = getHandgripStatus(ms.handgripMax as number | undefined, gender)
  const csStatus = getChairStandStatus(ms.chairStandTime as number | undefined)
  const almiStatus = getALMIStatus(bc.almi as number | undefined, gender)
  const paStatus = getPhaseAngleStatus(bc.phaseAngle as number | undefined, gender)
  const sppbTotal = getSPPBTotal(
    ba.sppbBalance as number | undefined,
    ba.sppbGait as number | undefined,
    ba.sppbChair as number | undefined,
  )
  const sppbStatus = getSPPBStatus(sppbTotal)
  const tugStatus = getTUGStatus(ba.tugSimple as number | undefined)

  const handgripRef = gender === 'M' ? '≥ 27 kg (M)' : '≥ 16 kg (F)'
  const almiRef = gender === 'M' ? '≥ 7.0 kg/m² (M)' : '≥ 5.4 kg/m² (F)'
  const phaseRef = gender === 'M' ? '≥ 5.0° (M)' : '≥ 4.6° (F)'
  const calfRef = gender === 'M' ? '≥ 34 cm (M)' : '≥ 33 cm (F)'

  // SECTION 5 computations
  const strengthReduced = hgStatus === 'reduced'
  const massReduced = almiStatus === 'reduced'
  const perfReduced = sppbStatus === 'reduced' || tugStatus === 'reduced'
  const sarcFPositive = sarcFTotal != null && sarcFTotal >= 4
  const sarcCalFPositive = sarcCalFTotal != null && sarcCalFTotal >= 11

  let diagText = 'Normal'
  let diagTone: Tone = 'normal'
  let diagDetail = 'Força, massa muscular e desempenho físico dentro da normalidade.'
  if (strengthReduced && massReduced && perfReduced) {
    diagText = 'Sarcopenia grave'
    diagTone = 'low'
    diagDetail = 'Força, massa muscular e desempenho físico reduzidos — quadro de maior gravidade.'
  } else if (strengthReduced && massReduced) {
    diagText = 'Sarcopenia'
    diagTone = 'watch'
    diagDetail = 'Força e massa muscular reduzidas, confirmando o diagnóstico.'
  } else if (strengthReduced && !massReduced) {
    diagText = 'Risco de sarcopenia'
    diagTone = 'watch'
    diagDetail = 'Força reduzida com massa muscular preservada. Recomenda-se monitoramento.'
  } else if (sarcFPositive || sarcCalFPositive) {
    diagText = 'Risco de sarcopenia'
    diagTone = 'watch'
    diagDetail = 'Triagem positiva (SARC-F/SARC-CalF). Recomenda-se investigação complementar.'
  }

  // Fall risk
  const tugVal = ba.tugSimple as number | undefined
  let fallRisk = 'Não avaliado'
  let fallRiskTone: Tone = 'na'
  if (tugVal != null) {
    if (tugVal > 20) {
      fallRisk = 'Alto risco de quedas'
      fallRiskTone = 'low'
    } else if (tugVal > 12) {
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

  // EWGSOP2 flow steps → diagnostic pathway
  const screeningCollected =
    ss.strength != null ||
    ss.assistanceWalking != null ||
    ss.riseChair != null ||
    ss.climbStairs != null ||
    ss.falls != null

  const pathwaySteps: PathwayStep[] = [
    {
      label: 'Triagem',
      sub: screeningCollected
        ? sarcFPositive || sarcCalFPositive
          ? 'Risco detectado'
          : 'Sem risco'
        : 'Não avaliado',
      status: !screeningCollected
        ? 'pending'
        : !sarcFPositive && !sarcCalFPositive
          ? 'pass'
          : 'fail',
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
    {
      label: 'Veredito',
      sub: diagText,
      status: diagTone === 'normal' ? 'pass' : 'fail',
    },
  ]

  const hasSarcScreening = hasData(ss)
  const hasStrength = hasData(ms)
  const hasResp = hasData(rs)
  const hasBC = hasData(bc)
  const hasAnth = hasData(an)
  const hasPerf = hasData(ba)
  const hasDiagData =
    hasStrength || hasBC || hasPerf || hasSarcScreening || assessment.finalDiagnosis != null

  // SECTION 1 diagnosis card mapping
  const finalDiag = assessment.finalDiagnosis as string | undefined
  const diagInfo = getDiagnosisInfo(finalDiag ?? '')
  const finalDiagTone: Tone =
    finalDiag === 'sem_sarcopenia' || finalDiag === 'normal'
      ? 'normal'
      : finalDiag === 'risco_sarcopenia' || finalDiag === 'sarcopenia'
        ? 'watch'
        : finalDiag === 'sarcopenia_grave'
          ? 'low'
          : 'na'

  // SECTION 6 fields
  const exercise = assessment.exerciseRecommendations as string | undefined
  const nutrition = assessment.nutritionRecommendations as string | undefined
  const reassessmentDate = assessment.reassessmentDate as string | undefined

  // Header patient-bar fields
  const patientName = patient?.name ?? '—'
  const patientAge = patient?.birthDate ? calculateAge(patient.birthDate) : null
  const patientGender = patient ? formatGender(patient.gender) : '—'
  const patientWeight = weight != null ? `${weight} kg` : '—'
  const patientHeight = patient?.height
    ? patient.height > 3
      ? `${patient.height} cm`
      : `${patient.height} m`
    : '—'
  const patientIMC = imc ? `${imc} kg/m²${imcCategory ? ` (${imcCategory})` : ''}` : '—'

  return (
    <div className="hidden print:block">
      <div className="bg-report-paper text-report-ink p-6 max-w-full text-[0.8rem] font-sans">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-5 pb-5 border-b border-report-line">
          <div>
            <Eyebrow>IEMEX Performance · Avaliação funcional</Eyebrow>
            <h1 className="font-report-display text-[1.35rem] font-semibold text-report-ink mt-1">
              {patientName}
            </h1>
            <p className="text-[0.75rem] text-report-ink-soft mt-0.5">
              {patientAge != null ? `${patientAge} anos` : '—'} · {patientGender} · Peso{' '}
              {patientWeight} · Estatura {patientHeight} · IMC {patientIMC}
            </p>
          </div>
          <div className="flex items-start gap-4">
            <div className="text-right">
              <Eyebrow>Avaliado em</Eyebrow>
              <p className="font-report-mono text-[0.8rem] text-report-ink mt-0.5">
                {assessment.assessmentDate
                  ? formatDateBR(assessment.assessmentDate as string)
                  : '—'}
              </p>
            </div>
            <Logo size="md" />
          </div>
        </div>

        {/* VERDICT STRIP */}
        {hasDiagData && (
          <div className="mb-5">
            <VerdictBanner
              eyebrow="Diagnóstico EWGSOP2"
              title={diagText}
              detail={diagDetail}
              tone={diagTone}
            />
          </div>
        )}

        {/* SECTION 1 — Resumo do Paciente */}
        <section className="break-inside-avoid mb-6">
          <SectionHeading n={1}>Resumo do Paciente</SectionHeading>
          {hasSarcScreening ? (
            <div className="flex flex-wrap gap-3 mb-2">
              <ReadingCard
                label="SARC-F"
                value={fmt(sarcFTotal)}
                refText={
                  sarcFTotal != null
                    ? sarcFPositive
                      ? 'Risco (≥ 4 pts)'
                      : 'Sem risco'
                    : 'Não avaliado'
                }
                tone={sarcFTotal == null ? 'na' : sarcFPositive ? 'watch' : 'normal'}
              />
              <ReadingCard
                label="SARC-CalF"
                value={fmt(sarcCalFTotal)}
                refText={
                  sarcCalFTotal != null
                    ? sarcCalFPositive
                      ? 'Risco (≥ 11 pts)'
                      : 'Sem risco'
                    : 'Não avaliado'
                }
                tone={sarcCalFTotal == null ? 'na' : sarcCalFPositive ? 'watch' : 'normal'}
              />
              <ReadingCard
                label="IMC"
                value={imc ? String(imc) : '—'}
                unit={imc ? 'kg/m²' : undefined}
                refText={
                  imc ? (imcNormal ? 'Faixa normal' : 'Fora da faixa normal') : 'Não avaliado'
                }
                tone={imc == null ? 'na' : imcNormal ? 'normal' : 'watch'}
              />
              <ReadingCard
                label="Diagnóstico"
                value={diagInfo?.label ?? 'Não definido'}
                refText={finalDiagTone === 'na' ? 'Não definido' : 'Ver seção 5'}
                tone={finalDiagTone}
              />
            </div>
          ) : (
            <PlaceholderText />
          )}
        </section>

        {/* SECTION 2 — Força Muscular */}
        <section className="break-inside-avoid mb-6">
          <SectionHeading n={2}>Força Muscular</SectionHeading>
          {hasStrength ? (
            <div className="break-inside-avoid mb-4">
              <SubHeading>Força de Preensão Manual (Handgrip)</SubHeading>
              <DataTable
                head={['Parâmetro', 'Valor', 'Referência', 'Status']}
                rows={[
                  ['Handgrip Esquerdo', fmt(ms.handgripLeft, 'kg'), handgripRef, '—'],
                  ['Handgrip Direito', fmt(ms.handgripRight, 'kg'), handgripRef, '—'],
                  [
                    'Handgrip Máximo',
                    fmt(ms.handgripMax, 'kg'),
                    handgripRef,
                    <StatusPill
                      key="hg"
                      tone={toTone(hgStatus)}
                      text={
                        hgStatus === 'normal'
                          ? 'Preservada'
                          : hgStatus === 'reduced'
                            ? 'Reduzida'
                            : undefined
                      }
                    />,
                  ],
                  ...(ms.handgripPercentile != null
                    ? [['Percentil', `${String(ms.handgripPercentile)}º`, '—', '—']]
                    : []),
                  [
                    'Levantar da Cadeira (5x)',
                    fmt(ms.chairStandTime, 's'),
                    '≤ 15 s',
                    <StatusPill
                      key="cs"
                      tone={toTone(csStatus)}
                      text={
                        csStatus === 'normal'
                          ? 'Preservada'
                          : csStatus === 'reduced'
                            ? 'Reduzida'
                            : undefined
                      }
                    />,
                  ],
                ]}
              />
            </div>
          ) : (
            <PlaceholderText />
          )}

          {hasResp &&
            (() => {
              const pimaxPct =
                (rs.pimaxPercent as number | undefined) ??
                calcPercent(
                  rs.pimaxActual as number | undefined,
                  rs.pimaxPredicted as number | undefined,
                )
              const pemaxPct =
                (rs.pemaxPercent as number | undefined) ??
                calcPercent(
                  rs.pemaxActual as number | undefined,
                  rs.pemaxPredicted as number | undefined,
                )
              const pimaxTone: Tone = pimaxPct == null ? 'na' : pimaxPct >= 80 ? 'normal' : 'low'
              const pemaxTone: Tone = pemaxPct == null ? 'na' : pemaxPct >= 80 ? 'normal' : 'low'
              return (
                <div className="break-inside-avoid mb-4">
                  <SubHeading>Força da Musculatura Respiratória</SubHeading>
                  <DataTable
                    head={['Parâmetro', 'Valor', 'Referência', 'Status']}
                    rows={[
                      ['PImax Atual', fmt(rs.pimaxActual, 'cmH₂O'), '—', '—'],
                      ['PImax Previsto', fmt(rs.pimaxPredicted, 'cmH₂O'), '—', '—'],
                      [
                        'PImax % do Previsto',
                        pimaxPct != null ? `${pimaxPct}%` : '—',
                        '≥ 80%',
                        <StatusPill
                          key="pimax"
                          tone={pimaxTone}
                          text={
                            pimaxPct == null
                              ? undefined
                              : pimaxTone === 'normal'
                                ? 'Normal'
                                : 'Reduzida'
                          }
                        />,
                      ],
                      ['PEmax Atual', fmt(rs.pemaxActual, 'cmH₂O'), '—', '—'],
                      ['PEmax Previsto', fmt(rs.pemaxPredicted, 'cmH₂O'), '—', '—'],
                      [
                        'PEmax % do Previsto',
                        pemaxPct != null ? `${pemaxPct}%` : '—',
                        '≥ 80%',
                        <StatusPill
                          key="pemax"
                          tone={pemaxTone}
                          text={
                            pemaxPct == null
                              ? undefined
                              : pemaxTone === 'normal'
                                ? 'Normal'
                                : 'Reduzida'
                          }
                        />,
                      ],
                    ]}
                  />
                </div>
              )
            })()}
        </section>

        {/* SECTION 3 — Massa Muscular */}
        <section className="break-inside-avoid mb-6">
          <SectionHeading n={3}>Massa Muscular</SectionHeading>
          {hasBC || hasAnth ? (
            <>
              <div className="break-inside-avoid mb-4 flex flex-wrap gap-3">
                <ReadingCard
                  label="Índice de Massa Muscular Apendicular"
                  value={bc.almi != null ? fmt(bc.almi) : '—'}
                  unit={bc.almi != null ? 'kg/m²' : undefined}
                  refText={`Referência: ${almiRef}`}
                  tone={toTone(almiStatus)}
                />
              </div>

              <div className="break-inside-avoid mb-4">
                <SubHeading>Composição Corporal</SubHeading>
                <DataTable
                  head={['Parâmetro', 'Valor', 'Referência', 'Status']}
                  rows={[
                    ['Gordura Corporal', fmt(bc.fatPercentage, '%'), '—', '—'],
                    [
                      'Ângulo de Fase',
                      fmt(bc.phaseAngle, '°'),
                      phaseRef,
                      <StatusPill
                        key="pa"
                        tone={toTone(paStatus)}
                        text={
                          paStatus === 'normal'
                            ? 'Normal'
                            : paStatus === 'reduced'
                              ? 'Reduzida'
                              : undefined
                        }
                      />,
                    ],
                    ['Massa Muscular Apendicular', fmt(bc.appendicularMuscleMass, 'kg'), '—', '—'],
                    [
                      'Circunferência da Panturrilha',
                      fmt(an.calfCircumference, 'cm'),
                      calfRef,
                      '—',
                    ],
                    [
                      'IMC',
                      imc ? `${imc} kg/m²` : '—',
                      '18.5–24.9 kg/m²',
                      <StatusPill
                        key="imc"
                        tone={imc == null ? 'na' : imcNormal ? 'normal' : 'watch'}
                        text={imc == null ? undefined : imcNormal ? 'Normal' : 'Alterado'}
                      />,
                    ],
                  ]}
                />
              </div>
            </>
          ) : (
            <PlaceholderText />
          )}
        </section>

        {/* SECTION 4 — Desempenho Físico */}
        <section className="break-inside-avoid mb-6">
          <SectionHeading n={4}>Desempenho Físico</SectionHeading>
          {hasPerf ? (
            <>
              <div className="break-inside-avoid mb-4">
                <SubHeading>Short Physical Performance Battery (SPPB)</SubHeading>
                <DataTable
                  head={['Parâmetro', 'Valor', 'Referência', 'Status']}
                  rows={[
                    ['Equilíbrio (SPPB)', fmt(ba.sppbBalance, 'pts'), '0 a 4 pts', '—'],
                    ['Velocidade de Marcha (SPPB)', fmt(ba.sppbGait, 'pts'), '0 a 4 pts', '—'],
                    ['Levantar da Cadeira (SPPB)', fmt(ba.sppbChair, 'pts'), '0 a 4 pts', '—'],
                    [
                      'Total SPPB',
                      fmt(sppbTotal, 'pts'),
                      '≥ 10 pts (0 a 12 pts)',
                      <StatusPill
                        key="sppb"
                        tone={toTone(sppbStatus)}
                        text={
                          sppbStatus === 'normal'
                            ? 'Normal'
                            : sppbStatus === 'reduced'
                              ? 'Reduzido'
                              : undefined
                        }
                      />,
                    ],
                  ]}
                />
              </div>

              <div className="break-inside-avoid mb-4">
                <SubHeading>Timed Up and Go (TUG)</SubHeading>
                <DataTable
                  head={['Parâmetro', 'Valor', 'Referência', 'Status']}
                  rows={[
                    [
                      'TUG Simples',
                      fmt(ba.tugSimple, 's'),
                      '≤ 12 s',
                      tugVal != null ? (
                        <StatusPill
                          key="tug"
                          tone={tugVal <= 12 ? 'normal' : tugVal <= 20 ? 'watch' : 'low'}
                          text={
                            tugVal <= 12 ? 'Normal' : tugVal <= 20 ? 'Risco Moderado' : 'Risco Alto'
                          }
                        />
                      ) : (
                        <StatusPill key="tug" tone="na" />
                      ),
                    ],
                    ['TUG Dupla Tarefa', fmt(ba.tugDualTask, 's'), '—', '—'],
                  ]}
                />
              </div>

              <div className="break-inside-avoid mb-4">
                <SubHeading>Estabilometria</SubHeading>
                {ba.stabilometryEyesOpen || ba.stabilometryEyesClosed ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border border-report-line rounded-[10px]">
                      <Eyebrow>Olhos Abertos</Eyebrow>
                      <p className="text-sm text-report-ink mt-1">
                        {String(ba.stabilometryEyesOpen ?? '—')}
                      </p>
                    </div>
                    <div className="p-3 border border-report-line rounded-[10px]">
                      <Eyebrow>Olhos Fechados</Eyebrow>
                      <p className="text-sm text-report-ink mt-1">
                        {String(ba.stabilometryEyesClosed ?? '—')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <StatusPill tone="na" />
                )}
              </div>
            </>
          ) : (
            <PlaceholderText />
          )}
        </section>

        {/* SECTION 5 — Diagnóstico */}
        <section className="break-inside-avoid mb-6">
          <SectionHeading n={5}>Diagnóstico</SectionHeading>
          {hasDiagData ? (
            <>
              {/* Signature element: EWGSOP2 diagnostic pathway */}
              <div className="break-inside-avoid mb-5">
                <SubHeading>Percurso Diagnóstico EWGSOP2</SubHeading>
                <DiagnosticPathway steps={pathwaySteps} />
              </div>

              <div className="break-inside-avoid mb-4">
                <VerdictBanner
                  eyebrow="Diagnóstico Final"
                  title={diagText}
                  detail={diagDetail}
                  tone={diagTone}
                />
              </div>

              {/* Fall risk */}
              <div className="break-inside-avoid mb-4">
                <SubHeading>Risco de Quedas</SubHeading>
                <StatusPill tone={fallRiskTone} text={fallRisk} />
              </div>

              {/* Clinical conclusion */}
              <div className="break-inside-avoid mb-4">
                <SubHeading>Conclusão Clínica</SubHeading>
                <div className="bg-report-paper-soft border-l-[3px] border-report-ink-soft p-4 text-sm text-report-ink">
                  <RichText
                    content={assessment.clinicalSummary as string}
                    emptyMsg="Sem conclusão clínica registrada."
                  />
                </div>
              </div>
            </>
          ) : (
            <PlaceholderText />
          )}
        </section>

        {/* SECTION 6 — Recomendações */}
        <section className="break-inside-avoid mb-6">
          <SectionHeading n={6}>Recomendações</SectionHeading>
          <div className="flex flex-wrap gap-3">
            <RecommendationCard title="Exercício">
              {exercise && exercise.trim() ? (
                <RichText content={exercise} emptyMsg="" />
              ) : (
                <p className="text-report-ink-soft italic text-sm">Não definido</p>
              )}
            </RecommendationCard>
            <RecommendationCard title="Nutrição">
              {nutrition && nutrition.trim() ? (
                <RichText content={nutrition} emptyMsg="" />
              ) : (
                <p className="text-report-ink-soft italic text-sm">Não definido</p>
              )}
            </RecommendationCard>
            <RecommendationCard title="Reavaliação">
              {reassessmentDate ? (
                <p className="text-sm font-report-mono font-semibold">
                  {formatDateBR(reassessmentDate)}
                </p>
              ) : (
                <p className="text-report-ink-soft italic text-sm">Não definido</p>
              )}
            </RecommendationCard>
          </div>
        </section>

        {/* FOOTER */}
        <div className="border-t border-report-line pt-2 mt-6 text-center text-[0.65rem] text-report-ink-soft flex justify-between font-report-mono">
          <span>IEMEX Performance</span>
          <span>
            {assessment.assessmentDate ? formatDateBR(assessment.assessmentDate as string) : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}
