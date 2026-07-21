import { memo, useMemo } from 'react'
import { ReferenceLine, ReferenceArea } from 'recharts'
import { ChartCard } from './ChartCard'
import { SimpleLineChart } from './SimpleLineChart'
import { DualAxisBarChart } from './DualAxisBarChart'

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
import { ExportCsvButton } from './ExportCsvButton'

interface LongitudinalChartsProps {
  assessments: DashboardAssessment[]
  patientGender: 'M' | 'F'
  patientId: string
  patientName: string
}

function fmtDate(d: string) {
  return format(new Date(d), 'dd/MM/yy')
}

function singleNote(len: number) {
  return len === 1 ? 'Apenas uma avaliação registrada' : undefined
}

function LongitudinalChartsBase({
  assessments,
  patientGender,
  patientId,
  patientName,
}: LongitudinalChartsProps) {
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
  const pimaxData = useMemo(
    () =>
      sortAssessmentsByDate(assessments)
        .map((a) => {
          const raw = a.respiratoryStrength?.pimaxPercent
          const num = typeof raw === 'string' ? parseFloat(raw) : raw
          return {
            date: format(new Date(a.assessmentDate), 'dd/MM/yyyy'),
            value: num,
          }
        })
        .filter((d): d is { date: string; value: number } => d.value != null && !isNaN(d.value)),
    [assessments],
  )
  const concludedCount = useMemo(
    () => assessments.filter((a) => a.status === 'concluida').length,
    [assessments],
  )

  const hgCutoff = getEWGSOP2HandgripCutoff(patientGender)
  const almiCutoff = getEWGSOP2ALMICutoff(patientGender)
  const fatMid = getFatPercentageMidpoint(patientGender)
  const phaseCutoff = getPhaseAngleCutoff(patientGender)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Acompanhamento Longitudinal</h2>
        <ExportCsvButton
          patientId={patientId}
          patientName={patientName}
          concludedCount={concludedCount}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Força de Preensão Manual (kg)"
          isEmpty={hgData.length === 0}
          note={singleNote(hgData.length)}
          index={0}
        >
          <SimpleLineChart
            data={hgData}
            color="hsl(var(--chart-1))"
            ariaLabel="Força de Preensão Manual em kg"
          >
            <ReferenceLine
              y={hgCutoff}
              stroke="hsl(var(--destructive))"
              strokeDasharray="6 4"
              label={{
                value: `EWGSOP2: ${hgCutoff}`,
                fontSize: 10,
                fill: 'hsl(var(--destructive))',
                position: 'right',
              }}
            />
          </SimpleLineChart>
        </ChartCard>
        <ChartCard
          title="ALMI (kg/m²)"
          isEmpty={almiData.length === 0}
          note={singleNote(almiData.length)}
          index={1}
        >
          <SimpleLineChart data={almiData} color="hsl(var(--chart-2))" ariaLabel="ALMI em kg/m²">
            <ReferenceLine
              y={almiCutoff}
              stroke="hsl(var(--destructive))"
              strokeDasharray="6 4"
              label={{
                value: `Cutoff: ${almiCutoff}`,
                fontSize: 10,
                fill: 'hsl(var(--destructive))',
                position: 'right',
              }}
            />
          </SimpleLineChart>
        </ChartCard>
        <ChartCard
          title="SPPB (0-12)"
          isEmpty={sppbData.length === 0}
          note={singleNote(sppbData.length)}
          index={2}
        >
          <SimpleLineChart
            data={sppbData}
            color="hsl(var(--chart-3))"
            yDomain={[0, 12]}
            ariaLabel="SPPB de 0 a 12"
          >
            <ReferenceLine
              y={8}
              stroke="hsl(0 84% 60%)"
              strokeDasharray="6 4"
              label={{ value: 'Baixo', fontSize: 9, fill: 'hsl(0 84% 60%)', position: 'right' }}
            />
            <ReferenceLine
              y={10}
              stroke="hsl(142 71% 45%)"
              strokeDasharray="6 4"
              label={{ value: 'Bom', fontSize: 9, fill: 'hsl(142 71% 45%)', position: 'right' }}
            />
          </SimpleLineChart>
        </ChartCard>
        <ChartCard
          title="TUG (s)"
          isEmpty={tugData.length === 0}
          note={singleNote(tugData.length)}
          index={3}
        >
          <SimpleLineChart data={tugData} color="hsl(var(--chart-4))" ariaLabel="TUG em segundos">
            <ReferenceArea
              y1={0}
              y2={10}
              fill="hsl(142 71% 45%)"
              fillOpacity={0.08}
              label={{
                value: 'Normal',
                position: 'insideRight',
                fill: 'hsl(142 71% 45%)',
                fillOpacity: 0.7,
                fontSize: 9,
              }}
            />
            <ReferenceArea
              y1={10}
              y2={19}
              fill="hsl(45 93% 47%)"
              fillOpacity={0.08}
              label={{
                value: 'Intermediário',
                position: 'insideRight',
                fill: 'hsl(45 93% 47%)',
                fillOpacity: 0.7,
                fontSize: 9,
              }}
            />
            <ReferenceArea
              y1={19}
              y2={60}
              fill="hsl(0 84% 60%)"
              fillOpacity={0.08}
              label={{
                value: 'Risco',
                position: 'insideRight',
                fill: 'hsl(0 84% 60%)',
                fillOpacity: 0.7,
                fontSize: 9,
              }}
            />
          </SimpleLineChart>
        </ChartCard>
        <ChartCard
          title="% Gordura e Ângulo de Fase"
          isEmpty={bodyCompData.length === 0}
          note={singleNote(bodyCompData.length)}
          index={4}
        >
          <DualAxisBarChart
            data={bodyCompData}
            config={{
              fat: { label: '% Gordura', color: 'hsl(var(--primary))' },
              phase: { label: 'Ângulo de Fase', color: 'hsl(280 65% 60%)' },
            }}
            leftKey="fat"
            rightKey="phase"
            leftRef={fatMid}
            rightRef={phaseCutoff}
            ariaLabel="Percentual de gordura e ângulo de fase"
          />
        </ChartCard>
        <ChartCard
          title="Velocidade de Marcha (SPPB Gait, 0-4)"
          isEmpty={gaitData.length === 0}
          note={singleNote(gaitData.length)}
          index={5}
        >
          <SimpleLineChart
            data={gaitData}
            color="hsl(var(--chart-5))"
            yDomain={[0, 4]}
            ariaLabel="Velocidade de Marcha SPPB Gait de 0 a 4"
          >
            <ReferenceLine
              y={1}
              stroke="hsl(var(--destructive))"
              strokeDasharray="6 4"
              label={{
                value: 'Risco',
                fontSize: 10,
                fill: 'hsl(var(--destructive))',
                position: 'right',
              }}
            />
          </SimpleLineChart>
        </ChartCard>
        <ChartCard
          title="PImax (% do Predito)"
          isEmpty={pimaxData.length === 0}
          emptyMessage="Nenhuma avaliação com medida de PImax registrada"
          note={singleNote(pimaxData.length)}
          index={6}
        >
          <SimpleLineChart
            data={pimaxData}
            color="hsl(var(--primary))"
            yDomain={[0, 120]}
            label="PImax"
            valueSuffix="%"
            ariaLabel="PImax em percentual do predito"
          >
            <ReferenceLine
              y={80}
              stroke="hsl(var(--destructive))"
              strokeDasharray="6 4"
              label={{
                value: 'Limite 80%',
                fontSize: 10,
                fill: 'hsl(var(--destructive))',
                position: 'insideTop',
              }}
            />
          </SimpleLineChart>
        </ChartCard>{' '}
      </div>
    </div>
  )
}

export const LongitudinalCharts = memo(LongitudinalChartsBase)
