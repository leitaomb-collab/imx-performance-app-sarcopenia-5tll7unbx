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

const ACCENT_COLORS: Record<MetricStatus, string> = {
  normal: 'hsl(142 68% 40%)',
  attention: 'hsl(38 92% 50%)',
  critical: 'hsl(0 84% 50%)',
}

function computeCardStatus(metrics: KpiMetric[]): MetricStatus {
  let hasCritical = false
  let hasAttention = false
  for (const m of metrics) {
    if (m.status === 'critical') hasCritical = true
    else if (m.status === 'attention') hasAttention = true
  }
  if (hasCritical) return 'critical'
  if (hasAttention) return 'attention'
  return 'normal'
}

function TrendArrow({ trend, positive }: { trend: TrendDir; positive: boolean | null }) {
  const symbol = trend === 'up' ? '^' : trend === 'down' ? 'v' : '-'
  if (trend === 'stable')
    return (
      <span className="resumo-trend-arrow">
        <Minus className="resumo-trend-icon h-3 w-3 text-muted-foreground" />
        <span className="resumo-trend-text hidden">{symbol}</span>
      </span>
    )
  const color =
    positive === true
      ? 'text-green-600'
      : positive === false
        ? 'text-red-600'
        : 'text-muted-foreground'
  return (
    <span className="resumo-trend-arrow">
      {trend === 'up' ? (
        <TrendingUp className={cn('resumo-trend-icon h-3 w-3', color)} />
      ) : (
        <TrendingDown className={cn('resumo-trend-icon h-3 w-3', color)} />
      )}
      <span className="resumo-trend-text hidden">{symbol}</span>
    </span>
  )
}

function MetricItem({ metric }: { metric: KpiMetric }) {
  const cfg = STATUS_CONFIG[metric.status]
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="min-w-0 flex-1">
        <p className="text-[0.6875rem] uppercase text-muted-foreground truncate">{metric.name}</p>
        <p className="text-[1.75rem] font-bold tabular-nums leading-tight">{metric.value}</p>
        <p className="text-[10px] text-muted-foreground">Ref: {metric.reference}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
        <span
          className={cn(
            'resumo-status-pill inline-flex items-center gap-1 text-[10px] font-medium',
            cfg.text,
          )}
        >
          <span className={cn('resumo-status-dot w-1.5 h-1.5 rounded-full', cfg.dot)} />
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
        {filteredCards.map((card, index) => {
          const cardStatus = computeCardStatus(card.metrics)
          return (
            <div
              key={card.category}
              className="resumo-clinical-card animate-resumo-card relative overflow-hidden break-inside-avoid"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span
                className="resumo-card-accent absolute left-0 top-0 bottom-0 w-[3px]"
                style={{ backgroundColor: ACCENT_COLORS[cardStatus] }}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/40">
                  <h2 className="text-sm font-semibold text-primary">{card.category}</h2>
                </div>
                <div className="divide-y divide-border/20">
                  {card.metrics.map((m) => (
                    <MetricItem key={m.name} metric={m} />
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
