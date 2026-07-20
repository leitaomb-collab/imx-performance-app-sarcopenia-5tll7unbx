import type { Patient } from '@/types'

export type TrendDirection = 'improving' | 'worsening' | 'stable'

export function getTrendDirection(
  current: number | undefined,
  previous: number | undefined,
  mode: 'higher-better' | 'lower-better',
): TrendDirection {
  if (current == null || previous == null) return 'stable'
  const diff = current - previous
  if (Math.abs(diff) < 0.01) return 'stable'
  if (mode === 'higher-better') return diff > 0 ? 'improving' : 'worsening'
  return diff < 0 ? 'improving' : 'worsening'
}

export function formatDelta(
  current: number | undefined,
  previous: number | undefined,
  mode: 'higher-better' | 'lower-better',
): { text: string; direction: TrendDirection } | null {
  if (current == null || previous == null) return null
  const diff = Math.round((current - previous) * 10) / 10
  const direction = getTrendDirection(current, previous, mode)
  if (direction === 'stable') return { text: '-', direction }
  const arrow = diff > 0 ? '↑' : '↓'
  const sign = diff > 0 ? '+' : ''
  return { text: `${arrow} ${sign}${diff}`, direction }
}

export function getDiagnosisBanner(diagnosis: string): {
  label: string
  bgClass: string
  textClass: string
} {
  switch (diagnosis) {
    case 'sem_sarcopenia':
      return {
        label: 'Sem Sarcopenia',
        bgClass: 'bg-[hsl(142,76%,90%)] dark:bg-[hsl(142,76%,20%)]',
        textClass: 'text-[hsl(142,76%,36%)] dark:text-[hsl(142,76%,70%)]',
      }
    case 'sarcopenia':
      return {
        label: 'Sarcopenia Provável',
        bgClass: 'bg-[hsl(199,89%,90%)] dark:bg-[hsl(199,89%,20%)]',
        textClass: 'text-[hsl(199,89%,40%)] dark:text-[hsl(199,89%,70%)]',
      }
    case 'sarcopenia_grave':
      return {
        label: 'Sarcopenia Grave',
        bgClass: 'bg-[hsl(0,84%,90%)] dark:bg-[hsl(0,84%,20%)]',
        textClass: 'text-[hsl(0,84%,40%)] dark:text-[hsl(0,84%,70%)]',
      }
    default:
      return {
        label: 'Não Avaliado',
        bgClass: 'bg-muted dark:bg-muted/50',
        textClass: 'text-muted-foreground',
      }
  }
}

export const CARD_INDICATOR_COLORS: Record<string, string> = {
  'Sinais Vitais': 'bg-red-500',
  'Composição Corporal': 'bg-blue-500',
  Antropometria: 'bg-amber-500',
  'Força Muscular': 'bg-purple-500',
  'Equilíbrio e Risco de Quedas': 'bg-green-500',
  'Função Respiratória': 'bg-cyan-500',
  'Triagem e Diagnóstico': 'bg-orange-500',
}

export function getNested(obj: Record<string, any>, ...path: string[]): any {
  return path.reduce(
    (acc, key) => (acc && typeof acc === 'object' && !Array.isArray(acc) ? acc[key] : undefined),
    obj,
  )
}

export function fmtNum(v: unknown, unit?: string): string {
  if (v == null || v === '') return '-'
  const num = typeof v === 'string' ? parseFloat(v) : v
  if (typeof num !== 'number' || isNaN(num)) return String(v)
  return unit ? `${num} ${unit}` : String(num)
}

export interface SummaryRow {
  label: string
  current: string
  previous: string
  delta: { text: string; direction: TrendDirection } | null
  ref: string
  status: { label: string; dotClass: string } | null
  sparkline: { values: number[]; direction: TrendDirection | null }
}

export interface SummaryCard {
  title: string
  rows: SummaryRow[]
}
