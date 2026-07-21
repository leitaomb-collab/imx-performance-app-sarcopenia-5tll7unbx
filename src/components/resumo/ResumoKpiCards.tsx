import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type KpiCard,
  type KpiMetric,
  type MetricStatus,
  type TrendDir,
  STATUS_CONFIG,
} from '@/lib/resumo-utils'

interface ResumoKpiCardsProps {
  cards: KpiCard[]
}

function TrendArrow({ trend, positive }: { trend: TrendDir; positive: boolean | null }) {
  if (trend === 'stable') return <Minus className="h-3 w-3 text-muted-foreground" />
  const color =
    positive === true
      ? 'text-green-600'
      : positive === false
        ? 'text-red-600'
        : 'text-muted-foreground'
  return trend === 'up' ? (
    <TrendingUp className={cn('h-3 w-3', color)} />
  ) : (
    <TrendingDown className={cn('h-3 w-3', color)} />
  )
}

function MetricItem({ metric }: { metric: KpiMetric }) {
  const cfg = STATUS_CONFIG[metric.status]
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground truncate">{metric.name}</p>
        <p className="text-lg font-bold tabular-nums leading-tight">{metric.value}</p>
        <p className="text-[10px] text-muted-foreground">Ref: {metric.reference}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
        <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium', cfg.text)}>
          <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
          {cfg.label}
        </span>
        {metric.trend && <TrendArrow trend={metric.trend} positive={metric.trendPositive} />}
      </div>
    </div>
  )
}

export function ResumoKpiCards({ cards }: ResumoKpiCardsProps) {
  const filteredCards = cards
    .map((card) => ({
      ...card,
      metrics: card.metrics.filter((m) => m.value !== '-'),
    }))
    .filter((card) => card.metrics.length > 0)

  return (
    <section aria-label="Indicadores Clínicos">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCards.map((card, index) => (
          <div
            key={card.category}
            className="resumo-card animate-resumo-card border border-border rounded-lg p-4 break-inside-avoid"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/40">
              <span className={cn('w-1.5 h-4 rounded-full shrink-0', card.indicatorColor)} />
              <h2 className="text-sm font-semibold text-primary">{card.category}</h2>
            </div>
            <div className="divide-y divide-border/20">
              {card.metrics.map((m) => (
                <MetricItem key={m.name} metric={m} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
