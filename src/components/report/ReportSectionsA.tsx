import { ReportTable, SectionBlock, SubSection, EmptySection } from './ReportTable'
import { obj, fmt, hasData, interpRange, interpBP } from '@/lib/report-utils'
import {
  getALMIStatus,
  getPhaseAngleStatus,
  getHandgripStatus,
  getChairStandStatus,
  getTUGStatus,
  getSPPBStatus,
  getSPPBTotal,
  type ClinicalStatus,
} from '@/lib/clinical-utils'
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
  const hgI = ci(getHandgripStatus(ms.handgripMax, gender))
  const csI = ci(getChairStandStatus(ms.chairStandTime))
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
            <SubSection title="Handgrip (Preensão Manual)">
              <ReportTable
                rows={[
                  { label: 'Força Direita', value: fmt(ms.handgripRight, 'kgf') },
                  { label: 'Força Esquerda', value: fmt(ms.handgripLeft, 'kgf') },
                  {
                    label: 'Força Máxima',
                    value: fmt(ms.handgripMax, 'kgf'),
                    ref: gender === 'M' ? '≥ 27 kgf' : '≥ 16 kgf',
                    interp: hgI?.text,
                    interpClass: hgI?.cls,
                  },
                  { label: 'Percentil', value: fmt(ms.handgripPercentile, '%') },
                ]}
              />
            </SubSection>
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
