import {
  calculateAge,
  calculateIMC,
  getIMCCategory,
  formatGender,
  formatDateBR,
  getDiagnosisInfo,
} from '@/lib/patient-utils'
import { stripHtml } from '@/lib/report-utils'
import type { Patient, User } from '@/types'
import { Logo } from '@/components/Logo'
import { Eyebrow, StatusPill } from './ReportTable'

interface ReportHeaderProps {
  patient: Patient
  assessment: Record<string, any>
  evaluator?: User | null
}

export function ReportHeader({ patient, assessment, evaluator }: ReportHeaderProps) {
  const age = calculateAge(patient.birthDate)
  const heightM = (patient.height ?? 0) > 3 ? (patient.height ?? 0) / 100 : (patient.height ?? 0)
  const imc = calculateIMC(patient.weight ?? 0, heightM)
  const imcCategory = imc ? getIMCCategory(imc) : '-'
  const heightDisplay = patient.height
    ? patient.height > 3
      ? `${patient.height} cm`
      : `${patient.height} m`
    : '-'
  const diagInfo = getDiagnosisInfo(assessment.finalDiagnosis)
  const diagTone =
    assessment.finalDiagnosis === 'sem_sarcopenia'
      ? 'normal'
      : assessment.finalDiagnosis === 'sarcopenia'
        ? 'watch'
        : assessment.finalDiagnosis === 'sarcopenia_grave'
          ? 'low'
          : 'na'

  return (
    <header className="break-inside-avoid mb-6 rounded-[14px] border border-report-line overflow-hidden">
      <div className="p-6 flex flex-col md:flex-row items-center md:items-start gap-4 border-b border-report-line bg-report-paper-soft">
        <div className="shrink-0">
          <Logo size="md" />
        </div>
        <div className="text-center md:text-left">
          <Eyebrow>IEMEX Performance · Avaliação funcional</Eyebrow>
          <h1 className="font-report-display text-xl font-semibold text-report-ink mt-1">
            Relatório de Avaliação Funcional
          </h1>
          <p className="text-[0.8rem] text-report-ink-soft mt-0.5">
            Protocolo de monitoramento de sarcopenia
          </p>
        </div>
      </div>
      <div className="p-6 space-y-4 bg-report-paper">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <Field label="Nome" value={patient.name} />
          <Field label="Data de Nascimento" value={formatDateBR(patient.birthDate)} />
          <Field label="Idade" value={`${age} anos`} />
          <Field label="Gênero" value={formatGender(patient.gender)} />
          <Field label="Peso" value={patient.weight ? `${patient.weight} kg` : '—'} />
          <Field label="Estatura" value={heightDisplay} />
          <Field label="IMC" value={imc ? `${imc} (${imcCategory})` : '—'} />
          <Field
            label="Medicamentos de Uso Contínuo"
            value={stripHtml(patient.chronicMedications) || '—'}
          />
        </div>
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-report-line text-sm">
          <Field label="Data da Avaliação" value={formatDateBR(assessment.assessmentDate)} />
          <div className="flex items-center gap-2">
            <Eyebrow>Status</Eyebrow>
            <StatusPill
              tone={assessment.status === 'concluida' ? 'normal' : 'watch'}
              text={assessment.status === 'concluida' ? 'Concluída' : 'Rascunho'}
            />
          </div>
          {diagInfo && (
            <div className="flex items-center gap-2">
              <Eyebrow>Diagnóstico</Eyebrow>
              <StatusPill tone={diagTone} text={diagInfo.label} />
            </div>
          )}
          {evaluator && <Field label="Avaliador" value={evaluator.name} />}
        </div>
      </div>
    </header>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-report-mono text-[0.62rem] tracking-[0.04em] uppercase text-report-ink-soft">
        {label}
      </dt>
      <dd className="text-report-ink mt-0.5">{value}</dd>
    </div>
  )
}
