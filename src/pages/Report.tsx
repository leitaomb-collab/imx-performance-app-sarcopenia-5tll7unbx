import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAvaliacao } from '@/services/avaliacoes'
import { askAnalyst } from '@/services/ai'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer, Brain, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Report() {
  const { id } = useParams()
  const [avaliacao, setAvaliacao] = useState<any>(null)
  const [insight, setInsight] = useState('')
  const [loadingAi, setLoadingAi] = useState(false)

  useEffect(() => {
    if (id) {
      getAvaliacao(id).then(setAvaliacao)
    }
  }, [id])

  const generateInsight = async () => {
    setLoadingAi(true)
    try {
      const msg = `Analise detalhadamente a avaliação do tipo "${avaliacao.tipo}" do paciente ${avaliacao.expand?.paciente?.name}. As métricas foram: Força=${avaliacao.metrics?.force || 0}, Altura=${avaliacao.metrics?.height || 0}. Observações: ${avaliacao.observacoes}. Gere insights e sugestões de treinamento.`
      const res = await askAnalyst(msg)
      setInsight(res.content)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingAi(false)
    }
  }

  if (!avaliacao) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:m-0 print:space-y-4 print:max-w-full">
      <div className="flex justify-between items-center print:hidden">
        <Button variant="ghost" asChild>
          <Link to={`/avaliacao/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Imprimir Relatório
        </Button>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
        {/* Report Header */}
        <div className="bg-primary text-primary-foreground p-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Relatório de Performance</h1>
            <p className="opacity-90 mt-1">IMX Performance</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">
              {format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })}
            </p>
            <p className="text-sm opacity-90">ID: #{avaliacao.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Patient Info */}
          <div className="grid grid-cols-2 gap-8 border-b pb-8">
            <div>
              <h3 className="text-sm text-muted-foreground uppercase font-bold tracking-wider mb-2">
                Dados do Paciente
              </h3>
              <p className="text-lg font-semibold">{avaliacao.expand?.paciente?.name}</p>
              <p>{avaliacao.expand?.paciente?.gender}</p>
              <p>{avaliacao.expand?.paciente?.email}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground uppercase font-bold tracking-wider mb-2">
                Detalhes do Teste
              </h3>
              <p className="text-lg font-semibold">{avaliacao.tipo}</p>
              <p>Realizado em: {format(new Date(avaliacao.data), "dd/MM/yyyy 'às' HH:mm")}</p>
            </div>
          </div>

          {/* Metrics */}
          <div>
            <h3 className="text-xl font-bold mb-4">Resultados das Métricas</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 font-medium">Métrica</th>
                  <th className="py-2 font-medium">Valor Registrado</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(avaliacao.metrics || {}).map(([key, value]) => (
                  <tr key={key} className="border-b last:border-0">
                    <td className="py-3 capitalize">{key}</td>
                    <td className="py-3 font-semibold">{String(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Observations */}
          <div>
            <h3 className="text-xl font-bold mb-4">Observações Clínicas</h3>
            <p className="whitespace-pre-wrap">{avaliacao.observacoes || 'Nenhuma.'}</p>
          </div>

          {/* AI Insight Section */}
          <div className="mt-8 pt-8 border-t">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                <Brain className="h-5 w-5" />
                Interpretação da Inteligência Artificial
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={generateInsight}
                disabled={loadingAi}
                className="print:hidden"
              >
                {loadingAi ? 'Analisando...' : insight ? 'Regerar' : 'Gerar Interpretação'}
              </Button>
            </div>

            {insight ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: insight.replace(/\n/g, '<br/>') }} />
              </div>
            ) : (
              <p className="text-muted-foreground italic text-sm">
                Interpretação não gerada. Clique no botão acima para gerar insights usando a IA da
                IMX.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
