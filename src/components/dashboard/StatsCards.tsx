import { memo, useMemo, type ComponentType } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Activity, AlertTriangle, Clock } from 'lucide-react'
import type { Patient } from '@/types'
import type { DashboardAssessment } from '@/lib/chart-utils'
import { isReassessmentDue } from '@/lib/chart-utils'
import { CountUpNumber } from './CountUpNumber'

interface StatsCardsProps {
  patients: Patient[]
  assessments: DashboardAssessment[]
  patientSelected: boolean
}

interface StatCardData {
  title: string
  value: number
  subtitle: string
  icon: ComponentType<{ className?: string }>
  valueColor?: string
  accentColor: string
}

const StatCardItem = memo(function StatCardItem({
  card,
  delay,
}: {
  card: StatCardData
  delay: number
}) {
  const Icon = card.icon
  return (
    <Card className="stats-card stats-card-enter" style={{ animationDelay: `${delay}ms` }}>
      <div className="stats-card-accent-bar" style={{ backgroundColor: card.accentColor }} />
      <CardContent className="p-5">
        <Icon className="stats-card-icon" />
        <p className="stats-card-title">{card.title}</p>
        <p
          className="stats-card-value"
          style={card.valueColor ? { color: card.valueColor } : undefined}
        >
          <CountUpNumber target={card.value} delay={delay + 400} />
        </p>
        <p className="stats-card-subtitle">{card.subtitle}</p>
      </CardContent>
    </Card>
  )
})

function StatsCardsBase({ patients, assessments, patientSelected }: StatsCardsProps) {
  const cards = useMemo<StatCardData[]>(() => {
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
    const sarcopeniaGrave = assessments.filter(
      (a) => a.finalDiagnosis === 'sarcopenia_grave',
    ).length

    const pendingReassessments = assessments.filter((a) => {
      if (a.status !== 'concluida') return false
      return isReassessmentDue(a.assessmentDate, a.reassessmentMonths).isDue
    }).length
    const lateReassessments = assessments.filter((a) => {
      if (a.status !== 'concluida') return false
      return isReassessmentDue(a.assessmentDate, a.reassessmentMonths).isLate
    }).length

    const result: StatCardData[] = []
    if (!patientSelected) {
      result.push({
        title: 'Pacientes Cadastrados',
        value: patients.length,
        subtitle: `${newThisMonth} novos no mês`,
        icon: Users,
        accentColor: 'hsl(var(--primary))',
      })
    }
    result.push({
      title: 'Avaliações Realizadas',
      value: assessments.length,
      subtitle: `${concludedCount} concluídas`,
      icon: Activity,
      accentColor: 'hsl(217 91% 60%)',
    })
    result.push({
      title: 'Em Risco de Sarcopenia',
      value: sarcopeniaRisk,
      subtitle: `${sarcopeniaGrave} sarcopenia grave`,
      icon: AlertTriangle,
      valueColor: sarcopeniaRisk > 0 ? 'hsl(var(--destructive))' : undefined,
      accentColor: 'hsl(0 84% 60%)',
    })
    if (!patientSelected) {
      result.push({
        title: 'Reavaliações Pendentes',
        value: pendingReassessments,
        subtitle: `${lateReassessments} em atraso`,
        icon: Clock,
        valueColor: pendingReassessments > 0 ? 'hsl(var(--warning))' : undefined,
        accentColor: 'hsl(45 93% 47%)',
      })
    }
    return result
  }, [patients, assessments, patientSelected])

  const gridClass = patientSelected
    ? 'grid-cols-1 md:grid-cols-2'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'

  return (
    <div className={`grid gap-4 ${gridClass}`}>
      {cards.map((card, i) => (
        <StatCardItem key={i} card={card} delay={100 + i * 80} />
      ))}
    </div>
  )
}

export const StatsCards = memo(StatsCardsBase)
