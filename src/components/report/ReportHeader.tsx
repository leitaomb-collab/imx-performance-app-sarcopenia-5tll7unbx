import { Badge } from '@/components/ui/badge'
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

  return (
    <header className="report-header break-inside-avoid mb-6">
      <div className="report-institution-header p-6 rounded-t-lg flex flex-col md:flex-row items-center md:items-start gap-4">
        <div className="shrink-0">
          <Logo size="md" />
        </div>
        <div className="text-center md:text-left">
          <h1 className="report-institution-name">IEMEX Performance</h1>
          <p className="report-institution-subtitle">
            Relatório de Avaliação Funcional - Protocolo de Monitoramento de Sarcopenia
          </p>
          <p className="report-institution-protocol">
            Avaliação funcional e monitoramento de sarcopenia
          </p>
        </div>
      </div>
      <div className="border border-t-0 border-border rounded-b-lg p-6 space-y-4">
        <div className="report-patient-id grid grid-cols-1 md:grid-cols-2 gap-4 p-4 text-sm">
          <Field label="Nome" value={patient.name} />
          <Field label="Data de Nascimento" value={formatDateBR(patient.birthDate)} />
          <Field label="Idade" value={`${age} anos`} />
          <Field label="Gênero" value={formatGender(patient.gender)} />
          <Field label="Peso" value={patient.weight ? `${patient.weight} kg` : '-'} />
          <Field label="Estatura" value={heightDisplay} />
          <Field label="IMC" value={imc ? `${imc} (${imcCategory})` : '-'} />
          <Field
            label="Medicamentos de Uso Contínuo"
            value={stripHtml(patient.chronicMedications) || '-'}
          />
        </div>
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border/60 text-sm">
          <Field label="Data da Avaliação" value={formatDateBR(assessment.assessmentDate)} />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Status:
            </span>
            <Badge
              className={`report-print-badge ${
                assessment.status === 'concluida'
                  ? 'clinical-badge-normal'
                  : 'clinical-badge-moderate'
              }`}
            >
              {assessment.status === 'concluida' ? 'Concluída' : 'Rascunho'}
            </Badge>
          </div>
          {diagInfo && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Diagnóstico:
              </span>
              <Badge className={`report-print-badge ${diagInfo.className}`}>{diagInfo.label}</Badge>
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
      <dt className="report-field-label">{label}</dt>
      <dd className="report-field-value">{value}</dd>
    </div>
  )
}
