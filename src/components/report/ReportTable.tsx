import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface ReportRow {
  label: string
  value?: string | null
  ref?: string
  interp?: string
  interpClass?: 'normal' | 'altered' | 'reduced'
}

export function ReportTable({
  headers = ['Parâmetro', 'Atual', 'Referência', 'Interpretação'],
  rows,
  footnote,
}: {
  headers?: string[]
  rows: ReportRow[]
  footnote?: string
}) {
  const showRef = headers.length >= 3
  const showInterp = headers.length >= 4
  return (
    <div className="break-inside-avoid">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-border bg-muted/20">
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left py-2 px-3 font-semibold text-xs uppercase tracking-wide"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/40 last:border-0">
              <td className="py-2 px-3">{row.label}</td>
              <td className="py-2 px-3 font-medium">{row.value ?? '-'}</td>
              {showRef && (
                <td className="py-2 px-3 text-muted-foreground text-xs">{row.ref ?? '-'}</td>
              )}
              {showInterp && (
                <td className="py-2 px-3">
                  {row.interp ? (
                    <span
                      className={cn(
                        'text-xs font-semibold px-2 py-0.5 rounded',
                        row.interpClass === 'normal' && 'clinical-badge-normal',
                        row.interpClass === 'altered' && 'clinical-badge-reduced',
                        row.interpClass === 'reduced' && 'clinical-badge-reduced',
                      )}
                    >
                      {row.interp}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {footnote && <p className="text-xs text-muted-foreground mt-2 italic">{footnote}</p>}
    </div>
  )
}

export function SectionBlock({
  number,
  title,
  children,
}: {
  number: number
  title: string
  children: ReactNode
}) {
  return (
    <section className="report-section break-inside-avoid mb-6">
      <h3 className="text-base font-bold border-b border-border pb-2 mb-3 flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-primary text-primary-foreground text-xs font-bold">
          {number}
        </span>
        {title}
      </h3>
      {children}
    </section>
  )
}

export function SubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        {title}
      </h4>
      {children}
    </div>
  )
}

export function EmptySection() {
  return (
    <p className="text-sm text-muted-foreground py-4 text-center">
      Sem dados registrados nesta seção
    </p>
  )
}
