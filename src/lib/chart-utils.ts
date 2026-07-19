import { format } from 'date-fns'
import type { Assessment } from '@/types'

export type DashboardAssessment = Omit<
  Assessment,
  'muscleStrength' | 'bodyComposition' | 'balanceAssessment' | 'spirometry'
> & {
  muscleStrength?: Record<string, any>
  bodyComposition?: Record<string, any>
  balanceAssessment?: Record<string, any>
  spirometry?: Record<string, any>
  [key: string]: any
}

export function getEWGSOP2HandgripCutoff(gender: 'M' | 'F'): number {
  return gender === 'M' ? 27 : 16
}

export function getEWGSOP2ALMICutoff(gender: 'M' | 'F'): number {
  return gender === 'M' ? 7.0 : 5.5
}

export function getPhaseAngleCutoff(gender: 'M' | 'F'): number {
  return gender === 'M' ? 5.0 : 4.6
}

export function getFatPercentageMidpoint(gender: 'M' | 'F'): number {
  return gender === 'M' ? 25 : 35
}

export function isReassessmentDue(
  assessmentDate: string,
  reassessmentMonths: number,
): { isDue: boolean; isLate: boolean } {
  if (!assessmentDate || !reassessmentMonths || reassessmentMonths <= 0) {
    return { isDue: false, isLate: false }
  }
  const date = new Date(assessmentDate)
  const reassessmentDate = new Date(date)
  reassessmentDate.setMonth(reassessmentDate.getMonth() + reassessmentMonths)
  const now = new Date()
  const diffDays = Math.ceil((reassessmentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return {
    isDue: diffDays <= 30,
    isLate: diffDays < 0,
  }
}

export function sortAssessmentsByDate<T extends { assessmentDate: string }>(assessments: T[]): T[] {
  return [...assessments].sort(
    (a, b) => new Date(a.assessmentDate).getTime() - new Date(b.assessmentDate).getTime(),
  )
}

export function extractChartData<T extends { assessmentDate: string }>(
  assessments: T[],
  getValue: (a: T) => number | undefined,
): Array<{ date: string; value: number }> {
  return sortAssessmentsByDate(assessments)
    .map((a) => {
      const raw = getValue(a)
      const num = typeof raw === 'string' ? parseFloat(raw) : raw
      return {
        date: format(new Date(a.assessmentDate), 'dd/MM/yy'),
        value: num,
      }
    })
    .filter((d): d is { date: string; value: number } => d.value != null && !isNaN(d.value))
}

export function formatDateShort(dateStr: string): string {
  return format(new Date(dateStr), 'dd/MM/yy')
}

export function formatDateBR(dateStr: string): string {
  return format(new Date(dateStr), 'dd/MM/yyyy')
}
