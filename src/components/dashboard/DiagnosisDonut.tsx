import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import type { DashboardAssessment } from '@/lib/chart-utils'

const DIAGNOSIS_CONFIG = [
  { key: 'sem_sarcopenia', label: 'Sem sarcopenia', color: 'hsl(220 9% 56%)' },
  { key: 'sarcopenia', label: 'Sarcopenia provável', color: 'hsl(217 91% 60%)' },
  { key: 'sarcopenia_grave', label: 'Sarcopenia grave', color: 'hsl(0 84% 60%)' },
  { key: 'nao_avaliado', label: 'Sem diagnóstico', color: 'hsl(220 14% 80%)' },
] as const

interface DiagnosisDonutProps {
  assessments: DashboardAssessment[]
}

export function DiagnosisDonut({ assessments }: DiagnosisDonutProps) {
  const concluded = assessments.filter((a) => a.status === 'concluida')
  const total = concluded.length

  const data = DIAGNOSIS_CONFIG.map((cfg) => ({
    ...cfg,
    count: concluded.filter((a) => a.finalDiagnosis === cfg.key).length,
  })).filter((d) => d.count > 0)

  const chartConfig = Object.fromEntries(
    DIAGNOSIS_CONFIG.map((c) => [c.key, { label: c.label, color: c.color }]),
  )

  return (
    <Card className="shadow-subtle border-0">
      <CardHeader>
        <CardTitle>Distribuição de Diagnósticos</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
            Sem avaliações
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-full h-[200px]">
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {data.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [`${value}`, name]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold">{total}</span>
                <span className="text-xs text-muted-foreground">Concluídas</span>
              </div>
            </div>
            <div className="w-full space-y-2">
              {data.map((entry, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span>{entry.label}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {entry.count} ({total > 0 ? Math.round((entry.count / total) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
