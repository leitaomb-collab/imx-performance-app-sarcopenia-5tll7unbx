import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import type { DashboardAssessment } from '@/lib/chart-utils'
import { DIAGNOSIS_LABELS } from '@/types'

const DIAGNOSIS_COLORS: Record<string, string> = {
  sem_sarcopenia: 'bg-gray-500 hover:bg-gray-600',
  sarcopenia: 'bg-blue-500 hover:bg-blue-600',
  sarcopenia_grave: 'bg-red-500 hover:bg-red-600',
  nao_avaliado: 'bg-gray-300 hover:bg-gray-400 text-gray-700',
}

const STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-yellow-500 hover:bg-yellow-600',
  concluida: 'bg-green-500 hover:bg-green-600',
}

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
    <Card className="shadow-subtle border-0">
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
          <div className="space-y-3">
            {recent.map((av) => {
              const patientName = av.expand?.patientId?.name || 'Paciente'
              const patientId = av.expand?.patientId?.id || av.patientId
              return (
                <div
                  key={av.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0 gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/paciente/${patientId}`}
                      className="text-sm font-medium hover:underline truncate block"
                    >
                      {patientName}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(av.assessmentDate), 'dd/MM/yyyy')}
                      </span>
                      <Badge className={`text-xs ${STATUS_COLORS[av.status] || ''}`}>
                        {STATUS_LABELS[av.status] || av.status}
                      </Badge>
                      <Badge className={`text-xs ${DIAGNOSIS_COLORS[av.finalDiagnosis] || ''}`}>
                        {DIAGNOSIS_LABELS[av.finalDiagnosis] || 'Não Avaliado'}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="shrink-0 min-h-[44px]">
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
