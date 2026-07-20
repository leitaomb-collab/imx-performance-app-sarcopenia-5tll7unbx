import { useRef } from 'react'
import { useAccessibility } from '@/hooks/use-accessibility'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { ChartTooltip } from './ChartTooltip'

interface DualAxisBarChartProps {
  data: Array<Record<string, any>>
  config: Record<string, { label: string; color: string }>
  leftKey: string
  rightKey: string
  leftRef?: number
  rightRef?: number
  ariaLabel?: string
}

export function DualAxisBarChart({
  data,
  config,
  leftKey,
  rightKey,
  leftRef,
  rightRef,
  ariaLabel,
}: DualAxisBarChartProps) {
  const { announce } = useAccessibility()
  const activeIndexRef = useRef(-1)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (data.length === 0) return
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const next = Math.min(activeIndexRef.current + 1, data.length - 1)
      activeIndexRef.current = next
      announce(`${data[next].date}: ${data[next][leftKey] ?? '-'}, ${data[next][rightKey] ?? '-'}`)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = Math.max(activeIndexRef.current - 1, 0)
      activeIndexRef.current = prev
      announce(`${data[prev].date}: ${data[prev][leftKey] ?? '-'}, ${data[prev][rightKey] ?? '-'}`)
    }
  }

  return (
    <div
      tabIndex={0}
      role="img"
      aria-label={ariaLabel || 'Gráfico'}
      onKeyDown={handleKeyDown}
      className="focus:outline-none focus:ring-2 focus:ring-ring rounded-lg"
    >
      <ChartContainer config={config} className="h-[14rem] md:h-[18rem] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<ChartTooltip />} />
            {leftRef != null && (
              <ReferenceLine
                yAxisId="left"
                y={leftRef}
                stroke={`var(--color-${leftKey})`}
                strokeDasharray="4 4"
              />
            )}
            {rightRef != null && (
              <ReferenceLine
                yAxisId="right"
                y={rightRef}
                stroke={`var(--color-${rightKey})`}
                strokeDasharray="4 4"
              />
            )}
            <Bar
              yAxisId="left"
              dataKey={leftKey}
              fill={`var(--color-${leftKey})`}
              fillOpacity={0.8}
              radius={[4, 4, 0, 0]}
              isAnimationActive
              animationDuration={500}
            />
            <Bar
              yAxisId="right"
              dataKey={rightKey}
              fill={`var(--color-${rightKey})`}
              radius={[4, 4, 0, 0]}
              isAnimationActive
              animationDuration={500}
              animationBegin={100}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
      <span className="sr-only">
        {data.map((d) => `${d.date}: ${d[leftKey] ?? '-'}, ${d[rightKey] ?? '-'}`).join(', ')}
      </span>
    </div>
  )
}
