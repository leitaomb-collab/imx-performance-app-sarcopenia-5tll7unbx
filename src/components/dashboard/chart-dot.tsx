interface ChartDotProps {
  cx?: number
  cy?: number
  r?: number
  fill?: string
  [key: string]: unknown
}

export function createChartDot(radius = 4) {
  return function ChartDot(props: ChartDotProps) {
    const { cx, cy, fill } = props
    if (cx == null || cy == null) return null
    return (
      <g>
        <circle cx={cx} cy={cy} r={22} fill="transparent" style={{ cursor: 'pointer' }} />
        <circle cx={cx} cy={cy} r={radius} fill={fill || 'hsl(var(--primary))'} />
      </g>
    )
  }
}
