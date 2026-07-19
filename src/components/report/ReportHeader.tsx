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
      <div className="bg-primary text-primary-foreground p-6 rounded-t-lg">
        <h1 className="text-2xl font-bold">IMX Performance</h1>
        <p className="text-sm opacity-90 mt-1">
          Relatório de Avaliação Funcional e Nutricional Geriátrica
        </p>
        <p className="text-xs opacity-75 mt-0.5">
          Protocolo de Monitoramento de Sarcopenia e Risco de Quedas
        </p>
      </div>
      <div className="border border-t-0 border-border rounded-b-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
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
              className={
                assessment.status === 'concluida'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-yellow-500 hover:bg-yellow-600'
              }
            >
              {assessment.status === 'concluida' ? 'Concluída' : 'Rascunho'}
            </Badge>
          </div>
          {diagInfo && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Diagnóstico:
              </span>
              <Badge className={diagInfo.className}>{diagInfo.label}</Badge>
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
      <dt className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</dt>
      <dd className="font-medium mt-0.5">{value}</dd>
    </div>
  )
}
