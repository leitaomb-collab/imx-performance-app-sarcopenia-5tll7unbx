import { ReportTable, SectionBlock, SubSection, EmptySection } from './ReportTable'
import { obj, fmt, hasData, interpRange, interpBP } from '@/lib/report-utils'
import {
  getALMIStatus,
  getPhaseAngleStatus,
  getChairStandStatus,
  getTUGStatus,
  getSPPBStatus,
  getSPPBTotal,
  type ClinicalStatus,
} from '@/lib/clinical-utils'
import { getHandgripPercentile } from '@/constants/handgripNorms'
import { calculateAge } from '@/lib/patient-utils'
import { cn } from '@/lib/utils'
import type { Patient } from '@/types'

interface Props {
  assessment: Record<string, any>
  patient: Patient | null
}

function ci(
  s: ClinicalStatus,
  normal = 'Normal',
  reduced = 'Reduzida',
  normalCls: 'normal' | 'blue' = 'normal',
): { text: string; cls: 'normal' | 'reduced' | 'blue' } | null {
  if (!s) return null
  return { text: s === 'normal' ? normal : reduced, cls: s === 'normal' ? normalCls : 'reduced' }
}

export function ReportSectionsA({ assessment, patient }: Props) {
  const gender = patient?.gender ?? 'M'
  const v = obj(assessment.vitals)
  const bc = obj(assessment.bodyComposition)
  const ms = obj(assessment.muscleStrength)
  const ba = obj(assessment.balanceAssessment)

  const bpI = interpBP(v.bloodPressureSystolic, v.bloodPressureDiastolic)
  const hrI = interpRange(v.heartRate, 60, 100)
  const rrI = interpRange(v.respiratoryRate, 12, 20)
  const spo2I = interpRange(v.oxygenSaturation, 95, 100)
  const tempI = interpRange(v.temperature, 35, 37.5)
  const almiI = ci(getALMIStatus(bc.almi, gender))
  const paI = ci(getPhaseAngleStatus(bc.phaseAngle, gender))
  const csI = ci(getChairStandStatus(ms.chairStandTime))

  const hgAge = patient?.birthDate ? calculateAge(patient.birthDate) : -1
  const hgLeft = ms.handgripLeft as number | undefined
  const hgRight = ms.handgripRight as number | undefined
  const hgMax = ms.handgripMax as number | undefined
  const leftR = getHandgripPercentile(gender, hgAge, hgLeft)
  const rightR = getHandgripPercentile(gender, hgAge, hgRight)
  const maxR = getHandgripPercentile(gender, hgAge, hgMax)
  const sexLabel = gender === 'M' ? 'homem' : 'mulher'
  const hasNormative = leftR.p5Value != null && leftR.ageGroup != null
  const bothNormal = leftR.interpretation === 'Normal' && rightR.interpretation === 'Normal'
  const anyReduced =
    leftR.interpretation === 'Força Reduzida' || rightR.interpretation === 'Força Reduzida'
  const clinicalParagraph = !hasNormative
    ? 'Data de nascimento não cadastrada. Não foi possível determinar os valores normativos para a faixa etária.'
    : bothNormal
      ? `Os valores medidos em ambas as mãos encontram-se acima do ponto de corte normativo (P5 igual a ${leftR.p5Value} kg para ${sexLabel} de ${leftR.ageGroup}), configurando força muscular preservada para a faixa etária e o sexo.`
      : anyReduced
        ? `O valor medido encontra-se abaixo do ponto de corte normativo (P5 igual a ${leftR.p5Value} kg para ${sexLabel} de ${leftR.ageGroup}), sugerindo força reduzida para a faixa etária e o sexo.`
        : null
  const tugI = ci(getTUGStatus(ba.tugSimple), 'Normal', 'Alterada', 'blue')
  const sppbTotal = getSPPBTotal(ba.sppbBalance, ba.sppbGait, ba.sppbChair)
  const sppbI = ci(getSPPBStatus(sppbTotal))

  return (
    <>
      <SectionBlock number={1} title="Sinais Vitais">
        {hasData(v) ? (
          <ReportTable
            rows={[
              {
                label: 'Pressão Arterial',
                value:
                  v.bloodPressureSystolic != null && v.bloodPressureDiastolic != null
                    ? `${v.bloodPressureSystolic}/${v.bloodPressureDiastolic} mmHg`
                    : '-',
                ref: '< 140/90 mmHg',
                interp: bpI?.text,
                interpClass: bpI?.cls,
              },
              {
                label: 'Frequência Cardíaca',
                value: fmt(v.heartRate, 'bpm'),
                ref: '60-100 bpm',
                interp: hrI?.text,
                interpClass: hrI?.cls,
              },
              {
                label: 'Frequência Respiratória',
                value: fmt(v.respiratoryRate, 'irpm'),
                ref: '12-20 irpm',
                interp: rrI?.text,
                interpClass: rrI?.cls,
              },
              {
                label: 'Saturação de O₂',
                value: fmt(v.oxygenSaturation, '%'),
                ref: '≥ 95%',
                interp: spo2I?.text,
                interpClass: spo2I?.cls,
              },
              {
                label: 'Temperatura',
                value: fmt(v.temperature, '°C'),
                ref: '35-37.5 °C',
                interp: tempI?.text,
                interpClass: tempI?.cls,
              },
            ]}
          />
        ) : (
          <EmptySection />
        )}
      </SectionBlock>

      <SectionBlock number={2} title="Composição Corporal">
        {hasData(bc) ? (
          <ReportTable
            rows={[
              { label: 'Massa Magra', value: fmt(bc.leanMass, 'kg') },
              { label: 'Massa Muscular Esquelética', value: fmt(bc.skeletalMuscleMass, 'kg') },
              { label: 'Massa Gordura', value: fmt(bc.fatMass, 'kg') },
              { label: 'Percentual de Gordura', value: fmt(bc.fatPercentage, '%') },
              { label: 'Massa Muscular Apendicular', value: fmt(bc.appendicularMuscleMass, 'kg') },
              {
                label: 'ALMI',
                value: fmt(bc.almi, 'kg/m²'),
                ref: gender === 'M' ? '≥ 7.0 kg/m²' : '≥ 6.0 kg/m²',
                interp: almiI?.text,
                interpClass: almiI?.cls,
              },
              {
                label: 'Ângulo de Fase',
                value: fmt(bc.phaseAngle, '°'),
                ref: gender === 'M' ? '≥ 5.0°' : '≥ 4.6°',
                interp: paI?.text,
                interpClass: paI?.cls,
              },
              { label: 'Água Corporal Total', value: fmt(bc.totalBodyWater, 'L') },
              { label: 'Taxa Metabólica Basal', value: fmt(bc.basalMetabolicRate, 'kcal') },
            ]}
          />
        ) : (
          <EmptySection />
        )}
      </SectionBlock>

      <SectionBlock number={3} title="Força Muscular">
        {hasData(ms) ? (
          <>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                <span className="report-subsection-marker shrink-0" />
                Força de Preensão Manual (Handgrip)
              </h4>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  1. Valores Medidos
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border border-border/60 rounded-md p-3 break-inside-avoid">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Handgrip Esquerdo</span>
                      <span className="text-sm font-bold tabular-nums">
                        {hgLeft != null ? `${hgLeft} kg` : 'Não registrado'}
                      </span>
                    </div>
                    {leftR.interpretation && (
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 text-xs font-bold',
                          leftR.interpretation === 'Normal'
                            ? 'clinical-badge-normal'
                            : 'clinical-badge-moderate',
                        )}
                      >
                        {leftR.interpretation}
                      </span>
                    )}
                  </div>
                  <div className="border border-border/60 rounded-md p-3 break-inside-avoid">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Handgrip Direito</span>
                      <span className="text-sm font-bold tabular-nums">
                        {hgRight != null ? `${hgRight} kg` : 'Não registrado'}
                      </span>
                    </div>
                    {rightR.interpretation && (
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 text-xs font-bold',
                          rightR.interpretation === 'Normal'
                            ? 'clinical-badge-normal'
                            : 'clinical-badge-moderate',
                        )}
                      >
                        {rightR.interpretation}
                      </span>
                    )}
                  </div>
                </div>
                {maxR.percentile != null && (
                  <p className="text-sm mt-2">
                    Percentil:{' '}
                    <span className="font-semibold tabular-nums">{maxR.percentile}º</span>
                  </p>
                )}
                {clinicalParagraph && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {clinicalParagraph}
                  </p>
                )}
              </div>
              <div className="pt-4 border-t border-border/40 break-inside-avoid">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  2. Rastreio de Sarcopenia (EWGSOP2)
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="text-sm">
                    Valor medido:{' '}
                    <strong className="tabular-nums">
                      {hgMax != null ? `${hgMax} kg` : 'Não registrado'}
                    </strong>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Limite diagnóstico: {gender === 'M' ? '27 kg (homens)' : '16 kg (mulheres)'}
                  </span>
                  {maxR.ewgsop2Status && (
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 text-xs font-bold',
                        maxR.ewgsop2Status.includes('Sugestivo')
                          ? 'clinical-badge-moderate'
                          : 'clinical-badge-normal',
                      )}
                    >
                      {maxR.ewgsop2Status}
                    </span>
                  )}
                </div>
              </div>
              <div className="pt-3 border-t border-border/20 break-inside-avoid">
                <p className="text-[0.6875rem] text-muted-foreground">
                  1. Dados normativos baseados em revisão sistemática de 2,4 milhões de adultos de
                  20 a 100+ anos de 69 países (ScienceDirect, 2024).
                </p>
                <p className="text-[0.6875rem] text-muted-foreground">
                  2. Pontos de corte (27 kg homens, 16 kg mulheres) do consenso EWGSOP2
                  (Cruz-Jentoft et al., 2019).
                </p>
              </div>
            </div>
            <SubSection title="Levantar da Cadeira (5 repetições)">
              <ReportTable
                rows={[
                  {
                    label: 'Tempo',
                    value: fmt(ms.chairStandTime, 's'),
                    ref: '≤ 15 s',
                    interp: csI?.text,
                    interpClass: csI?.cls,
                  },
                ]}
              />
            </SubSection>
          </>
        ) : (
          <EmptySection />
        )}
      </SectionBlock>

      <SectionBlock number={4} title="Equilíbrio e Risco de Quedas">
        {hasData(ba) ? (
          <>
            <SubSection title="Timed Up & Go (TUG)">
              <ReportTable
                rows={[
                  {
                    label: 'TUG Simples',
                    value: fmt(ba.tugSimple, 's'),
                    ref: '≤ 12 s',
                    interp: tugI?.text,
                    interpClass: tugI?.cls,
                  },
                  { label: 'TUG Dupla Tarefa', value: fmt(ba.tugDualTask, 's') },
                ]}
              />
            </SubSection>
            <SubSection title="Short Physical Performance Battery (SPPB)">
              <ReportTable
                rows={[
                  { label: 'Equilíbrio', value: fmt(ba.sppbBalance, 'pts') },
                  { label: 'Marcha', value: fmt(ba.sppbGait, 'pts') },
                  { label: 'Levantar da Cadeira', value: fmt(ba.sppbChair, 'pts') },
                  {
                    label: 'Total',
                    value: fmt(sppbTotal, 'pts'),
                    ref: '≥ 10 pts',
                    interp: sppbI?.text,
                    interpClass: sppbI?.cls,
                  },
                ]}
              />
            </SubSection>
            <SubSection title="Estabilometria">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border rounded p-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Olhos Abertos
                  </p>
                  <p className="text-sm">{ba.stabilometryEyesOpen || '-'}</p>
                </div>
                <div className="border rounded p-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Olhos Fechados
                  </p>
                  <p className="text-sm">{ba.stabilometryEyesClosed || '-'}</p>
                </div>
              </div>
            </SubSection>
          </>
        ) : (
          <EmptySection />
        )}
      </SectionBlock>
    </>
  )
}
