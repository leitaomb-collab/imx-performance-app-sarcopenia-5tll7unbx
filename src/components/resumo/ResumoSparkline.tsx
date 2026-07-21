interface ResumoSparklineProps {
  values: number[]
}

export function ResumoSparkline({ values }: ResumoSparklineProps) {
  if (values.length === 0) {
    return <span className="text-[10px] text-muted-foreground">-</span>
  }
  if (values.length === 1) {
    return (
      <svg width="64" height="20" viewBox="0 0 64 20" aria-hidden="true" className="text-primary">
        <circle cx="32" cy="10" r="2.5" fill="currentColor" />
      </svg>
    )
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pad = 3
  const w = 64 - pad * 2
  const h = 20 - pad * 2

  const pts = values.map((v, i) => ({
    x: pad + (i / (values.length - 1)) * w,
    y: pad + h - ((v - min) / range) * h,
  }))

  const d = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')
  const last = pts[pts.length - 1]

  return (
    <svg width="64" height="20" viewBox="0 0 64 20" aria-hidden="true" className="text-primary">
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
        stroke-linecap="round"
        className="resumo-sparkline-path"
      />
      <circle cx={last.x.toFixed(1)} cy={last.y.toFixed(1)} r="2.5" fill="currentColor" />
    </svg>
  )
}
