import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDateExtendedBR(isoDate: string): string {
  if (!isoDate) return '-'
  const d = new Date(isoDate)
  if (isNaN(d.getTime())) return isoDate
  return format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function fmt(v: unknown, unit?: string): string {
  if (v == null || v === '') return '-'
  return unit ? `${v} ${unit}` : String(v)
}

export function obj(v: unknown): Record<string, any> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, any>) : {}
}

export function hasData(o: Record<string, any>): boolean {
  return Object.values(o).some((v) => v != null && v !== '')
}

export function pct(actual?: number, predicted?: number): string {
  if (actual == null || predicted == null || predicted === 0) return '-'
  return `${Math.round((actual / predicted) * 100)}%`
}

export function stripHtml(html: string | undefined): string {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, '').trim()
}

export function interpRange(
  v: number | undefined,
  min: number,
  max: number,
): { text: string; cls: 'normal' | 'altered' } | null {
  if (v == null) return null
  return v < min || v > max
    ? { text: 'Alterada', cls: 'altered' }
    : { text: 'Normal', cls: 'normal' }
}

export function interpBP(
  sys?: number,
  dia?: number,
): { text: string; cls: 'normal' | 'altered' } | null {
  if (sys == null && dia == null) return null
  return (sys ?? 0) >= 140 || (dia ?? 0) >= 90 || (sys ?? 0) < 90 || (dia ?? 0) < 60
    ? { text: 'Alterada', cls: 'altered' }
    : { text: 'Normal', cls: 'normal' }
}

export function formatDateCuritibaBR(isoDate: string): string {
  if (!isoDate) return '-'
  const d = new Date(isoDate)
  if (isNaN(d.getTime())) return isoDate
  return format(d, "'Curitiba, 'dd' de 'MMMM' de 'yyyy", { locale: ptBR })
}
