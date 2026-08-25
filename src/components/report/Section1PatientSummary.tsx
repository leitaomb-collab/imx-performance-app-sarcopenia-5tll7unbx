import { ReportTable, SectionBlock, type ReportRow } from './ReportTable'
import { obj, fmt, hasData, interpRange, interpBP } from '@/lib/report-utils'
import { getSarcFTotal, getSarcCalFTotal, getSarcopeniaRisk } from '@/lib/clinical-utils'
import { calculateAge, formatGender, formatDateBR, getDiagnosisInfo } from '@/lib/patient-utils'
import type { Patient } from '@/types'
import { RadarProfile } from '@/components/report/RadarProfile'
import { Eyebrow, ReadingCard, PlaceholderText, type Tone } from './ReportTable'

interface Props {
  assessment: Record<string, unknown>
  patient: Patient | null
  allAssessments?: Record<string, unknown>[]
}

export function Section1PatientSummary({ assessment, patient }: Props) {
  const ss = obj(assessment.sarcopeniaScreening)
  const v = obj(assessment.vitals)
  const gender = patient?.gender ?? 'M'

  const sarcFTotal = getSarcFTotal([
    ss.strength,
    ss.assistanceWalking,
    ss.riseChair,
    ss.climbStairs,
    ss.falls,
  ])
  const sarcCalFTotal = getSarcCalFTotal(sarcFTotal, ss.calfCircumference, gender)
  const fRisk = getSarcopeniaRisk(sarcFTotal)
  const cfRisk = getSarcopeniaRisk(sarcCalFTotal)

  const hasScreening = hasData(ss)
  const hasVitals = hasData(v)

  const age = patient?.birthDate ? calculateAge(patient.birthDate) : null
  const diagInfo = getDiagnosisInfo(assessment.finalDiagnosis as string)

  const bpI = interpBP(v.bloodPressureSystolic, v.bloodPressureDiastolic)
  const hrI = interpRange(v.heartRate, 60, 100)
  const rrI = interpRange(v.respiratoryRate, 12, 20)
  const spo2I = interpRange(v.oxygenSaturation, 95, 100)
  const tempI = interpRange(v.temperature, 35, 37.5)

  const vitalsRows: ReportRow[] = [
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
  ]

  const riskLabel = (r: string | null) => {
    if (!r) return null
    return r === 'baixo' ? 'Baixo risco' : 'Risco elevado'
  }
  const riskTone = (r: string | null): Tone =>
    r == null ? 'na' : r === 'baixo' ? 'normal' : 'watch'

  const execSummary = diagInfo
    ? `Status diagnóstico: ${diagInfo.label}. ` +
      (fRisk && fRisk !== 'baixo'
        ? 'Paciente apresenta risco elevado no rastreio SARC-F. '
        : 'Rastreio SARC-F sem risco elevado. ') +
      (assessment.status === 'concluida' ? 'Avaliação concluída.' : 'Avaliação em rascunho.')
    : 'Status diagnóstico não definido.'

  return (
    <div aria-label="1. Resumo do Paciente" className="animate-fade-in">
      <SectionBlock number={1} title="Resumo do Paciente">
        <div className="flex flex-wrap gap-2 mb-4 break-inside-avoid">
          <span className="bg-report-paper-soft text-report-ink-soft rounded-full px-3 py-1 text-xs font-report-mono">
            {patient?.name ?? '—'}
          </span>
          {age != null && (
            <span className="bg-report-paper-soft text-report-ink-soft rounded-full px-3 py-1 text-xs font-report-mono">
              {age} anos
            </span>
          )}
          {patient && (
            <span className="bg-report-paper-soft text-report-ink-soft rounded-full px-3 py-1 text-xs font-report-mono">
              {formatGender(patient.gender)}
            </span>
          )}
          <span className="bg-report-paper-soft text-report-ink-soft rounded-full px-3 py-1 text-xs font-report-mono">
            {formatDateBR(assessment.assessmentDate as string)}
          </span>
        </div>

        {hasScreening ? (
          <div className="flex flex-wrap gap-3 mb-4 break-inside-avoid">
            <ReadingCard
              label="SARC-F"
              value={fmt(sarcFTotal)}
              refText={fRisk ? riskLabel(fRisk)! : 'Não avaliado'}
              tone={riskTone(fRisk)}
            />
            <ReadingCard
              label="SARC-CalF"
              value={fmt(sarcCalFTotal)}
              refText={cfRisk ? riskLabel(cfRisk)! : 'Não avaliado'}
              tone={riskTone(cfRisk)}
            />
          </div>
        ) : (
          <PlaceholderText />
        )}

        <RadarProfile assessment={assessment} patient={patient} />

        {hasVitals ? <ReportTable rows={vitalsRows} /> : <PlaceholderText />}

        <div className="mt-4 bg-report-paper-soft border-l-[3px] border-report-ink rounded-r-[8px] p-4 text-sm leading-relaxed break-inside-avoid">
          <Eyebrow>Resumo Executivo</Eyebrow>
          <p className="text-report-ink mt-1.5">{execSummary}</p>
        </div>
      </SectionBlock>
    </div>
  )
}
