import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type ReportRow = {
  label: string
  value: string
  ref?: string
  sparkline?: ReactNode
  interp?: string
  interpClass?: 'normal' | 'reduced' | 'moderate' | 'altered' | 'blue' | 'orange'
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
    <section className="report-section break-inside-avoid">
      <h2 className="report-section-title text-lg font-semibold border-b border-primary pb-2 mb-4 break-after-avoid">
        {number}. {title}
      </h2>
      <div className="px-1">{children}</div>
    </section>
  )
}

export function ReportTable({ rows }: { rows: ReportRow[] }) {
  const hasSparkline = rows.some((r) => r.sparkline !== undefined && r.sparkline !== null)

  return (
    <div className="table-scroll-wrapper">
      <table className="report-table w-full text-sm">
        <thead>
          <tr>
            <th className="text-left p-2">Parâmetro</th>
            <th className="text-left p-2">Valor</th>
            <th className="text-left p-2">Referência</th>
            {hasSparkline && <th className="text-center p-2">Evolução</th>}
            <th className="text-left p-2">Interpretação</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="report-table-cell p-2" data-label="Parâmetro">
                {row.label}
              </td>
              <td className="report-table-cell report-table-value p-2" data-label="Valor">
                {row.value}
              </td>
              <td className="report-table-cell report-table-ref p-2" data-label="Referência">
                {row.ref ?? '-'}
              </td>
              {hasSparkline && (
                <td className="report-table-cell p-2 text-center" data-label="Evolução">
                  <div className="inline-flex items-center justify-center min-h-[20px]">
                    {row.sparkline ?? <span className="text-[10px] text-muted-foreground">-</span>}
                  </div>
                </td>
              )}
              <td className="report-table-cell p-2" data-label="Interpretação">
                {row.interp && row.interpClass && (
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full',
                      `clinical-badge-${row.interpClass}`,
                    )}
                  >
                    {row.interp}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
        {title}
      </h4>
      {children}
    </div>
  )
}

export function EmptySection({ message }: { message?: string }) {
  return (
    <div className="bg-muted/30 rounded">
      <p className="text-muted-foreground text-sm italic py-4 text-center">
        {message ?? 'Dados não coletados nesta avaliação'}
      </p>
    </div>
  )
}
