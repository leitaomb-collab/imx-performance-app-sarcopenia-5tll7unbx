import type { ReactNode } from 'react'
import { ClinicalBadge } from '@/components/assessment/shared'
import type { Patient } from '@/types'
import type { ClinicalStatus } from '@/lib/clinical-utils'

export type SectionProps = {
  assessment: Record<string, any>
  patient: Patient | null
  isReadOnly: boolean
  onUpdate: (updates: Record<string, any>) => void
}

export interface DisplayField {
  label: string
  value?: number | string | null
  unit?: string
  ref?: string
  badge?: ClinicalStatus
}

export const obj = (v: unknown): Record<string, any> =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, any>) : {}

export const isEmpty = (o: Record<string, any>): boolean =>
  Object.values(o).every((v) => v == null || v === '')

export function DefList({ fields }: { fields: DisplayField[] }) {
  return (
    <dl className="divide-y">
      {fields.map((f, i) => (
        <div key={i} className="flex items-center justify-between py-2.5 gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <dt className="text-sm text-muted-foreground truncate">{f.label}</dt>
            {f.ref && <dd className="text-xs text-muted-foreground/70">Ref: {f.ref}</dd>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <dd className="text-sm font-semibold">
              {f.value != null && f.value !== '' ? `${f.value}${f.unit ? ' ' + f.unit : ''}` : '-'}
            </dd>
            {f.badge && <ClinicalBadge status={f.badge} />}
          </div>
        </div>
      ))}
    </dl>
  )
}

export function EmptyData() {
  return (
    <p className="text-sm text-muted-foreground py-4 text-center">
      Sem dados registrados nesta seção
    </p>
  )
}
