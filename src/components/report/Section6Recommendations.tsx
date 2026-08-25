import { SectionBlock } from './ReportTable'
import { RichText } from '@/components/patients/RichText'
import { formatDateBR } from '@/lib/patient-utils'
import { Calendar } from 'lucide-react'
import { RecommendationCard } from './ReportTable'

interface Props {
  assessment: Record<string, unknown>
}

export function Section6Recommendations({ assessment }: Props) {
  const exercise = assessment.exerciseRecommendations as string | undefined
  const nutrition = assessment.nutritionRecommendations as string | undefined
  const reassessmentDate = assessment.reassessmentDate as string | undefined

  return (
    <div aria-label="6. Recomendações" className="animate-fade-in">
      <SectionBlock number={6} title="Recomendações">
        <div className="flex flex-wrap gap-3">
          <RecommendationCard title="Recomendações de Exercício">
            {exercise && exercise.trim() ? (
              <RichText content={exercise} emptyMsg="" />
            ) : (
              <p className="text-report-ink-soft italic">Não definido</p>
            )}
          </RecommendationCard>

          <RecommendationCard title="Recomendações Nutricionais">
            {nutrition && nutrition.trim() ? (
              <RichText content={nutrition} emptyMsg="" />
            ) : (
              <p className="text-report-ink-soft italic">Não definido</p>
            )}
          </RecommendationCard>

          <RecommendationCard title="Próxima Reavaliação Sugerida">
            {reassessmentDate ? (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-report-ink-soft" />
                <span className="font-report-mono font-semibold text-report-ink">
                  {formatDateBR(reassessmentDate)}
                </span>
              </div>
            ) : (
              <p className="text-report-ink-soft italic">Não definido</p>
            )}
          </RecommendationCard>
        </div>
      </SectionBlock>
    </div>
  )
}
