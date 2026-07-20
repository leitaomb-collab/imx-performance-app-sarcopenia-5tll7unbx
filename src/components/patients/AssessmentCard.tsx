import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Trash2, ClipboardList } from 'lucide-react'
import { formatDateBR, getDiagnosisInfo } from '@/lib/patient-utils'
import { cn } from '@/lib/utils'
import type { Assessment } from '@/types'

interface AssessmentCardProps {
  assessment: Assessment
  onDelete: (assessment: Assessment) => void
  deletingId?: string | null
}

function AssessmentCardBase({ assessment, onDelete, deletingId }: AssessmentCardProps) {
  const isCompleted = assessment.status === 'concluida'
  const diagnosisInfo = isCompleted ? getDiagnosisInfo(assessment.finalDiagnosis) : null
  const isDeleting = deletingId === assessment.id

  return (
    <Card className={cn('transition-all duration-200', isDeleting && 'opacity-0 scale-95')}>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <p
            className="font-semibold text-sm sm:text-base"
            style={{ viewTransitionName: `assessment-date-${assessment.id}` }}
          >
            {formatDateBR(assessment.assessmentDate)}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge
              className={cn(
                isCompleted
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20'
                  : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20',
              )}
            >
              {isCompleted ? 'Concluída' : 'Rascunho'}
            </Badge>
            {diagnosisInfo && (
              <Badge className={diagnosisInfo.className}>{diagnosisInfo.label}</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-11 tactile" asChild>
            <Link to={`/avaliacao/${assessment.id}`} viewTransition>
              <ClipboardList className="mr-1 h-4 w-4" /> Ver Avaliação
            </Link>
          </Button>
          {isCompleted && (
            <Button variant="outline" size="sm" className="h-11 tactile" asChild>
              <Link to={`/relatorio/${assessment.id}`} viewTransition>
                <FileText className="mr-1 h-4 w-4" /> Ver Relatório
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0 tactile"
            aria-label="Excluir avaliação"
            onClick={() => onDelete(assessment)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export const AssessmentCard = memo(AssessmentCardBase)
