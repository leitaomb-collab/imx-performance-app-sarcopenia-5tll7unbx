import { calculateAge, calculateIMC, formatGender, formatDateBR } from '@/lib/patient-utils'
import { getDiagnosisBanner } from '@/lib/summary-utils'
import { cn } from '@/lib/utils'
import type { Patient, User } from '@/types'

interface SummaryHeaderProps {
  patient: Patient
  assessment: Record<string, any>
  evaluator?: User | null
}

export function SummaryHeader({ patient, assessment }: SummaryHeaderProps) {
  const age = calculateAge(patient.birthDate)
  const heightM = (patient.height ?? 0) > 3 ? (patient.height ?? 0) / 100 : (patient.height ?? 0)
  const imc = calculateIMC(patient.weight ?? 0, heightM)
  const banner = getDiagnosisBanner(assessment.finalDiagnosis ?? '')

  const idItems = [
    { text: patient.name, bold: true },
    { text: `${age} anos` },
    { text: formatGender(patient.gender) },
    { text: patient.weight ? `${patient.weight} kg` : '-' },
    { text: patient.height ? `${patient.height} cm` : '-' },
    { text: `IMC: ${imc || '-'}` },
    { text: formatDateBR(assessment.assessmentDate) },
  ]

  return (
    <>
      <header className="text-center mb-3 break-inside-avoid">
        <h1 className="summary-header-title text-xl font-bold text-primary">IEMEX Performance</h1>
        <p className="summary-header-subtitle text-sm font-semibold text-muted-foreground">
          Sumário Executivo da Avaliação Funcional
        </p>
        <p className="summary-header-protocol text-xs text-muted-foreground">
          Protocolo de Sarcopenia e Risco de Quedas
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs mb-3 break-inside-avoid">
        {idItems.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2">
            {i > 0 && <span className="text-muted-foreground">|</span>}
            <span className={cn(item.bold && 'font-bold')}>{item.text}</span>
          </span>
        ))}
      </div>

      <div
        className={cn(
          'summary-diagnosis-banner rounded-md py-2 px-4 text-center mb-4 break-inside-avoid',
          banner.bgClass,
          banner.textClass,
        )}
      >
        <span className="font-semibold text-sm">Diagnóstico: {banner.label}</span>
      </div>
    </>
  )
}
