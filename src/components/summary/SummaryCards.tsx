import { cn } from '@/lib/utils'
import { type SummaryCard, CARD_INDICATOR_COLORS } from '@/lib/summary-utils'
import { Sparkline } from '@/components/summary/Sparkline'

interface SummaryCardsProps {
  cards: SummaryCard[]
}

export function SummaryCards({ cards }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {cards.map((card, index) => {
        const indicatorColor = CARD_INDICATOR_COLORS[card.title] || 'bg-primary'
        return (
          <div
            key={card.title}
            className="summary-card animate-summary-card border border-border rounded-lg overflow-hidden break-inside-avoid"
            style={{ animationDelay: `${200 + index * 50}ms` }}
          >
            <div className="flex items-center gap-2 px-3 pt-3">
              <span className={cn('w-1 h-4 rounded-full shrink-0', indicatorColor)} />
              <h2 className="text-sm font-semibold text-primary">{card.title}</h2>
            </div>
            <div className="overflow-x-auto p-3 pt-2">
              <table className="summary-table w-full">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th scope="col" className="text-left py-1 pr-2 font-medium text-[0.5625rem]">
                      Parâmetro
                    </th>
                    <th scope="col" className="text-right py-1 px-1 font-medium text-[0.5625rem]">
                      Atual
                    </th>
                    <th scope="col" className="text-right py-1 px-1 font-medium text-[0.5625rem]">
                      Ant.
                    </th>
                    <th scope="col" className="text-right py-1 px-1 font-medium text-[0.5625rem]">
                      Var.
                    </th>
                    <th scope="col" className="text-right py-1 px-1 font-medium text-[0.5625rem]">
                      Ref.
                    </th>
                    <th scope="col" className="text-center py-1 px-1 font-medium text-[0.5625rem]">
                      Status
                    </th>
                    <th scope="col" className="text-center py-1 pl-1 font-medium text-[0.5625rem]">
                      Tend.
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {card.rows.map((row) => (
                    <tr key={row.label} className="border-b border-border/30 last:border-0">
                      <th
                        scope="row"
                        className="text-left py-1 pr-2 font-medium whitespace-nowrap text-[0.6875rem]"
                      >
                        {row.label}
                      </th>
                      <td className="text-right py-1 px-1 tabular-nums text-[0.6875rem]">
                        {row.current}
                      </td>
                      <td className="text-right py-1 px-1 tabular-nums text-muted-foreground text-[0.6875rem]">
                        {row.previous}
                      </td>
                      <td
                        className={cn(
                          'text-right py-1 px-1 tabular-nums whitespace-nowrap text-[0.6875rem]',
                          row.delta?.direction === 'improving' && 'text-green-600',
                          row.delta?.direction === 'worsening' && 'text-red-600',
                          (!row.delta || row.delta.direction === 'stable') &&
                            'text-muted-foreground',
                        )}
                      >
                        {row.delta?.text || '-'}
                      </td>
                      <td className="text-right py-1 px-1 text-muted-foreground whitespace-nowrap text-[0.6875rem]">
                        {row.ref}
                      </td>
                      <td className="text-center py-1 px-1">
                        {row.status ? (
                          <span className="inline-flex items-center gap-1 whitespace-nowrap">
                            <span
                              className={cn(
                                'w-1.5 h-1.5 rounded-full shrink-0',
                                row.status.dotClass,
                              )}
                            />
                            <span className="text-[0.5625rem]">{row.status.label}</span>
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
        )
      })}
    </div>
  )
}
