import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getPacientes, createAvaliacao } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

export default function NewAssessment() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [pacientes, setPacientes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [pacienteId, setPacienteId] = useState(params.get('paciente') || '')
  const [tipo, setTipo] = useState('Salto Vertical')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [obs, setObservacoes] = useState('')

  // Dynamic metrics state
  const [metrics, setMetrics] = useState<Record<string, string>>({})

  useEffect(() => {
    getPacientes().then(setPacientes)
  }, [])

  useEffect(() => {
    setMetrics({}) // reset metrics when type changes
  }, [tipo])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pacienteId)
      return toast({ title: 'Erro', description: 'Selecione um paciente.', variant: 'destructive' })

    setLoading(true)
    try {
      const formattedMetrics: Record<string, number> = {}
      Object.keys(metrics).forEach((k) => {
        formattedMetrics[k] = parseFloat(metrics[k]) || 0
      })

      const avalData = {
        paciente: pacienteId,
        tipo,
        data: new Date(data).toISOString(),
        metrics: formattedMetrics,
        observacoes: obs,
      }

      const res = await createAvaliacao(avalData)
      toast({ title: 'Avaliação Salva', description: 'Os dados foram registrados com sucesso.' })
      navigate(`/avaliacao/${res.id}`)
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a avaliação.',
        variant: 'destructive',
      })
    }
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Nova Avaliação</h1>
      <Card className="shadow-subtle border-0">
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-6 pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Paciente</Label>
                <Select value={pacienteId} onValueChange={setPacienteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {pacientes.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  required
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Tipo de Avaliação</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Salto Vertical">Salto Vertical</SelectItem>
                    <SelectItem value="Força Isométrica">Força Isométrica</SelectItem>
                    <SelectItem value="Mobilidade">Mobilidade</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-6 bg-secondary/50 rounded-lg space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Métricas ({tipo})</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {tipo === 'Salto Vertical' && (
                  <>
                    <div className="space-y-2">
                      <Label>Altura do Salto (cm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={metrics.altura_cm || ''}
                        onChange={(e) => setMetrics({ ...metrics, altura_cm: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pico de Força (N)</Label>
                      <Input
                        type="number"
                        step="1"
                        value={metrics.pico_forca || ''}
                        onChange={(e) => setMetrics({ ...metrics, pico_forca: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}
                {tipo === 'Mobilidade' && (
                  <>
                    <div className="space-y-2">
                      <Label>Score Tornozelo (0-10)</Label>
                      <Input
                        type="number"
                        max="10"
                        value={metrics.score_tornozelo || ''}
                        onChange={(e) =>
                          setMetrics({ ...metrics, score_tornozelo: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Score Quadril (0-10)</Label>
                      <Input
                        type="number"
                        max="10"
                        value={metrics.score_quadril || ''}
                        onChange={(e) => setMetrics({ ...metrics, score_quadril: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}
                {(tipo === 'Força Isométrica' || tipo === 'Outro') && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>Score Geral / Valor Único</Label>
                    <Input
                      type="number"
                      value={metrics.score_geral || ''}
                      onChange={(e) => setMetrics({ ...metrics, score_geral: e.target.value })}
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações Clínicas</Label>
              <Textarea
                rows={4}
                value={obs}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Comportamento durante o teste, dores relatadas, etc."
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-6 bg-muted/20">
            <Button type="button" variant="outline" className="mr-2" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Avaliação'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
