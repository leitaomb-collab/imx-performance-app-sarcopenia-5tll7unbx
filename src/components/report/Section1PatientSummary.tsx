import { ReportTable, SectionBlock, type ReportRow } from './ReportTable'
import { obj, fmt, hasData, interpRange, interpBP } from '@/lib/report-utils'
import { getSarcFTotal, getSarcCalFTotal, getSarcopeniaRisk } from '@/lib/clinical-utils'
import { calculateAge, formatGender, formatDateBR, getDiagnosisInfo } from '@/lib/patient-utils'
import { cn } from '@/lib/utils'
import type { Patient } from '@/types'

interface Props {
  assessment: Record<string, unknown>
  patient: Patient | null
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

  const riskPillCls = (r: string | null) => {
    if (!r) return ''
    return r === 'baixo'
      ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
  }

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
        <div className="flex flex-wrap gap-3 mb-4 break-inside-avoid">
          <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm">
            {patient?.name ?? '-'}
          </span>
          {age != null && (
            <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm">
              {age} anos
            </span>
          )}
          {patient && (
            <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm">
              {formatGender(patient.gender)}
            </span>
          )}
          <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm">
            {formatDateBR(assessment.assessmentDate as string)}
          </span>
        </div>

        {hasScreening ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 break-inside-avoid">
            <div className="border border-border/60 rounded-lg p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">SARC-F</p>
              <p className="text-2xl font-bold tabular-nums">{fmt(sarcFTotal)}</p>
              {fRisk && (
                <span
                  className={cn(
                    'mt-2 inline-flex items-center px-3 py-1 text-xs font-bold rounded-full',
                    riskPillCls(fRisk),
                  )}
                >
                  {riskLabel(fRisk)}
                </span>
              )}
            </div>
            <div className="border border-border/60 rounded-lg p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                SARC-CalF
              </p>
              <p className="text-2xl font-bold tabular-nums">{fmt(sarcCalFTotal)}</p>
              {cfRisk && (
                <span
                  className={cn(
                    'mt-2 inline-flex items-center px-3 py-1 text-xs font-bold rounded-full',
                    riskPillCls(cfRisk),
                  )}
                >
                  {riskLabel(cfRisk)}
                </span>
              )}
            </div>
          </div>
        ) : (
          <PlaceholderText />
        )}

        {hasVitals ? <ReportTable rows={vitalsRows} /> : <PlaceholderText />}

        <div className="mt-4 bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm leading-relaxed break-inside-avoid">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
            Resumo Executivo
          </p>
          <p>{execSummary}</p>
        </div>
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
