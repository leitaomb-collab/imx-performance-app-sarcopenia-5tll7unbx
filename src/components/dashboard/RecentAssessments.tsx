import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import type { DashboardAssessment } from '@/lib/chart-utils'
import { DIAGNOSIS_LABELS } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  rascunho: 'Rascunho',
  concluida: 'Concluída',
}

interface RecentAssessmentsProps {
  assessments: DashboardAssessment[]
}

export function RecentAssessments({ assessments }: RecentAssessmentsProps) {
  const recent = [...assessments]
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    .slice(0, 5)

  return (
    <Card className="shadow-subtle rounded-[0.75rem]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Atividade Recente</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/pacientes" className="text-sm text-primary hover:underline">
            Ver todas
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            Nenhuma avaliação encontrada.
          </p>
        ) : (
          <div>
            {recent.map((av) => {
              const patientName = av.expand?.patientId?.name || 'Paciente'
              const patientId = av.expand?.patientId?.id || av.patientId
              return (
                <div key={av.id} className="recent-item">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/paciente/${patientId}`}
                      className="text-sm font-medium hover:underline truncate block"
                      style={{ color: 'hsl(var(--foreground))' }}
                    >
                      <span className="hover:text-primary transition-colors">{patientName}</span>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(av.assessmentDate), 'dd/MM/yyyy')}
                      </span>
                      <span className={`recent-badge recent-badge-${av.status}`}>
                        {STATUS_LABELS[av.status] || av.status}
                      </span>
                      <span className={`recent-badge recent-badge-${av.finalDiagnosis}`}>
                        {DIAGNOSIS_LABELS[av.finalDiagnosis] || 'Não Avaliado'}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="shrink-0 min-h-[44px] text-primary rounded-[0.375rem]"
                  >
                    <Link to={`/avaliacao/${av.id}`}>
                      Ver <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
