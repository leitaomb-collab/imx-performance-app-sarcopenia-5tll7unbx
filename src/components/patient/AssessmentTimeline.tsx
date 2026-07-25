import { memo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, Plus, Trash2 } from 'lucide-react'
import { formatDateBR, getDiagnosisInfo } from '@/lib/patient-utils'
import { useTransitionNavigate } from '@/hooks/use-transition-navigate'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'
import type { Assessment } from '@/types'

interface AssessmentTimelineProps {
  assessments: Assessment[]
  patientId: string
  onDelete?: (assessment: Assessment) => void
}

function AssessmentTimelineBase({ assessments, patientId, onDelete }: AssessmentTimelineProps) {
  const prefersReducedMotion = useReducedMotion()
  const transitionNavigate = useTransitionNavigate()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (assessments.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 gap-4">
        <ClipboardList className="h-10 w-10 text-muted-foreground" />
        <p className="text-lg font-medium">Nenhuma avaliação registrada</p>
        <Button className="h-11 tactile" asChild>
          <Link to={`/avaliacao/nova?patientId=${patientId}`} viewTransition>
            <Plus className="mr-2 h-4 w-4" /> Nova Avaliação
          </Link>
        </Button>
      </div>
    )
  }

  const sorted = [...assessments].sort(
    (a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime(),
  )

  return (
    <div className="relative space-y-2">
      <div className="absolute left-[6px] top-0 bottom-0 w-0.5 bg-border" aria-hidden="true" />
      {sorted.map((assessment, index) => {
        const isCompleted = assessment.status === 'concluida'
        const diagnosisInfo = isCompleted ? getDiagnosisInfo(assessment.finalDiagnosis) : null
        return (
          <div
            key={assessment.id}
            onClick={() => transitionNavigate(`/avaliacao/${assessment.id}`)}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                transitionNavigate(`/avaliacao/${assessment.id}`)
              }
            }}
            className={cn(
              'relative flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              !prefersReducedMotion && mounted && 'animate-fade-in',
            )}
            style={
              !prefersReducedMotion
                ? { animationDelay: `${index * 80}ms`, animationFillMode: 'both' }
                : undefined
            }
          >
            <span
              className={cn(
                'relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-background',
                isCompleted ? 'bg-green-500' : 'bg-amber-500',
              )}
              aria-hidden="true"
            />
            <div className="flex-1 space-y-1.5">
              <p className="font-semibold text-sm sm:text-base">
                {formatDateBR(assessment.assessmentDate)}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={cn(
                    isCompleted
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20',
                  )}
                >
                  {isCompleted ? 'Concluída' : 'Rascunho'}
                </Badge>
                {diagnosisInfo && (
                  <span className="text-sm text-muted-foreground">{diagnosisInfo.label}</span>
                )}
              </div>
            </div>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 tactile"
                aria-label="Excluir avaliação"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(assessment)
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}

export const AssessmentTimeline = memo(AssessmentTimelineBase)
