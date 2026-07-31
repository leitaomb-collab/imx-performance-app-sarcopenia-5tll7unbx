import { SectionBlock } from './ReportTable'
import { EvolutionCharts } from '@/components/patients/EvolutionCharts'
import type { Assessment, Patient } from '@/types'

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
          <div className="bg-muted/30 rounded">
            <p className="text-muted-foreground text-sm italic py-4 text-center">
              Dados não coletados nesta avaliação
            </p>
          </div>
        ) : historicalAssessments.length === 1 ? (
          <div className="trends-container bg-muted/20 rounded-lg p-4">
            <div className="flex flex-col items-center py-8 gap-3">
              <p className="text-muted-foreground text-sm text-center">
                Sem histórico de avaliações anteriores para comparação
              </p>
            </div>
          </div>
        ) : (
          <div className="trends-container bg-muted/20 rounded-lg p-4">
            <EvolutionCharts assessments={historicalAssessments} patient={patient as Patient} />
          </div>
        )}
      </SectionBlock>
    </div>
  )
}
