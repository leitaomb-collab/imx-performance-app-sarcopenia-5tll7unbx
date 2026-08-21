import type { ReactNode } from 'react'
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
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react'
import type { Patient, User } from '@/types'

interface Props {
  assessment: Record<string, unknown>
  patient: Patient | null
  evaluator: User | null
}

const TH = ({ children }: { children: ReactNode }) => (
  <th className="bg-slate-50 font-medium text-slate-500 uppercase text-[0.65rem] p-1.5 text-left border-b border-slate-200">
    {children}
  </th>
)

const TD = ({ children }: { children: ReactNode }) => (
  <td className="p-1.5 border-b border-slate-100 align-top">{children}</td>
)

interface BadgeProps {
  text: string
  tone: 'green' | 'red' | 'yellow' | 'amber' | 'gray'
}

const StatusBadge = ({ text, tone }: BadgeProps) => {
  const tones: Record<BadgeProps['tone'], string> = {
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    amber: 'bg-amber-100 text-amber-700',
    gray: 'bg-slate-100 text-slate-500',
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-full ${tones[tone]}`}
    >
      {text}
    </span>
  )
}

const PlaceholderText = () => (
  <p className="text-slate-400 italic text-sm">Dados não coletados nesta avaliação</p>
)

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="text-base font-bold text-slate-800 border-b-2 border-slate-300 pb-2 mb-4">
    {children}
  </h2>
)

const SubTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="text-sm font-semibold text-slate-700 mb-2">{children}</h3>
)

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
  let diagCls = 'bg-green-50 border-2 border-green-300 text-green-800'
  if (strengthReduced && massReduced && perfReduced) {
    diagText = 'Sarcopenia grave'
    diagCls = 'bg-red-50 border-2 border-red-300 text-red-800'
  } else if (strengthReduced && massReduced) {
    diagText = 'Sarcopenia'
    diagCls = 'bg-amber-50 border-2 border-amber-300 text-amber-800'
  } else if (strengthReduced && !massReduced) {
    diagText = 'Risco de sarcopenia'
    diagCls = 'bg-yellow-50 border-2 border-yellow-300 text-yellow-800'
  } else if (sarcFPositive || sarcCalFPositive) {
    diagText = 'Risco de sarcopenia'
    diagCls = 'bg-yellow-50 border-2 border-yellow-300 text-yellow-800'
  }

  // Fall risk
  const tugVal = ba.tugSimple as number | undefined
  let fallRisk = 'Não avaliado'
  let fallRiskCls = 'bg-slate-100 text-slate-500'
  if (tugVal != null) {
    if (tugVal > 20) {
      fallRisk = 'Alto risco de quedas'
      fallRiskCls = 'bg-red-100 text-red-700'
    } else if (tugVal > 12) {
      fallRisk = 'Risco moderado de quedas'
      fallRiskCls = 'bg-amber-100 text-amber-700'
    } else {
      fallRisk = 'Baixo risco de quedas'
      fallRiskCls = 'bg-green-100 text-green-700'
    }
  }
  if (sppbTotal != null && sppbTotal < 7) {
    fallRisk = 'Alto risco de quedas'
    fallRiskCls = 'bg-red-100 text-red-700'
  }

  // EWGSOP2 flow steps
  const screeningCollected =
    ss.strength != null ||
    ss.assistanceWalking != null ||
    ss.riseChair != null ||
    ss.climbStairs != null ||
    ss.falls != null
  const steps: { label: string; value: string; pass: boolean }[] = [
    {
      label: 'Triagem (SARC-F)',
      value: screeningCollected
        ? sarcFPositive || sarcCalFPositive
          ? 'Risco detectado'
          : 'Sem risco'
        : 'Não avaliado',
      pass: !sarcFPositive && !sarcCalFPositive,
    },
    {
      label: 'Força Muscular',
      value:
        hgStatus === 'normal' ? 'Normal' : hgStatus === 'reduced' ? 'Reduzida' : 'Não avaliado',
      pass: hgStatus === 'normal',
    },
    {
      label: 'Massa Muscular',
      value:
        almiStatus === 'normal' ? 'Normal' : almiStatus === 'reduced' ? 'Reduzida' : 'Não avaliado',
      pass: almiStatus === 'normal',
    },
    {
      label: 'Desempenho Físico',
      value:
        sppbStatus === 'normal' && tugStatus === 'normal'
          ? 'Normal'
          : sppbStatus === 'reduced' || tugStatus === 'reduced'
            ? 'Reduzido'
            : 'Não avaliado',
      pass: sppbStatus === 'normal' && tugStatus === 'normal',
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
      <div className="bg-white text-slate-800 p-6 max-w-full text-[0.8rem]">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <Logo size="md" />
          <h1 className="text-base font-bold text-slate-800">Relatório de Avaliação Funcional</h1>
          <span className="text-sm text-slate-500">
            {assessment.assessmentDate ? formatDateBR(assessment.assessmentDate as string) : '—'}
          </span>
        </div>
        <div className="bg-slate-700 text-white px-4 py-2 rounded-md mb-6 flex flex-wrap gap-x-3 gap-y-1 text-sm">
          <span>{patientName}</span>
          <span>|</span>
          <span>{patientAge != null ? `${patientAge} anos` : '—'}</span>
          <span>|</span>
          <span>{patientGender}</span>
          <span>|</span>
          <span>Peso: {patientWeight}</span>
          <span>|</span>
          <span>Estatura: {patientHeight}</span>
          <span>|</span>
          <span>IMC: {patientIMC}</span>
        </div>

        {/* SECTION 1 — Resumo do Paciente */}
        <section className="break-inside-avoid mb-6">
          <SectionTitle>1. Resumo do Paciente</SectionTitle>
          {hasSarcScreening ? (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* SARC-F */}
              <div className="p-4 border border-slate-200 rounded-lg bg-white">
                <p className="text-xs font-medium text-slate-500 uppercase">SARC-F</p>
                <p className="text-2xl font-bold text-slate-900">{fmt(sarcFTotal)}</p>
                <div className="mt-2">
                  {sarcFTotal != null ? (
                    sarcFTotal >= 4 ? (
                      <StatusBadge text="Risco" tone="yellow" />
                    ) : (
                      <StatusBadge text="Normal" tone="green" />
                    )
                  ) : (
                    <StatusBadge text="Não avaliado" tone="gray" />
                  )}
                </div>
              </div>
              {/* SARC-CalF */}
              <div className="p-4 border border-slate-200 rounded-lg bg-white">
                <p className="text-xs font-medium text-slate-500 uppercase">SARC-CalF</p>
                <p className="text-2xl font-bold text-slate-900">{fmt(sarcCalFTotal)}</p>
                <div className="mt-2">
                  {sarcCalFTotal != null ? (
                    sarcCalFTotal >= 11 ? (
                      <StatusBadge text="Risco" tone="yellow" />
                    ) : (
                      <StatusBadge text="Normal" tone="green" />
                    )
                  ) : (
                    <StatusBadge text="Não avaliado" tone="gray" />
                  )}
                </div>
              </div>
              {/* IMC */}
              <div className="p-4 border border-slate-200 rounded-lg bg-white">
                <p className="text-xs font-medium text-slate-500 uppercase">IMC</p>
                <p className="text-2xl font-bold text-slate-900">{imc ? `${imc} kg/m²` : '—'}</p>
                <div className="mt-2">
                  {imc ? (
                    imc >= 18.5 && imc <= 24.9 ? (
                      <StatusBadge text="Normal" tone="green" />
                    ) : (
                      <StatusBadge text="Alterado" tone="yellow" />
                    )
                  ) : (
                    <StatusBadge text="Não avaliado" tone="gray" />
                  )}
                </div>
              </div>
              {/* Diagnóstico */}
              <div className="p-4 border border-slate-200 rounded-lg bg-white">
                <p className="text-xs font-medium text-slate-500 uppercase">Diagnóstico</p>
                <p className="text-2xl font-bold text-slate-900">
                  {diagInfo?.label ?? 'Não definido'}
                </p>
                <div className="mt-2">
                  {finalDiag === 'sem_sarcopenia' || finalDiag === 'normal' ? (
                    <StatusBadge text="Normal" tone="green" />
                  ) : finalDiag === 'risco_sarcopenia' ? (
                    <StatusBadge text="Risco" tone="yellow" />
                  ) : finalDiag === 'sarcopenia' ? (
                    <StatusBadge text="Sarcopenia" tone="amber" />
                  ) : finalDiag === 'sarcopenia_grave' ? (
                    <StatusBadge text="Sarcopenia Grave" tone="red" />
                  ) : (
                    <StatusBadge text="Não definido" tone="gray" />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 italic text-sm mb-6">
              Dados não coletados nesta avaliação
            </p>
          )}
        </section>

        {/* SECTION 2 — Força Muscular */}
        <section className="break-inside-avoid mb-6">
          <SectionTitle>2. Força Muscular</SectionTitle>
          {hasStrength ? (
            <>
              <div className="break-inside-avoid mb-4">
                <SubTitle>Força de Preensão Manual (Handgrip)</SubTitle>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      <TH>Parâmetro</TH>
                      <TH>Valor</TH>
                      <TH>Referência</TH>
                      <TH>Status</TH>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <TD>Handgrip Esquerdo</TD>
                      <TD>{fmt(ms.handgripLeft, 'kg')}</TD>
                      <TD>{handgripRef}</TD>
                      <TD>—</TD>
                    </tr>
                    <tr>
                      <TD>Handgrip Direito</TD>
                      <TD>{fmt(ms.handgripRight, 'kg')}</TD>
                      <TD>{handgripRef}</TD>
                      <TD>—</TD>
                    </tr>
                    <tr>
                      <TD>Handgrip Máximo</TD>
                      <TD>{fmt(ms.handgripMax, 'kg')}</TD>
                      <TD>{handgripRef}</TD>
                      <TD>
                        {hgStatus === 'normal' ? (
                          <StatusBadge text="Preservada" tone="green" />
                        ) : hgStatus === 'reduced' ? (
                          <StatusBadge text="Reduzida" tone="red" />
                        ) : (
                          <StatusBadge text="Não coletado" tone="gray" />
                        )}
                      </TD>
                    </tr>
                    {ms.handgripPercentile != null && (
                      <tr>
                        <TD>Percentil</TD>
                        <TD>{String(ms.handgripPercentile)}º</TD>
                        <TD>—</TD>
                        <TD>—</TD>
                      </tr>
                    )}
                    <tr>
                      <TD>Levantar da Cadeira (5x)</TD>
                      <TD>{fmt(ms.chairStandTime, 's')}</TD>
                      <TD>≤ 15 s</TD>
                      <TD>
                        {csStatus === 'normal' ? (
                          <StatusBadge text="Preservada" tone="green" />
                        ) : csStatus === 'reduced' ? (
                          <StatusBadge text="Reduzida" tone="red" />
                        ) : (
                          <StatusBadge text="Não coletado" tone="gray" />
                        )}
                      </TD>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <PlaceholderText />
          )}

          {hasResp && (
            <div className="break-inside-avoid mb-4">
              <SubTitle>Força da Musculatura Respiratória</SubTitle>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <TH>Parâmetro</TH>
                    <TH>Valor</TH>
                    <TH>Referência</TH>
                    <TH>Status</TH>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
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
                    return (
                      <>
                        <tr>
                          <TD>PImax Atual</TD>
                          <TD>{fmt(rs.pimaxActual, 'cmH₂O')}</TD>
                          <TD>—</TD>
                          <TD>—</TD>
                        </tr>
                        <tr>
                          <TD>PImax Previsto</TD>
                          <TD>{fmt(rs.pimaxPredicted, 'cmH₂O')}</TD>
                          <TD>—</TD>
                          <TD>—</TD>
                        </tr>
                        <tr>
                          <TD>PImax % do Previsto</TD>
                          <TD>{pimaxPct != null ? `${pimaxPct}%` : '—'}</TD>
                          <TD>≥ 80%</TD>
                          <TD>
                            {pimaxPct != null ? (
                              pimaxPct >= 80 ? (
                                <StatusBadge text="Normal" tone="green" />
                              ) : (
                                <StatusBadge text="Reduzida" tone="red" />
                              )
                            ) : (
                              <StatusBadge text="Não coletado" tone="gray" />
                            )}
                          </TD>
                        </tr>
                        <tr>
                          <TD>PEmax Atual</TD>
                          <TD>{fmt(rs.pemaxActual, 'cmH₂O')}</TD>
                          <TD>—</TD>
                          <TD>—</TD>
                        </tr>
                        <tr>
                          <TD>PEmax Previsto</TD>
                          <TD>{fmt(rs.pemaxPredicted, 'cmH₂O')}</TD>
                          <TD>—</TD>
                          <TD>—</TD>
                        </tr>
                        <tr>
                          <TD>PEmax % do Previsto</TD>
                          <TD>{pemaxPct != null ? `${pemaxPct}%` : '—'}</TD>
                          <TD>≥ 80%</TD>
                          <TD>
                            {pemaxPct != null ? (
                              pemaxPct >= 80 ? (
                                <StatusBadge text="Normal" tone="green" />
                              ) : (
                                <StatusBadge text="Reduzida" tone="red" />
                              )
                            ) : (
                              <StatusBadge text="Não coletado" tone="gray" />
                            )}
                          </TD>
                        </tr>
                      </>
                    )
                  })()}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* SECTION 3 — Massa Muscular */}
        <section className="break-inside-avoid mb-6">
          <SectionTitle>3. Massa Muscular</SectionTitle>
          {hasBC || hasAnth ? (
            <>
              <div className="break-inside-avoid mb-4">
                <SubTitle>Índice de Massa Muscular Apendicular (ALMI)</SubTitle>
                {bc.almi != null ? (
                  <div className="p-4 border border-slate-200 rounded-lg bg-white">
                    <p className="text-2xl font-bold text-slate-900">{fmt(bc.almi, 'kg/m²')}</p>
                    <p className="text-xs text-slate-500 mt-1">Referência: {almiRef}</p>
                    <div className="mt-2">
                      {almiStatus === 'normal' ? (
                        <StatusBadge text="Normal" tone="green" />
                      ) : almiStatus === 'reduced' ? (
                        <StatusBadge text="Reduzida" tone="red" />
                      ) : (
                        <StatusBadge text="Não avaliado" tone="gray" />
                      )}
                    </div>
                  </div>
                ) : (
                  <StatusBadge text="Não coletado" tone="gray" />
                )}
              </div>

              <div className="break-inside-avoid mb-4">
                <SubTitle>Composição Corporal</SubTitle>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      <TH>Parâmetro</TH>
                      <TH>Valor</TH>
                      <TH>Referência</TH>
                      <TH>Status</TH>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <TD>Gordura Corporal</TD>
                      <TD>{fmt(bc.fatPercentage, '%')}</TD>
                      <TD>—</TD>
                      <TD>—</TD>
                    </tr>
                    <tr>
                      <TD>Ângulo de Fase</TD>
                      <TD>{fmt(bc.phaseAngle, '°')}</TD>
                      <TD>{phaseRef}</TD>
                      <TD>
                        {paStatus === 'normal' ? (
                          <StatusBadge text="Normal" tone="green" />
                        ) : paStatus === 'reduced' ? (
                          <StatusBadge text="Reduzida" tone="red" />
                        ) : (
                          <StatusBadge text="Não coletado" tone="gray" />
                        )}
                      </TD>
                    </tr>
                    <tr>
                      <TD>Massa Muscular Apendicular</TD>
                      <TD>{fmt(bc.appendicularMuscleMass, 'kg')}</TD>
                      <TD>—</TD>
                      <TD>—</TD>
                    </tr>
                    <tr>
                      <TD>Circunferência da Panturrilha</TD>
                      <TD>{fmt(an.calfCircumference, 'cm')}</TD>
                      <TD>{calfRef}</TD>
                      <TD>—</TD>
                    </tr>
                    <tr>
                      <TD>IMC</TD>
                      <TD>{imc ? `${imc} kg/m²` : '—'}</TD>
                      <TD>18.5–24.9 kg/m²</TD>
                      <TD>
                        {imc ? (
                          imc >= 18.5 && imc <= 24.9 ? (
                            <StatusBadge text="Normal" tone="green" />
                          ) : (
                            <StatusBadge text="Alterado" tone="yellow" />
                          )
                        ) : (
                          <StatusBadge text="Não coletado" tone="gray" />
                        )}
                      </TD>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <PlaceholderText />
          )}
        </section>

        {/* SECTION 4 — Desempenho Físico */}
        <section className="break-inside-avoid mb-6">
          <SectionTitle>4. Desempenho Físico</SectionTitle>
          {hasPerf ? (
            <>
              <div className="break-inside-avoid mb-4">
                <SubTitle>Short Physical Performance Battery (SPPB)</SubTitle>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      <TH>Parâmetro</TH>
                      <TH>Valor</TH>
                      <TH>Referência</TH>
                      <TH>Status</TH>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <TD>Equilíbrio (SPPB)</TD>
                      <TD>{fmt(ba.sppbBalance, 'pts')}</TD>
                      <TD>0 a 4 pts</TD>
                      <TD>—</TD>
                    </tr>
                    <tr>
                      <TD>Velocidade de Marcha (SPPB)</TD>
                      <TD>{fmt(ba.sppbGait, 'pts')}</TD>
                      <TD>0 a 4 pts</TD>
                      <TD>—</TD>
                    </tr>
                    <tr>
                      <TD>Levantar da Cadeira (SPPB)</TD>
                      <TD>{fmt(ba.sppbChair, 'pts')}</TD>
                      <TD>0 a 4 pts</TD>
                      <TD>—</TD>
                    </tr>
                    <tr>
                      <TD>Total SPPB</TD>
                      <TD>{fmt(sppbTotal, 'pts')}</TD>
                      <TD>≥ 10 pts (0 a 12 pts)</TD>
                      <TD>
                        {sppbStatus === 'normal' ? (
                          <StatusBadge text="Normal" tone="green" />
                        ) : sppbStatus === 'reduced' ? (
                          <StatusBadge text="Reduzido" tone="red" />
                        ) : (
                          <StatusBadge text="Não coletado" tone="gray" />
                        )}
                      </TD>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="break-inside-avoid mb-4">
                <SubTitle>Timed Up and Go (TUG)</SubTitle>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      <TH>Parâmetro</TH>
                      <TH>Valor</TH>
                      <TH>Referência</TH>
                      <TH>Status</TH>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <TD>TUG Simples</TD>
                      <TD>{fmt(ba.tugSimple, 's')}</TD>
                      <TD>≤ 12 s</TD>
                      <TD>
                        {tugVal != null ? (
                          tugVal <= 12 ? (
                            <StatusBadge text="Normal" tone="green" />
                          ) : tugVal <= 20 ? (
                            <StatusBadge text="Risco Moderado" tone="yellow" />
                          ) : (
                            <StatusBadge text="Risco Alto" tone="red" />
                          )
                        ) : (
                          <StatusBadge text="Não coletado" tone="gray" />
                        )}
                      </TD>
                    </tr>
                    <tr>
                      <TD>TUG Dupla Tarefa</TD>
                      <TD>{fmt(ba.tugDualTask, 's')}</TD>
                      <TD>—</TD>
                      <TD>—</TD>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="break-inside-avoid mb-4">
                <SubTitle>Estabilometria</SubTitle>
                {ba.stabilometryEyesOpen || ba.stabilometryEyesClosed ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border border-slate-200 rounded-lg">
                      <p className="text-xs font-medium text-slate-500 uppercase">Olhos Abertos</p>
                      <p className="text-sm">{String(ba.stabilometryEyesOpen ?? '—')}</p>
                    </div>
                    <div className="p-3 border border-slate-200 rounded-lg">
                      <p className="text-xs font-medium text-slate-500 uppercase">Olhos Fechados</p>
                      <p className="text-sm">{String(ba.stabilometryEyesClosed ?? '—')}</p>
                    </div>
                  </div>
                ) : (
                  <StatusBadge text="Não avaliado" tone="gray" />
                )}
              </div>
            </>
          ) : (
            <PlaceholderText />
          )}
        </section>

        {/* SECTION 5 — Diagnóstico */}
        <section className="break-inside-avoid mb-6">
          <SectionTitle>5. Diagnóstico</SectionTitle>
          {hasDiagData ? (
            <>
              {/* EWGSOP2 Flow */}
              <div className="break-inside-avoid mb-4">
                <SubTitle>Algoritmo Diagnóstico EWGSOP2</SubTitle>
                <div className="flex flex-wrap items-stretch gap-2">
                  {steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 flex-1 min-w-[140px]">
                      <div className="rounded-lg border border-slate-200 p-3 flex flex-col items-center gap-1 min-w-0 flex-1 bg-white">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                            step.pass ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
                          }`}
                        >
                          {step.pass ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </div>
                        <p className="text-xs font-medium text-slate-500 uppercase text-center">
                          {step.label}
                        </p>
                        <p className="text-sm font-bold text-center text-slate-900">{step.value}</p>
                      </div>
                      {i < steps.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnosis box */}
              <div className={`break-inside-avoid mb-4 rounded-lg p-4 text-center ${diagCls}`}>
                <p className="text-xs font-semibold uppercase mb-1 opacity-80">Diagnóstico Final</p>
                <p className="font-bold text-base">{diagText}</p>
              </div>

              {/* Fall risk */}
              <div className="break-inside-avoid mb-4">
                <SubTitle>Risco de Quedas</SubTitle>
                <span
                  className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${fallRiskCls}`}
                >
                  {fallRisk}
                </span>
              </div>

              {/* Clinical conclusion */}
              <div className="break-inside-avoid mb-4">
                <SubTitle>Conclusão Clínica</SubTitle>
                <div className="bg-slate-50 border-l-4 border-slate-400 p-4 text-sm text-slate-700">
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
          <SectionTitle>6. Recomendações</SectionTitle>
          <div className="grid grid-cols-3 gap-3">
            <div className="border-l-4 border-slate-400 p-4 rounded bg-white break-inside-avoid">
              <SubTitle>Exercício</SubTitle>
              {exercise && exercise.trim() ? (
                <RichText content={exercise} emptyMsg="" />
              ) : (
                <p className="text-slate-400 italic text-sm">Não definido</p>
              )}
            </div>
            <div className="border-l-4 border-green-400 p-4 rounded bg-white break-inside-avoid">
              <SubTitle>Nutrição</SubTitle>
              {nutrition && nutrition.trim() ? (
                <RichText content={nutrition} emptyMsg="" />
              ) : (
                <p className="text-slate-400 italic text-sm">Não definido</p>
              )}
            </div>
            <div className="border-l-4 border-blue-400 p-4 rounded bg-white break-inside-avoid">
              <SubTitle>Reavaliação</SubTitle>
              {reassessmentDate ? (
                <p className="text-sm font-medium">{formatDateBR(reassessmentDate)}</p>
              ) : (
                <p className="text-slate-400 italic text-sm">Não definido</p>
              )}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <div className="border-t border-slate-200 pt-2 mt-6 text-center text-[0.65rem] text-slate-400 flex justify-between">
          <span>IEMEX Performance</span>
          <span>
            {assessment.assessmentDate ? formatDateBR(assessment.assessmentDate as string) : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}
