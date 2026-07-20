export function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export function calculateIMC(weight: number, height: number): number {
  if (!weight || !height) return 0
  return Math.round((weight / (height * height)) * 10) / 10
}

export function getIMCCategory(imc: number): string {
  if (imc < 17) return 'Baixo peso severo'
  if (imc < 18.5) return 'Baixo peso'
  if (imc <= 24.9) return 'Normal'
  if (imc <= 29.9) return 'Sobrepeso'
  return 'Obesidade'
}

export function getIMCColorClass(imc: number): string {
  if (imc >= 18.5 && imc <= 24.9) return 'bg-green-500'
  if ((imc >= 17 && imc < 18.5) || (imc >= 25 && imc <= 29.9)) return 'bg-yellow-500'
  return 'bg-red-500'
}

export function formatGender(gender: string): string {
  if (gender === 'M') return 'Masculino'
  if (gender === 'F') return 'Feminino'
  return gender
}

export function formatDateBR(isoDate: string): string {
  const date = new Date(isoDate)
  if (isNaN(date.getTime())) return isoDate
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export function getDiagnosisInfo(diagnosis: string): { label: string; className: string } | null {
  switch (diagnosis) {
    case 'sem_sarcopenia':
      return {
        label: 'Sem sarcopenia',
        className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 hover:bg-gray-500/20',
      }
    case 'sarcopenia':
      return {
        label: 'Sarcopenia provável',
        className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20',
      }
    case 'sarcopenia_grave':
      return {
        label: 'Sarcopenia grave',
        className: 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20',
      }
    default:
      return null
  }
}

export type MetricTrendDirection = 'higher-is-better' | 'lower-is-better' | 'neutral'

export interface MetricTrend {
  direction: 'up' | 'down' | 'stable'
  changePercent: number
  improving: boolean
}

export function formatMetricTrend(
  values: Array<{ date: string; value: number }>,
  metricDirection: MetricTrendDirection,
): MetricTrend {
  if (values.length < 2) {
    return { direction: 'stable', changePercent: 0, improving: false }
  }

  if (metricDirection === 'neutral') {
    return { direction: 'stable', changePercent: 0, improving: false }
  }

  const sorted = [...values].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const first = sorted[0].value
  const last = sorted[sorted.length - 1].value

  if (first === 0) {
    return { direction: 'stable', changePercent: 0, improving: false }
  }

  const changePercent = Math.round(((last - first) / Math.abs(first)) * 100)

  if (Math.abs(changePercent) < 5) {
    return { direction: 'stable', changePercent: 0, improving: false }
  }

  const direction = changePercent > 0 ? 'up' : 'down'
  const improving =
    metricDirection === 'higher-is-better' ? direction === 'up' : direction === 'down'

  return { direction, changePercent: Math.abs(changePercent), improving }
}
