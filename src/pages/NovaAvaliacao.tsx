import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getPacientes } from '@/services/pacientes'
import { createAvaliacao } from '@/services/avaliacoes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

export default function NovaAvaliacao() {
  const [params] = useSearchParams()
  const initialPacienteId = params.get('pacienteId') || ''

  const [pacientes, setPacientes] = useState<any[]>([])
  const [formData, setFormData] = useState({
    paciente: initialPacienteId,
    tipo: '',
    data: new Date().toISOString().slice(0, 16),
    observacoes: '',
    force: '',
    height: '',
  })
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    getPacientes().then(setPacientes)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const metrics = {
        force: Number(formData.force) || 0,
        height: Number(formData.height) || 0,
      }
      const dataToSave = {
        paciente: formData.paciente,
        tipo: formData.tipo,
        data: new Date(formData.data).toISOString(),
        observacoes: formData.observacoes,
        metrics,
      }
      const res = await createAvaliacao(dataToSave)
      toast({ title: 'Sucesso', description: 'Avaliação registrada.' })
      navigate(`/avaliacao/${res.id}`)
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao salvar.', variant: 'destructive' })
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Nova Avaliação</h1>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Preencha os dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Select
                value={formData.paciente}
                onValueChange={(v) => setFormData({ ...formData, paciente: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o paciente" />
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Teste</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(v) => setFormData({ ...formData, tipo: v })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Salto Vertical">Salto Vertical</SelectItem>
                    <SelectItem value="Força Isométrica">Força Isométrica</SelectItem>
                    <SelectItem value="Mobilidade">Mobilidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data e Hora</Label>
                <Input
                  type="datetime-local"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border p-4 rounded-md bg-muted/20">
              <div className="col-span-2">
                <Label className="text-base font-semibold">Métricas (Exemplo)</Label>
              </div>
              <div className="space-y-2">
                <Label>Força (kgf)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.force}
                  onChange={(e) => setFormData({ ...formData, force: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Altura (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações Clínicas</Label>
              <Textarea
                rows={4}
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Avaliação</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
