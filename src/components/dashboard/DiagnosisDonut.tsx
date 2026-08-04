import { memo } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChartContainer } from '@/components/ui/chart'
import { BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DashboardAssessment } from '@/lib/chart-utils'

const DIAGNOSIS_CONFIG = [
  { key: 'normal', label: 'Normal', color: 'hsl(142 76% 47% / 0.4)' },
  { key: 'risco_sarcopenia', label: 'Risco de sarcopenia', color: 'hsl(48 96% 60%)' },
  { key: 'sarcopenia', label: 'Sarcopenia', color: 'hsl(38 92% 55%)' },
  { key: 'sarcopenia_grave', label: 'Sarcopenia grave', color: 'hsl(0 84% 60%)' },
] as const

interface DiagnosisDonutProps {
  assessments: DashboardAssessment[]
}

function DiagnosisDonutBase({ assessments }: DiagnosisDonutProps) {
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
    <Card
      className="chart-card chart-card-enter shadow-subtle rounded-[0.75rem]"
      style={{ animationDelay: '400ms' }}
    >
      <CardHeader>
        <CardTitle>Distribuição de Diagnósticos</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="chart-empty-state animate-fade-in-empty">
            <BarChart3 className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <h3 className="text-sm font-semibold">Sem dados disponíveis</h3>
            <p className="text-xs text-muted-foreground mb-3">Nenhuma avaliação registrada ainda</p>
            <Button asChild size="sm" variant="outline">
              <Link to="/avaliacao/nova">Nova Avaliação</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div
              className="relative w-full h-[220px] md:h-[200px]"
              tabIndex={0}
              role="img"
              aria-label={`Distribuição de diagnósticos: ${total} avaliações concluídas`}
            >
              <ChartContainer config={chartConfig} className="h-[220px] md:h-[200px] w-full">
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
                      paddingAngle={0}
                      stroke="hsl(var(--card))"
                      strokeWidth={3}
                      isAnimationActive
                      animationDuration={500}
                      animationEasing="ease-out"
                    >
                      {data.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [`${value}`, name]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--foreground) / 0.95)',
                        color: 'hsl(var(--background))',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold tabular-nums">{total}</span>
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
            </div>
            <div className="w-full space-y-2">
              {DIAGNOSIS_CONFIG.map((cfg, i) => {
                const count = concluded.filter((a) => a.finalDiagnosis === cfg.key).length
                return (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center justify-between text-sm',
                      count === 0 && 'opacity-50',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: cfg.color }}
                      />
                      <span>{cfg.label}</span>
                    </div>
                    <span className="text-muted-foreground tabular-nums">
                      {count} ({total > 0 ? Math.round((count / total) * 100) : 0}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export const DiagnosisDonut = memo(DiagnosisDonutBase)
