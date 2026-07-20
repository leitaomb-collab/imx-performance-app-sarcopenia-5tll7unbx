import { cn } from '@/lib/utils'
import { type SummaryCard } from '@/lib/summary-utils'
import { Sparkline } from '@/components/summary/Sparkline'

interface SummaryCardsProps {
  cards: SummaryCard[]
}

export function SummaryCards({ cards }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {cards.map((card) => (
        <div
          key={card.title}
          className="summary-card border border-border rounded-lg p-3 break-inside-avoid"
        >
          <h2 className="text-sm font-semibold mb-2 text-primary">{card.title}</h2>
          <div className="overflow-x-auto">
            <table className="summary-table w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th scope="col" className="text-left py-1 pr-2 font-medium">
                    Parâmetro
                  </th>
                  <th scope="col" className="text-right py-1 px-1 font-medium">
                    Atual
                  </th>
                  <th scope="col" className="text-right py-1 px-1 font-medium">
                    Ant.
                  </th>
                  <th scope="col" className="text-right py-1 px-1 font-medium">
                    Var.
                  </th>
                  <th scope="col" className="text-right py-1 px-1 font-medium">
                    Ref.
                  </th>
                  <th scope="col" className="text-center py-1 px-1 font-medium">
                    Status
                  </th>
                  <th scope="col" className="text-center py-1 pl-1 font-medium">
                    Tend.
                  </th>
                </tr>
              </thead>
              <tbody>
                {card.rows.map((row) => (
                  <tr key={row.label} className="border-b border-border/30 last:border-0">
                    <th scope="row" className="text-left py-1 pr-2 font-medium whitespace-nowrap">
                      {row.label}
                    </th>
                    <td className="text-right py-1 px-1 tabular-nums">{row.current}</td>
                    <td className="text-right py-1 px-1 tabular-nums text-muted-foreground">
                      {row.previous}
                    </td>
                    <td
                      className={cn(
                        'text-right py-1 px-1 tabular-nums whitespace-nowrap',
                        row.delta?.direction === 'improving' && 'text-green-600',
                        row.delta?.direction === 'worsening' && 'text-red-600',
                        (!row.delta || row.delta.direction === 'stable') && 'text-muted-foreground',
                      )}
                    >
                      {row.delta?.text || '-'}
                    </td>
                    <td className="text-right py-1 px-1 text-muted-foreground whitespace-nowrap">
                      {row.ref}
                    </td>
                    <td className="text-center py-1 px-1">
                      {row.status ? (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          <span
                            className={cn('h-2 w-2 rounded-full shrink-0', row.status.dotClass)}
                          />
                          <span className="text-[10px]">{row.status.label}</span>
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="text-center py-1 pl-1">
                      <Sparkline
                        values={row.sparkline.values}
                        direction={row.sparkline.direction}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
