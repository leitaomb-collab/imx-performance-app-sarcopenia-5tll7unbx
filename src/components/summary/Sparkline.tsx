import { type TrendDirection } from '@/lib/summary-utils'

interface SparklineProps {
  values: number[]
  direction: TrendDirection | null
}

export function Sparkline({ values, direction }: SparklineProps) {
  if (values.length === 0) {
    return <span className="text-muted-foreground text-[10px]">-</span>
  }

  const color =
    direction === 'improving' ? '#22c55e' : direction === 'worsening' ? '#ef4444' : '#94a3b8'

  if (values.length === 1) {
    return (
      <svg width="50" height="16" viewBox="0 0 50 16" aria-hidden="true">
        <circle cx="25" cy="8" r="2" fill={color} />
      </svg>
    )
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pad = 2
  const w = 50 - pad * 2
  const h = 16 - pad * 2

  const pts = values.map((v, i) => ({
    x: pad + (i / (values.length - 1)) * w,
    y: pad + h - ((v - min) / range) * h,
  }))

  const d = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')
  const last = pts[pts.length - 1]

  return (
    <svg width="50" height="16" viewBox="0 0 50 16" aria-hidden="true">
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={last.x.toFixed(1)} cy={last.y.toFixed(1)} r="2" fill={color} />
    </svg>
  )
}
