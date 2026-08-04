import { cn } from '@/lib/utils'
import { type SummaryCard, type TrendDirection, CARD_INDICATOR_COLORS } from '@/lib/summary-utils'
import { Sparkline } from '@/components/summary/Sparkline'

interface SummaryCardsProps {
  cards: SummaryCard[]
}

interface StatusInfo {
  label: string
  dotClass: string
}

function StatusBadge({ status }: { status: StatusInfo }) {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs px-2 py-0.5 rounded-full bg-muted">
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', status.dotClass)} />
      <span>{status.label}</span>
    </span>
  )
}

function deltaColor(dir: TrendDirection | null | undefined): string {
  if (dir === 'improving') return 'text-green-600'
  if (dir === 'worsening') return 'text-red-600'
  return 'text-muted-foreground'
}

export function SummaryCards({ cards }: SummaryCardsProps) {
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop table layout */}
      <div className="hidden md:grid grid-cols-2 gap-3">
        {cards.map((card, index) => (
          <div
            key={`dt-${card.title}`}
            className="summary-card animate-summary-card border border-border rounded-lg overflow-hidden break-inside-avoid"
            style={{ animationDelay: `${200 + index * 50}ms` }}
          >
            <div className="flex items-center gap-2 px-3 pt-3">
              <span
                className={cn(
                  'w-1 h-4 rounded-full shrink-0',
                  CARD_INDICATOR_COLORS[card.title] || 'bg-primary',
                )}
              />
              <h2 className="text-sm font-semibold text-primary">{card.title}</h2>
            </div>
            <div className="overflow-x-auto max-w-full p-3 pt-2">
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
                          'text-right py-1 px-1 whitespace-nowrap text-[0.6875rem]',
                          deltaColor(row.delta?.direction),
                        )}
                      >
                        {row.delta?.text || '-'}
                      </td>
                      <td className="text-right py-1 px-1 text-muted-foreground whitespace-normal text-xs">
                        {row.ref}
                      </td>
                      <td className="text-center py-1 px-1">
                        {row.status ? <StatusBadge status={row.status} /> : '-'}
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

      {/* Mobile mini-card layout */}
      <div className="md:hidden grid grid-cols-1 gap-2">
        {cards.map((card, index) => (
          <div
            key={`mb-${card.title}`}
            className="border border-border rounded-lg overflow-hidden break-inside-avoid animate-summary-card"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-2 px-3 pt-3">
              <span
                className={cn(
                  'w-1 h-4 rounded-full shrink-0',
                  CARD_INDICATOR_COLORS[card.title] || 'bg-primary',
                )}
              />
              <h2 className="text-sm font-semibold text-primary">{card.title}</h2>
            </div>
            <div className="p-3 pt-2">
              {card.rows.map((row) => (
                <div
                  key={row.label}
                  className="bg-card border border-border/50 rounded-lg p-3 mb-2 shadow-sm last:mb-0"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{row.label}</span>
                    {row.status && <StatusBadge status={row.status} />}
                  </div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-lg font-bold">{row.current}</span>
                    <span className="text-xs text-muted-foreground whitespace-normal text-right">
                      {row.ref}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground shrink-0">
                      Ant. <span className="tabular-nums">{row.previous}</span>
                    </span>
                    <span className={cn('text-xs shrink-0', deltaColor(row.delta?.direction))}>
                      Var. {row.delta?.text || '-'}
                    </span>
                    <div className="flex-1 min-w-[60px] flex justify-end [&>svg]:w-full [&>svg]:h-auto">
                      <Sparkline
                        values={row.sparkline.values}
                        direction={row.sparkline.direction}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
