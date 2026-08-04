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

export interface EWGSOP2CriteriaData {
  handgripMax?: number | null
  almi?: number | null
  sppbTotal?: number | null
  gender: 'M' | 'F'
}

function buildCriteriaSummary(criteria: EWGSOP2CriteriaData): string {
  const parts: string[] = []

  if (criteria.handgripMax != null) {
    const cutoff = criteria.gender === 'M' ? 27 : 16
    const reduced = criteria.handgripMax < cutoff
    parts.push(
      `Força ${reduced ? 'reduzida' : 'preservada'} (handgrip ${criteria.handgripMax} kg ${reduced ? '<' : '≥'} ${cutoff} kg)`,
    )
  }

  if (criteria.almi != null) {
    const cutoff = criteria.gender === 'M' ? 7.0 : 5.4
    const reduced = criteria.almi < cutoff
    parts.push(
      `Massa ${reduced ? 'reduzida' : 'preservada'} (ALMI ${criteria.almi} ${reduced ? '<' : '≥'} ${cutoff} kg/m²)`,
    )
  }

  if (criteria.sppbTotal != null) {
    const reduced = criteria.sppbTotal <= 7
    parts.push(
      `Performance ${reduced ? 'reduzida' : 'preservada'} (SPPB ${criteria.sppbTotal} ${reduced ? '≤' : '>'} 7)`,
    )
  }

  if (parts.length === 0) return ''
  return `Critérios EWGSOP2: ${parts.join('; ')}.`
}

export function getDiagnosisBanner(
  diagnosis: string,
  criteria?: EWGSOP2CriteriaData,
): {
  label: string
  bgClass: string
  textClass: string
  criteriaSummary: string
} {
  const criteriaSummary = criteria ? buildCriteriaSummary(criteria) : ''
  switch (diagnosis) {
    case 'sem_sarcopenia':
      return {
        label: 'Sem Sarcopenia',
        bgClass: 'bg-[hsl(142,76%,90%)] dark:bg-[hsl(142,76%,20%)]',
        textClass: 'text-[hsl(142,76%,36%)] dark:text-[hsl(142,76%,70%)]',
        criteriaSummary,
      }
    case 'sarcopenia':
      return {
        label: 'Sarcopenia Provável',
        bgClass: 'bg-[hsl(199,89%,90%)] dark:bg-[hsl(199,89%,20%)]',
        textClass: 'text-[hsl(199,89%,40%)] dark:text-[hsl(199,89%,70%)]',
        criteriaSummary,
      }
    case 'sarcopenia_grave':
      return {
        label: 'Sarcopenia Grave',
        bgClass: 'bg-[hsl(0,84%,90%)] dark:bg-[hsl(0,84%,20%)]',
        textClass: 'text-[hsl(0,84%,40%)] dark:text-[hsl(0,84%,70%)]',
        criteriaSummary,
      }
    default:
      return {
        label: 'Não Avaliado',
        bgClass: 'bg-muted dark:bg-muted/50',
        textClass: 'text-muted-foreground',
        criteriaSummary,
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
