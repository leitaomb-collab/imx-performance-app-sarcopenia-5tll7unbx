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
          <p className="text-sm text-muted-foreground py-3 italic">
            Dados não coletados nesta avaliação
          </p>
        ) : historicalAssessments.length === 1 ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <p className="text-sm text-muted-foreground text-center italic">
              Sem histórico de avaliações anteriores para comparação
            </p>
          </div>
        ) : (
          <EvolutionCharts assessments={historicalAssessments} patient={patient as Patient} />
        )}
      </SectionBlock>
    </div>
  )
}
