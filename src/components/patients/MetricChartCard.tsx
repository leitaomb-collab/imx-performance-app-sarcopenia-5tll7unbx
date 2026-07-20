import { memo, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatMetricTrend, type MetricTrendDirection } from '@/lib/patient-utils'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface MetricChartCardProps {
  title: string
  unit: string
  data: Array<{ date: string; value: number }>
  direction: MetricTrendDirection
  index: number
}

function MetricChartCardBase({ title, unit, data, direction, index }: MetricChartCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const trend = useMemo(() => formatMetricTrend(data, direction), [data, direction])

  const chartData = useMemo(
    () =>
      data.map((d) => ({
        shortDate: format(new Date(d.date), 'dd/MM/yy'),
        fullDate: format(new Date(d.date), 'dd/MM/yyyy'),
        value: d.value,
      })),
    [data],
  )

  const yDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 1] as [number, number]
    const values = chartData.map((d) => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1
    const padding = range * 0.1
    return [Math.floor(min - padding), Math.ceil(max + padding)] as [number, number]
  }, [chartData])

  const strokeColor = trend.improving
    ? 'hsl(142 71% 45%)'
    : trend.direction !== 'stable'
      ? 'hsl(0 84% 60%)'
      : 'hsl(var(--muted-foreground))'

  const trendLabel = trend.improving
    ? 'Melhorando'
    : trend.direction !== 'stable'
      ? 'Piorando'
      : 'Estável'

  const TrendIcon = trend.improving
    ? TrendingUp
    : trend.direction !== 'stable'
      ? TrendingDown
      : Minus
  const rotate = chartData.length > 4

  return (
    <Card
      className={cn('bg-card border-border', !prefersReducedMotion && 'animate-fade-in-up')}
      style={!prefersReducedMotion ? { animationDelay: `${index * 60}ms` } : undefined}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">{title}</h3>
          <Badge
            variant="secondary"
            className={cn(
              'gap-1 text-xs',
              trend.improving
                ? 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20'
                : trend.direction !== 'stable'
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20'
                  : 'bg-gray-500/10 text-gray-600 dark:text-gray-400 hover:bg-gray-500/20',
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {trendLabel}
            {trend.changePercent > 0 && ` ${trend.changePercent}%`}
          </Badge>
        </div>
        <div
          role="img"
          aria-label={`${title}: tendência ${trendLabel}${trend.changePercent > 0 ? `, ${trend.changePercent}% de variação` : ''}`}
          className="h-[120px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -25, bottom: rotate ? 20 : 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
                strokeOpacity={0.3}
              />
              <XAxis
                dataKey="shortDate"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                angle={rotate ? -45 : 0}
                textAnchor={rotate ? 'end' : 'middle'}
                height={rotate ? 30 : 20}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={yDomain}
                width={35}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const point = payload[0].payload as { fullDate: string; value: number }
                  return (
                    <div className="bg-popover border border-border rounded-md px-3 py-2 shadow-md animate-fade-in">
                      <p className="text-xs font-medium">{point.fullDate}</p>
                      <p className="text-xs text-muted-foreground">
                        {point.value} {unit}
                      </p>
                    </div>
                  )
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={strokeColor}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1 }}
                activeDot={{ r: 4, strokeWidth: 2 }}
                isAnimationActive={!prefersReducedMotion}
                animationDuration={400}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export const MetricChartCard = memo(MetricChartCardBase)
