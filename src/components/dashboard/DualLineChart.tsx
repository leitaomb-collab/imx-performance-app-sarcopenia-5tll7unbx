import { useRef } from 'react'
import { useAccessibility } from '@/hooks/use-accessibility'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { ChartTooltip } from './ChartTooltip'

interface DualLineChartProps {
  data: Array<Record<string, any>>
  config: Record<string, { label: string; color: string }>
  line1Key: string
  line2Key: string
  referenceY?: number
  referenceLabel?: string
  yDomain?: [number, number]
  ariaLabel?: string
}

export function DualLineChart({
  data,
  config,
  line1Key,
  line2Key,
  referenceY,
  referenceLabel,
  yDomain,
  ariaLabel,
}: DualLineChartProps) {
  const { announce } = useAccessibility()
  const activeIndexRef = useRef(-1)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (data.length === 0) return
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const next = Math.min(activeIndexRef.current + 1, data.length - 1)
      activeIndexRef.current = next
      announce(`${data[next].date}: ${data[next][line1Key] ?? '-'}, ${data[next][line2Key] ?? '-'}`)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = Math.max(activeIndexRef.current - 1, 0)
      activeIndexRef.current = prev
      announce(`${data[prev].date}: ${data[prev][line1Key] ?? '-'}, ${data[prev][line2Key] ?? '-'}`)
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
            {referenceY != null && (
              <ReferenceLine
                y={referenceY}
                stroke="hsl(var(--destructive))"
                strokeDasharray="4 4"
                label={{ value: referenceLabel, fontSize: 9, fill: 'hsl(var(--destructive))' }}
              />
            )}
            <Line
              type="monotone"
              dataKey={line1Key}
              stroke={`var(--color-${line1Key})`}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
              isAnimationActive
              animationDuration={600}
            />
            <Line
              type="monotone"
              dataKey={line2Key}
              stroke={`var(--color-${line2Key})`}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
              isAnimationActive
              animationDuration={600}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
      <span className="sr-only">
        {data.map((d) => `${d.date}: ${d[line1Key] ?? '-'}, ${d[line2Key] ?? '-'}`).join(', ')}
      </span>
    </div>
  )
}
