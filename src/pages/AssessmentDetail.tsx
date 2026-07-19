import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAvaliacao } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer, ArrowLeft, Activity } from 'lucide-react'
import { format } from 'date-fns'

export default function AssessmentDetail() {
  const { id } = useParams()
  const [aval, setAval] = useState<any>(null)

  useEffect(() => {
    if (id)
      getAvaliacao(id)
        .then(setAval)
        .catch(() => {})
  }, [id])

  if (!aval) return <div className="p-8 text-center">Carregando relatório...</div>

  const handlePrint = () => window.print()

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in print:p-0 print:m-0">
      <div className="flex justify-between items-center print:hidden">
        <Button variant="ghost" asChild>
          <Link to={`/paciente/${aval.paciente}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Perfil
          </Link>
        </Button>
        <Button onClick={handlePrint} variant="outline">
          <Printer className="mr-2 h-4 w-4" /> Imprimir Relatório
        </Button>
      </div>

      <Card className="shadow-subtle border-0 bg-card print:shadow-none print:border-none">
        <CardHeader className="border-b pb-6 text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-primary tracking-tight">
              Relatório de Performance IMX
            </CardTitle>
            <CardDescription className="text-lg mt-1">
              {aval.expand?.paciente?.name}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Tipo
              </p>
              <p className="text-lg font-bold mt-1">{aval.tipo}</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Data
              </p>
              <p className="text-lg font-bold mt-1">{format(new Date(aval.data), 'dd/MM/yyyy')}</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Gênero
              </p>
              <p className="text-lg font-bold mt-1">{aval.expand?.paciente?.gender}</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Avaliador
              </p>
              <p className="text-lg font-bold mt-1">IMX Staff</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold border-b pb-2">Resultados (Métricas)</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {Object.entries(aval.metrics || {}).map(([key, val]) => (
                <div
                  key={key}
                  className="flex justify-between items-center p-4 border rounded-md shadow-sm"
                >
                  <span className="font-medium text-muted-foreground capitalize">
                    {key.replace('_', ' ')}
                  </span>
                  <span className="text-2xl font-bold text-primary">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>

          {aval.observacoes && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold border-b pb-2">Observações Clínicas</h3>
              <p className="text-foreground leading-relaxed p-4 bg-muted/20 rounded-md border">
                {aval.observacoes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
