import { memo, type ReactNode, useRef } from 'react'
import { useAccessibility } from '@/hooks/use-accessibility'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { ChartTooltip } from './ChartTooltip'

interface SimpleLineChartProps {
  data: Array<{ date: string; value: number }>
  color: string
  yDomain?: [number, number]
  ariaLabel?: string
  children?: ReactNode
}

function SimpleLineChartBase({ data, color, yDomain, ariaLabel, children }: SimpleLineChartProps) {
  const { announce } = useAccessibility()
  const activeIndexRef = useRef(-1)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (data.length === 0) return
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const next = Math.min(activeIndexRef.current + 1, data.length - 1)
      activeIndexRef.current = next
      announce(`Avaliação de ${data[next].date}: ${data[next].value}`)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = Math.max(activeIndexRef.current - 1, 0)
      activeIndexRef.current = prev
      announce(`Avaliação de ${data[prev].date}: ${data[prev].value}`)
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
      <ChartContainer
        config={{ value: { label: 'Valor', color } }}
        className="h-[14rem] md:h-[18rem] w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={yDomain}
            />
            <Tooltip content={<ChartTooltip />} />
            {children}
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
              isAnimationActive
              animationDuration={600}
              animationBegin={0}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
      <span className="sr-only">{data.map((d) => `${d.date}: ${d.value}`).join(', ')}</span>
    </div>
  )
}

export const SimpleLineChart = memo(SimpleLineChartBase)
