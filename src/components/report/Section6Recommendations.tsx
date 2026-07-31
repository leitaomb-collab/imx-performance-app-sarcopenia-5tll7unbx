import { SectionBlock } from './ReportTable'
import { RichText } from '@/components/patients/RichText'
import { formatDateBR } from '@/lib/patient-utils'

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
        <div className="space-y-4">
          <div className="border border-border/60 rounded-lg p-4 break-inside-avoid">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Recomendações de Exercício
            </h4>
            {exercise && exercise.trim() ? (
              <RichText content={exercise} emptyMsg="" />
            ) : (
              <p className="text-sm text-muted-foreground italic">Não definido</p>
            )}
          </div>

          <div className="border border-border/60 rounded-lg p-4 break-inside-avoid">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Recomendações Nutricionais
            </h4>
            {nutrition && nutrition.trim() ? (
              <RichText content={nutrition} emptyMsg="" />
            ) : (
              <p className="text-sm text-muted-foreground italic">Não definido</p>
            )}
          </div>

          <div className="border border-border/60 rounded-lg p-4 break-inside-avoid">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Próxima reavaliação sugerida
            </h4>
            {reassessmentDate ? (
              <p className="text-sm font-semibold">{formatDateBR(reassessmentDate)}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Não definido</p>
            )}
          </div>
        </div>
      </SectionBlock>
    </div>
  )
}
