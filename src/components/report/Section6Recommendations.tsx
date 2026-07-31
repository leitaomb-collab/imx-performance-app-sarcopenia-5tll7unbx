import { SectionBlock } from './ReportTable'
import { RichText } from '@/components/patients/RichText'
import { formatDateBR } from '@/lib/patient-utils'
import { Calendar } from 'lucide-react'

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
        <div className="space-y-6">
          <div className="reco-block bg-muted/40 rounded-lg p-4 break-inside-avoid">
            <h4 className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
              Recomendações de Exercício
            </h4>
            {exercise && exercise.trim() ? (
              <RichText content={exercise} emptyMsg="" />
            ) : (
              <p className="text-muted-foreground italic">Não definido</p>
            )}
          </div>

          <div className="reco-block bg-muted/40 rounded-lg p-4 break-inside-avoid">
            <h4 className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
              Recomendações Nutricionais
            </h4>
            {nutrition && nutrition.trim() ? (
              <RichText content={nutrition} emptyMsg="" />
            ) : (
              <p className="text-muted-foreground italic">Não definido</p>
            )}
          </div>

          <div className="reco-block break-inside-avoid">
            <h4 className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
              Próxima reavaliação sugerida
            </h4>
            {reassessmentDate ? (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{formatDateBR(reassessmentDate)}</span>
              </div>
            ) : (
              <p className="text-muted-foreground italic">Não definido</p>
            )}
          </div>
        </div>
      </SectionBlock>
    </div>
  )
}
