import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAvaliacao } from '@/services/avaliacoes'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AvaliacaoDetail() {
  const { id } = useParams()
  const [avaliacao, setAvaliacao] = useState<any>(null)

  useEffect(() => {
    if (id) {
      getAvaliacao(id).then(setAvaliacao)
    }
  }, [id])

  if (!avaliacao) return null

  // Mocking comparison for UI presentation
  const TrendIcon = ({ val }: { val: number }) => {
    if (val > 100) return <ArrowUpRight className="text-green-500 h-5 w-5" />
    if (val < 100) return <ArrowDownRight className="text-red-500 h-5 w-5" />
    return <Minus className="text-muted-foreground h-5 w-5" />
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Detalhes da Avaliação</h1>
        <Button variant="outline" asChild>
          <Link to={`/relatorio/${avaliacao.id}`}>
            <FileText className="mr-2 h-4 w-4" /> Gerar Relatório
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{avaliacao.tipo}</CardTitle>
              <p className="text-muted-foreground mt-1">
                Paciente:{' '}
                <Link
                  to={`/paciente/${avaliacao.paciente}`}
                  className="font-medium text-primary hover:underline"
                >
                  {avaliacao.expand?.paciente?.name}
                </Link>
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                {format(new Date(avaliacao.data), "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(avaliacao.data), 'HH:mm')}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Resultados (Métricas)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="bg-background shadow-none border-border">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Força (kgf)</p>
                    <p className="text-2xl font-bold mt-1">{avaliacao.metrics?.force || 0}</p>
                  </div>
                  <TrendIcon val={avaliacao.metrics?.force || 0} />
                </CardContent>
              </Card>
              <Card className="bg-background shadow-none border-border">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Altura (cm)</p>
                    <p className="text-2xl font-bold mt-1">{avaliacao.metrics?.height || 0}</p>
                  </div>
                  <TrendIcon val={avaliacao.metrics?.height || 0} />
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Observações Clínicas</h3>
            <div className="bg-muted/20 p-4 rounded-md border min-h-[100px]">
              <p className="text-sm whitespace-pre-wrap">
                {avaliacao.observacoes || 'Nenhuma observação registrada.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
