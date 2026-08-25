import { SectionBlock } from './ReportTable'
import { EvolutionCharts } from '@/components/patients/EvolutionCharts'
import type { Assessment, Patient } from '@/types'
import { PlaceholderText } from './ReportTable'

interface Props {
  historicalAssessments: Assessment[] | null
  patient: Patient | null
}

export function Section7Trends({ historicalAssessments, patient }: Props) {
  const hasData = historicalAssessments && historicalAssessments.length > 0

  return (
    <div aria-label="7. Tendências Históricas" className="animate-fade-in">
      <SectionBlock number={7} title="Tendências Históricas">
        {!hasData ? (
          <div className="bg-report-paper-soft rounded-[10px] py-4">
            <PlaceholderText />
          </div>
        ) : historicalAssessments.length === 1 ? (
          <div className="bg-report-paper-soft rounded-[10px] p-4">
            <div className="flex flex-col items-center py-8 gap-3">
              <p className="text-report-ink-soft text-sm text-center">
                Sem histórico de avaliações anteriores para comparação
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-report-paper-soft rounded-[10px] p-4">
            <EvolutionCharts assessments={historicalAssessments} patient={patient as Patient} />
          </div>
        )}
      </SectionBlock>
    </div>
  )
}
