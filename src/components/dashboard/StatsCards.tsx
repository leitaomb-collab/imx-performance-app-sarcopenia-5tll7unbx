import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Activity, AlertTriangle, Clock } from 'lucide-react'
import type { ComponentType } from 'react'
import type { Patient } from '@/types'
import type { DashboardAssessment } from '@/lib/chart-utils'
import { isReassessmentDue } from '@/lib/chart-utils'

interface StatsCardsProps {
  patients: Patient[]
  assessments: DashboardAssessment[]
  patientSelected: boolean
}

interface StatCard {
  title: string
  value: number
  subtitle: string
  icon: ComponentType<{ className?: string }>
  color: string
}

export function StatsCards({ patients, assessments, patientSelected }: StatsCardsProps) {
  const now = new Date()
  const newThisMonth = patients.filter(
    (p) =>
      new Date(p.created).getMonth() === now.getMonth() &&
      new Date(p.created).getFullYear() === now.getFullYear(),
  ).length

  const concludedCount = assessments.filter((a) => a.status === 'concluida').length
  const sarcopeniaRisk = assessments.filter(
    (a) => a.finalDiagnosis === 'sarcopenia' || a.finalDiagnosis === 'sarcopenia_grave',
  ).length
  const sarcopeniaGrave = assessments.filter((a) => a.finalDiagnosis === 'sarcopenia_grave').length

  const pendingReassessments = assessments.filter((a) => {
    if (a.status !== 'concluida') return false
    return isReassessmentDue(a.assessmentDate, a.reassessmentMonths).isDue
  }).length
  const lateReassessments = assessments.filter((a) => {
    if (a.status !== 'concluida') return false
    return isReassessmentDue(a.assessmentDate, a.reassessmentMonths).isLate
  }).length

  const cards: StatCard[] = []
  if (!patientSelected) {
    cards.push({
      title: 'Pacientes Cadastrados',
      value: patients.length,
      subtitle: `${newThisMonth} novos no mês`,
      icon: Users,
      color: 'text-primary',
    })
  }
  cards.push({
    title: 'Avaliações Realizadas',
    value: assessments.length,
    subtitle: `${concludedCount} concluídas`,
    icon: Activity,
    color: 'text-chart-3',
  })
  cards.push({
    title: 'Em Risco de Sarcopenia',
    value: sarcopeniaRisk,
    subtitle: `${sarcopeniaGrave} sarcopenia grave`,
    icon: AlertTriangle,
    color: 'text-chart-4',
  })
  if (!patientSelected) {
    cards.push({
      title: 'Reavaliações Pendentes',
      value: pendingReassessments,
      subtitle: `${lateReassessments} em atraso`,
      icon: Clock,
      color: 'text-destructive',
    })
  }

  const gridClass = patientSelected ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-4'

  return (
    <div className={`grid gap-4 ${gridClass}`}>
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <Card key={i} className="shadow-subtle border-0 bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.subtitle}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
