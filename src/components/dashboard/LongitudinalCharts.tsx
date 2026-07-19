import { useMemo } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { ChartCard } from './ChartCard'
import { SimpleLineChart } from './SimpleLineChart'
import {
  extractChartData,
  sortAssessmentsByDate,
  getEWGSOP2HandgripCutoff,
  getEWGSOP2ALMICutoff,
  getPhaseAngleCutoff,
  getFatPercentageMidpoint,
  type DashboardAssessment,
} from '@/lib/chart-utils'
import { format } from 'date-fns'

interface LongitudinalChartsProps {
  assessments: DashboardAssessment[]
  patientGender: 'M' | 'F'
}

function fmtDate(d: string) {
  return format(new Date(d), 'dd/MM/yy')
}

function singleNote(len: number) {
  return len === 1 ? 'Apenas uma avaliação registrada' : undefined
}

export function LongitudinalCharts({ assessments, patientGender }: LongitudinalChartsProps) {
  const hgData = useMemo(
    () => extractChartData(assessments, (a) => a.muscleStrength?.handgripMax),
    [assessments],
  )
  const almiData = useMemo(
    () => extractChartData(assessments, (a) => a.bodyComposition?.almi),
    [assessments],
  )
  const sppbData = useMemo(
    () => extractChartData(assessments, (a) => a.balanceAssessment?.sppbTotal),
    [assessments],
  )
  const tugData = useMemo(
    () => extractChartData(assessments, (a) => a.balanceAssessment?.tugSimple),
    [assessments],
  )
  const gaitData = useMemo(
    () => extractChartData(assessments, (a) => a.balanceAssessment?.sppbGait),
    [assessments],
  )
  const bodyCompData = useMemo(
    () =>
      sortAssessmentsByDate(assessments)
        .map((a) => ({
          date: fmtDate(a.assessmentDate),
          fat: a.bodyComposition?.fatPercentage,
          phase: a.bodyComposition?.phaseAngle,
        }))
        .filter((d) => d.fat != null || d.phase != null),
    [assessments],
  )
  const spiroData = useMemo(
    () =>
      sortAssessmentsByDate(assessments)
        .map((a) => ({
          date: fmtDate(a.assessmentDate),
          fev1: a.spirometry?.fev1Percent,
          cvf: a.spirometry?.fvcPercent,
        }))
        .filter((d) => d.fev1 != null || d.cvf != null),
    [assessments],
  )

  const hgCutoff = getEWGSOP2HandgripCutoff(patientGender)
  const almiCutoff = getEWGSOP2ALMICutoff(patientGender)
  const fatMid = getFatPercentageMidpoint(patientGender)
  const phaseCutoff = getPhaseAngleCutoff(patientGender)

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Evolução Longitudinal</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard
          title="Força de Preensão Manual (kg)"
          isEmpty={hgData.length === 0}
          note={singleNote(hgData.length)}
        >
          <SimpleLineChart data={hgData} color="hsl(var(--chart-1))">
            <ReferenceLine
              y={hgCutoff}
              stroke="hsl(var(--destructive))"
              strokeDasharray="4 4"
              label={{
                value: `EWGSOP2: ${hgCutoff}`,
                fontSize: 10,
                fill: 'hsl(var(--destructive))',
              }}
            />
          </SimpleLineChart>
        </ChartCard>

        <ChartCard
          title="ALMI (kg/m²)"
          isEmpty={almiData.length === 0}
          note={singleNote(almiData.length)}
        >
          <SimpleLineChart data={almiData} color="hsl(var(--chart-2))">
            <ReferenceLine
              y={almiCutoff}
              stroke="hsl(var(--destructive))"
              strokeDasharray="4 4"
              label={{
                value: `Cutoff: ${almiCutoff}`,
                fontSize: 10,
                fill: 'hsl(var(--destructive))',
              }}
            />
          </SimpleLineChart>
        </ChartCard>

        <ChartCard
          title="SPPB (0-12)"
          isEmpty={sppbData.length === 0}
          note={singleNote(sppbData.length)}
        >
          <SimpleLineChart data={sppbData} color="hsl(var(--chart-3))" yDomain={[0, 12]}>
            <ReferenceLine
              y={8}
              stroke="hsl(0 84% 60%)"
              strokeDasharray="4 4"
              label={{ value: 'Baixo desempenho', fontSize: 9, fill: 'hsl(0 84% 60%)' }}
            />
            <ReferenceLine
              y={10}
              stroke="hsl(142 71% 45%)"
              strokeDasharray="4 4"
              label={{ value: 'Bom desempenho', fontSize: 9, fill: 'hsl(142 71% 45%)' }}
            />
          </SimpleLineChart>
        </ChartCard>

        <ChartCard title="TUG (s)" isEmpty={tugData.length === 0} note={singleNote(tugData.length)}>
          <SimpleLineChart data={tugData} color="hsl(var(--chart-4))">
            <ReferenceArea y1={0} y2={10} fill="hsl(142 71% 45%)" fillOpacity={0.08} />
            <ReferenceArea y1={10} y2={19} fill="hsl(45 93% 47%)" fillOpacity={0.08} />
            <ReferenceArea y1={19} y2={60} fill="hsl(0 84% 60%)" fillOpacity={0.08} />
          </SimpleLineChart>
        </ChartCard>

        <ChartCard
          title="% Gordura e Ângulo de Fase"
          isEmpty={bodyCompData.length === 0}
          note={singleNote(bodyCompData.length)}
        >
          <ChartContainer
            config={{
              fat: { label: '% Gordura', color: 'hsl(var(--chart-1))' },
              phase: { label: 'Ângulo de Fase', color: 'hsl(var(--chart-2))' },
            }}
            className="h-[200px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bodyCompData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Tooltip content={<ChartTooltipContent />} />
                <ReferenceLine
                  yAxisId="left"
                  y={fatMid}
                  stroke="var(--color-fat)"
                  strokeDasharray="4 4"
                />
                <ReferenceLine
                  yAxisId="right"
                  y={phaseCutoff}
                  stroke="var(--color-phase)"
                  strokeDasharray="4 4"
                />
                <Bar yAxisId="left" dataKey="fat" fill="var(--color-fat)" radius={[4, 4, 0, 0]} />
                <Bar
                  yAxisId="right"
                  dataKey="phase"
                  fill="var(--color-phase)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        <ChartCard
          title="Velocidade de Marcha (SPPB Gait, 0-4)"
          isEmpty={gaitData.length === 0}
          note={singleNote(gaitData.length)}
        >
          <SimpleLineChart data={gaitData} color="hsl(var(--chart-5))" yDomain={[0, 4]}>
            <ReferenceLine
              y={1}
              stroke="hsl(var(--destructive))"
              strokeDasharray="4 4"
              label={{ value: 'Risco', fontSize: 10, fill: 'hsl(var(--destructive))' }}
            />
          </SimpleLineChart>
        </ChartCard>

        <ChartCard
          title="VEF₁ e CVF (%)"
          isEmpty={spiroData.length === 0}
          note={singleNote(spiroData.length)}
        >
          <ChartContainer
            config={{
              fev1: { label: 'VEF₁ %', color: 'hsl(var(--chart-1))' },
              cvf: { label: 'CVF %', color: 'hsl(var(--chart-2))' },
            }}
            className="h-[200px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spiroData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  domain={[0, 120]}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <ReferenceLine
                  y={80}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="4 4"
                  label={{ value: 'Limite inferior', fontSize: 9, fill: 'hsl(var(--destructive))' }}
                />
                <Line
                  type="monotone"
                  dataKey="fev1"
                  stroke="var(--color-fev1)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="cvf"
                  stroke="var(--color-cvf)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>
      </div>
    </div>
  )
}
