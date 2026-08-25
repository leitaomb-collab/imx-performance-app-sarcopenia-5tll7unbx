import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { obj } from '@/lib/report-utils'
import type { Patient } from '@/types'
import { Eyebrow } from './ReportTable'

interface RadarProfileProps {
  assessment: Record<string, unknown>
  patient: Patient | null
}

interface RadarDataPoint {
  axis: string
  label: string
  value: number // percentage capped at 120
  rawValue: number | null
  cutoff: number
  unit: string
  isMissing: boolean
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: RadarDataPoint
  }>
}

function CustomRadarTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null
  const data = payload[0].payload

  return (
    <div className="bg-popover/95 backdrop-blur-sm border border-border text-popover-foreground text-xs rounded-md shadow-md p-2.5 min-w-[160px]">
      <p className="font-semibold text-foreground mb-1">{data.label}</p>
      {data.isMissing ? (
        <p className="text-muted-foreground italic">Não avaliado / ausente</p>
      ) : (
        <div className="space-y-1">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Valor obtido:</span>
            <span className="font-medium tabular-nums">
              {data.rawValue} {data.unit}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Referência corte:</span>
            <span className="font-medium tabular-nums">
              {data.cutoff} {data.unit}
            </span>
          </div>
          <div className="flex justify-between gap-3 pt-1 border-t border-border/50">
            <span className="text-muted-foreground">Desempenho:</span>
            <span className="font-bold text-primary tabular-nums">{Math.round(data.value)}%</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function RadarProfile({ assessment, patient }: RadarProfileProps) {
  const gender = patient?.gender ?? 'M'
  const isMale = gender === 'M'

  const ms = obj(assessment.muscleStrength)
  const bc = obj(assessment.bodyComposition)
  const ba = obj(assessment.balanceAssessment)

  // 1. Força: muscleStrength.handgripMax (Cutoff: 27 kg M / 16 kg F)
  const handgripMax =
    typeof ms.handgripMax === 'number'
      ? ms.handgripMax
      : typeof ms.handgripMax === 'string' &&
          ms.handgripMax !== '' &&
          !isNaN(Number(ms.handgripMax))
        ? Number(ms.handgripMax)
        : null
  const forcaCutoff = isMale ? 27 : 16

  // 2. Massa Muscular: bodyComposition.almi (Cutoff: 7.0 kg/m² M / 5.4 kg/m² F)
  const almi =
    typeof bc.almi === 'number'
      ? bc.almi
      : typeof bc.almi === 'string' && bc.almi !== '' && !isNaN(Number(bc.almi))
        ? Number(bc.almi)
        : null
  const massaCutoff = isMale ? 7.0 : 5.4

  // 3. Desempenho: sum of sppbBalance, sppbGait, sppbChair (Cutoff: 12 pts)
  const parseNumOrNull = (val: unknown): number | null => {
    if (typeof val === 'number') return val
    if (typeof val === 'string' && val !== '' && !isNaN(Number(val))) return Number(val)
    return null
  }

  const sppbBalance = parseNumOrNull(ba.sppbBalance)
  const sppbGait = parseNumOrNull(ba.sppbGait)
  const sppbChair = parseNumOrNull(ba.sppbChair)

  const hasAnySppb = sppbBalance !== null || sppbGait !== null || sppbChair !== null
  const sppbSum = hasAnySppb ? (sppbBalance ?? 0) + (sppbGait ?? 0) + (sppbChair ?? 0) : null
  const desempenhoCutoff = 12

  // 4. Mobilidade: balanceAssessment.tugSimple — inverted: min(120, (12 / value) * 100) (Cutoff: ≤ 12s)
  const tugSimple = parseNumOrNull(ba.tugSimple)
  const mobilidadeCutoff = 12

  // 5. Composição: bodyComposition.phaseAngle (Cutoff: 5.0° M / 4.6° F)
  const phaseAngle = parseNumOrNull(bc.phaseAngle)
  const composicaoCutoff = isMale ? 5.0 : 4.6

  // Check if ALL 5 values are missing
  const allMissing =
    handgripMax === null &&
    almi === null &&
    sppbSum === null &&
    tugSimple === null &&
    phaseAngle === null

  // Calculate normalized values capped at 120%
  const calcPercentCap = (val: number | null, cutoff: number): number => {
    if (val === null || cutoff <= 0) return 0
    return Math.min(120, (val / cutoff) * 100)
  }

  const calcTugPercentCap = (val: number | null): number => {
    if (val === null || val <= 0) return 0
    return Math.min(120, (12 / val) * 100)
  }

  const chartData: RadarDataPoint[] = [
    {
      axis: 'Força',
      label: 'Força',
      value: calcPercentCap(handgripMax, forcaCutoff),
      rawValue: handgripMax,
      cutoff: forcaCutoff,
      unit: 'kg',
      isMissing: handgripMax === null,
    },
    {
      axis: 'Massa Muscular',
      label: 'Massa Muscular',
      value: calcPercentCap(almi, massaCutoff),
      rawValue: almi,
      cutoff: massaCutoff,
      unit: 'kg/m²',
      isMissing: almi === null,
    },
    {
      axis: 'Desempenho',
      label: 'Desempenho',
      value: calcPercentCap(sppbSum, desempenhoCutoff),
      rawValue: sppbSum,
      cutoff: desempenhoCutoff,
      unit: 'pts',
      isMissing: sppbSum === null,
    },
    {
      axis: 'Mobilidade',
      label: 'Mobilidade',
      value: calcTugPercentCap(tugSimple),
      rawValue: tugSimple,
      cutoff: mobilidadeCutoff,
      unit: 's',
      isMissing: tugSimple === null,
    },
    {
      axis: 'Composição',
      label: 'Composição',
      value: calcPercentCap(phaseAngle, composicaoCutoff),
      rawValue: phaseAngle,
      cutoff: composicaoCutoff,
      unit: '°',
      isMissing: phaseAngle === null,
    },
  ]

  return (
    <div className="my-4 break-inside-avoid">
      <Eyebrow>Perfil Funcional</Eyebrow>

      {allMissing ? (
        <div className="bg-report-paper-soft rounded-[10px] p-6 text-center mt-2">
          <p className="text-report-ink-soft text-sm italic">
            Dados insuficientes para o perfil clínico
          </p>
        </div>
      ) : (
        <div className="border border-report-line rounded-[10px] p-4 bg-report-paper mt-2">
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} margin={{ top: 10, right: 25, bottom: 10, left: 25 }}>
                <PolarGrid
                  gridType="polygon"
                  stroke="currentColor"
                  className="text-border/60"
                  strokeDasharray="3 3"
                />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  className="text-muted-foreground font-medium"
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 120]}
                  ticks={[30, 60, 100, 120]}
                  tick={{ fill: 'currentColor', fontSize: 10 }}
                  className="text-muted-foreground/60"
                  stroke="currentColor"
                />
                <Tooltip content={<CustomRadarTooltip />} />
                <Radar
                  name="Paciente"
                  dataKey="value"
                  stroke="#0F8B7E"
                  fill="#0F8B7E"
                  fillOpacity={0.25}
                  strokeWidth={2}
                  dot={{
                    r: 4,
                    fill: '#0F8B7E',
                    strokeWidth: 1,
                    stroke: '#FFFFFF',
                  }}
                  activeDot={{
                    r: 6,
                    fill: '#0F8B7E',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-report-line flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
            {chartData.map((item) => (
              <div key={item.axis} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-report-teal shrink-0" />
                <span className="font-medium text-foreground">{item.label}</span>
                {item.isMissing ? (
                  <span className="text-muted-foreground italic">(sem dados)</span>
                ) : (
                  <span className="text-muted-foreground tabular-nums">
                    <span className="font-semibold text-foreground">{Math.round(item.value)}%</span>{' '}
                    ({item.rawValue} / {item.unit === 's' ? `≤ ${item.cutoff}` : item.cutoff}{' '}
                    {item.unit})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
