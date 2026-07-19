import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPaciente, getAvaliacoes, askAgent } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, Activity, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

export default function PatientProfile() {
  const { id } = useParams()
  const [paciente, setPaciente] = useState<any>(null)
  const [avaliacoes, setAvaliacoes] = useState<any[]>([])
  const [insight, setInsight] = useState('')
  const [loadingAi, setLoadingAi] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (id) {
      getPaciente(id)
        .then(setPaciente)
        .catch(() => {})
      getAvaliacoes(id).then(setAvaliacoes)
    }
  }, [id])

  const handleInsight = async () => {
    if (!paciente) return
    setLoadingAi(true)
    try {
      const res = await askAgent(
        `Gere um insight de performance clínico e focado em resultados para o paciente ${paciente.name}, utilizando os dados das avaliações dele.`,
      )
      setInsight(res.content)
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao conectar com o Analista AI.',
        variant: 'destructive',
      })
    }
    setLoadingAi(false)
  }

  if (!paciente) return <div className="p-8 text-center">Carregando perfil...</div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{paciente.name}</h1>
          <p className="text-muted-foreground">
            {paciente.email} • {paciente.phone || 'Sem telefone'}
          </p>
        </div>
        <Link to={`/avaliacao/nova?paciente=${paciente.id}`}>
          <Button>
            <Activity className="mr-2 h-4 w-4" /> Nova Avaliação
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="historico" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="ai">Analista AI</TabsTrigger>
          <TabsTrigger value="notas">Notas</TabsTrigger>
        </TabsList>

        <TabsContent value="historico" className="space-y-4">
          {avaliacoes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma avaliação encontrada.
              </CardContent>
            </Card>
          ) : (
            avaliacoes.map((av) => (
              <Card key={av.id} className="shadow-subtle border-0">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{av.tipo}</CardTitle>
                      <CardDescription>{format(new Date(av.data), 'dd/MM/yyyy')}</CardDescription>
                    </div>
                    <Link to={`/relatorio/${av.id}`}>
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" /> Relatório
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 flex-wrap">
                    {Object.entries(av.metrics || {}).map(([k, v]) => (
                      <div key={k} className="bg-secondary px-3 py-2 rounded-md">
                        <span className="text-xs text-muted-foreground uppercase block">
                          {k.replace('_', ' ')}
                        </span>
                        <span className="font-semibold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="ai">
          <Card className="shadow-subtle border-0 bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Sparkles className="mr-2 h-5 w-5" /> Insight de Performance
              </CardTitle>
              <CardDescription>
                O Analista AI da IMX cruza o histórico do paciente para sugerir direções.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!insight ? (
                <Button onClick={handleInsight} disabled={loadingAi} className="w-full sm:w-auto">
                  {loadingAi ? 'Analisando...' : 'Gerar Insight Agora'}
                </Button>
              ) : (
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none bg-card p-6 rounded-lg border">
                  {insight.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={handleInsight}
                    disabled={loadingAi}
                  >
                    Regerar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notas">
          <Card className="shadow-subtle border-0">
            <CardHeader>
              <CardTitle>Notas Clínicas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{paciente.notes || 'Nenhuma nota registrada.'}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
