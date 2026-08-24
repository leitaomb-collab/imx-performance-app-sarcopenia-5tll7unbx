import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPaciente } from '@/services/pacientes'
import { getAvaliacoes } from '@/services/avaliacoes'
import { askAnalyst } from '@/services/ai'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Brain, Plus, Activity } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { createChartDot } from '@/components/dashboard/chart-dot'

export default function PacienteDetail() {
  const { id } = useParams()
  const { toast } = useToast()
  const [paciente, setPaciente] = useState<any>(null)
  const [avaliacoes, setAvaliacoes] = useState<any[]>([])
  const [insight, setInsight] = useState('')
  const [loadingAi, setLoadingAi] = useState(false)

  const loadData = async () => {
    if (!id) return
    const p = await getPaciente(id)
    setPaciente(p)
    const a = await getAvaliacoes(id)
    setAvaliacoes(a)
  }

  useEffect(() => {
    loadData()
  }, [id])
  useRealtime('avaliacoes', loadData)

  const generateInsight = async () => {
    setLoadingAi(true)
    try {
      const msg = `Resuma o status atual e a evolução do paciente ${paciente.name} com base em seu histórico.`
      const res = await askAnalyst(msg)
      setInsight(res.content)
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao gerar insight.', variant: 'destructive' })
    } finally {
      setLoadingAi(false)
    }
  }

  if (!paciente) return null

  const chartData = [...avaliacoes]
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .map((x) => ({
      data: format(new Date(x.data), 'MMM/yy', { locale: ptBR }),
      score: (x.metrics?.force || 0) + (x.metrics?.height || 0),
    }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{paciente.name}</h1>
          <p className="text-muted-foreground">{paciente.gender}</p>{' '}
        </div>
        <Button asChild>
          <Link to={`/avaliacao/nova?pacienteId=${paciente.id}`}>
            <Plus className="mr-2 h-4 w-4" /> Nova Avaliação
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="historico">
            <TabsList>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
              <TabsTrigger value="graficos">Gráficos de Evolução</TabsTrigger>
            </TabsList>
            <TabsContent value="historico" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {avaliacoes.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhuma avaliação encontrada.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {avaliacoes.map((av) => (
                        <div
                          key={av.id}
                          className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0"
                        >
                          <div>
                            <p className="font-semibold">{av.tipo}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(av.data), 'dd/MM/yyyy HH:mm')}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/avaliacao/${av.id}`}>Ver Resultado</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="graficos" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Evolução (Score Agregado)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{ score: { label: 'Score', color: 'hsl(var(--primary))' } }}
                    className="h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="data" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Brain className="h-5 w-5" />
                AI Analyst
              </CardTitle>
              <CardDescription>Resumo e insights automatizados</CardDescription>
            </CardHeader>
            <CardContent>
              {insight ? (
                <div className="prose prose-sm dark:prose-invert">
                  <p className="text-sm leading-relaxed">{insight}</p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Button onClick={generateInsight} disabled={loadingAi || avaliacoes.length === 0}>
                    {loadingAi ? 'Analisando...' : 'Gerar Insight'}
                  </Button>
                  {avaliacoes.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Requer histórico de avaliações
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
