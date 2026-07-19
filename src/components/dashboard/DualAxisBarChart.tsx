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
}

export function DualAxisBarChart({
  data,
  config,
  leftKey,
  rightKey,
  leftRef,
  rightRef,
}: DualAxisBarChartProps) {
  return (
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
  )
}
