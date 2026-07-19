import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Activity, TrendingUp, AlertCircle } from 'lucide-react'
import { getPacientes, getAvaliacoes } from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'
import { Link } from 'react-router-dom'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Dashboard() {
  const [pacientes, setPacientes] = useState<any[]>([])
  const [avaliacoes, setAvaliacoes] = useState<any[]>([])

  const loadData = async () => {
    getPacientes().then(setPacientes)
    getAvaliacoes().then(setAvaliacoes)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('pacientes', loadData)
  useRealtime('avaliacoes', loadData)

  const thisMonthAv = useMemo(() => {
    const now = new Date()
    return avaliacoes.filter(
      (a) =>
        new Date(a.data).getMonth() === now.getMonth() &&
        new Date(a.data).getFullYear() === now.getFullYear(),
    ).length
  }, [avaliacoes])

  const barData = useMemo(() => {
    const counts: Record<string, number> = {}
    avaliacoes.forEach((a) => (counts[a.tipo] = (counts[a.tipo] || 0) + 1))
    return Object.keys(counts).map((k) => ({ tipo: k, count: counts[k] }))
  }, [avaliacoes])

  const lineData = useMemo(() => {
    const months: Record<string, number> = {}
    avaliacoes.forEach((a) => {
      const m = format(new Date(a.data), 'MMM/yy', { locale: ptBR })
      months[m] = (months[m] || 0) + 1
    })
    return Object.keys(months)
      .map((m) => ({ mes: m, total: months[m] }))
      .reverse()
  }, [avaliacoes])

  const chartConfig = {
    count: { label: 'Avaliações', color: 'hsl(var(--chart-1))' },
    total: { label: 'Total', color: 'hsl(var(--chart-2))' },
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-subtle border-0 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pacientes.length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-subtle border-0 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliações no Mês</CardTitle>
            <Activity className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthAv}</div>
          </CardContent>
        </Card>
        <Card className="shadow-subtle border-0 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12%</div>
            <p className="text-xs text-muted-foreground">Evolução geral</p>
          </CardContent>
        </Card>
        <Card className="shadow-subtle border-0 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendências</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Pacientes inativos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-subtle border-0">
          <CardHeader>
            <CardTitle>Evolução de Avaliações</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="mes"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="var(--color-total)"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-subtle border-0">
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="tipo"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-subtle border-0">
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {avaliacoes.slice(0, 5).map((av) => (
              <div
                key={av.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium">{av.expand?.paciente?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {av.tipo} • {format(new Date(av.data), 'dd/MM/yyyy')}
                  </p>
                </div>
                <Link
                  to={`/avaliacao/${av.id}`}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Ver Relatório
                </Link>
              </div>
            ))}
            {avaliacoes.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-4">
                Nenhuma atividade recente.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
