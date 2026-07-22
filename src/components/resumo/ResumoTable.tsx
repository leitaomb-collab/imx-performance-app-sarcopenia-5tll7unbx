import { cn } from '@/lib/utils'
import { type ComparativeRow, type MetricStatus, STATUS_CONFIG } from '@/lib/resumo-utils'
import { ResumoSparkline } from '@/components/resumo/ResumoSparkline'

interface ResumoTableProps {
  rows: ComparativeRow[]
  hasMultiple: boolean
  footnotes?: string[]
}

function StatusBadge({ status }: { status: MetricStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'resumo-status-pill inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap',
        cfg.text,
      )}
    >
      <span className={cn('resumo-status-dot w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  )
}

export function ResumoTable({ rows, hasMultiple, footnotes }: ResumoTableProps) {
  return (
    <section aria-label="Tabela Comparativa">
      <h2 className="text-sm font-semibold mb-2 text-primary">Tabela Comparativa de Evolução</h2>
      <div className="resumo-table-wrapper resumo-table-zebra relative overflow-x-auto border border-border rounded-lg">
        <table className="resumo-table w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th scope="col" className="text-left py-2 px-3 font-medium text-xs whitespace-nowrap">
                Variável
              </th>
              <th
                scope="col"
                className="text-right py-2 px-3 font-medium text-xs whitespace-nowrap"
              >
                Valor Obtido
              </th>
              <th
                scope="col"
                className="text-right py-2 px-3 font-medium text-xs whitespace-nowrap"
              >
                Referência
              </th>
              <th
                scope="col"
                className="text-right py-2 px-3 font-medium text-xs whitespace-nowrap"
              >
                Percentil
              </th>
              <th
                scope="col"
                className="text-center py-2 px-3 font-medium text-xs whitespace-nowrap"
              >
                Status
              </th>
              <th
                scope="col"
                className="text-center py-2 px-3 font-medium text-xs whitespace-nowrap"
              >
                Evolução
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.variable}
                className="border-b border-border/30 last:border-0 break-inside-avoid"
              >
                <td className="py-2 px-3 font-medium whitespace-nowrap">{row.variable}</td>
                <td className="py-2 px-3 text-right tabular-nums">{row.value}</td>
                <td className="py-2 px-3 text-right text-muted-foreground whitespace-nowrap">
                  {row.reference}
                </td>
                <td className="py-2 px-3 text-right text-muted-foreground">{row.percentile}</td>
                <td className="py-2 px-3 text-center">
                  <StatusBadge status={row.status} />
                </td>
                <td className="py-2 px-3 text-center">
                  {row.isFirst ? (
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      Primeira avaliação
                    </span>
                  ) : (
                    <ResumoSparkline values={row.evolution} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="resumo-scroll-fade pointer-events-none absolute right-0 top-0 bottom-0 w-8" />
      </div>
      {footnotes && footnotes.length > 0 && (
        <div className="mt-2 space-y-0.5">
          {footnotes.map((note, i) => (
            <p key={i} className="text-[0.6875rem] text-muted-foreground">
              {note}
            </p>
          ))}
        </div>
      )}
    </section>
  )
}
