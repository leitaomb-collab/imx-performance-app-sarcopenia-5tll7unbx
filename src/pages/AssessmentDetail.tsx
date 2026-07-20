import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAssessment, updateAssessment } from '@/services/assessments'
import { useRealtime } from '@/hooks/use-realtime'
import { BackButton } from '@/components/BackButton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Printer, FileText, ScrollText } from 'lucide-react'
import { format } from 'date-fns'
import { SectionCard } from '@/components/assessment/detail/SectionCard'
import { DefList, obj, isEmpty, type DisplayField } from '@/components/assessment/detail/primitives'
import { DIAGNOSIS_LABELS, STATUS_LABELS } from '@/types'
import type { Assessment } from '@/types'
import { toast } from 'sonner'

const POSTURAL_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'head', label: 'Cabeça/Pescoço' },
  { key: 'shoulders', label: 'Ombros' },
  { key: 'spine', label: 'Coluna' },
  { key: 'pelvis', label: 'Pelve' },
  { key: 'knees', label: 'Joelhos' },
  { key: 'feet', label: 'Tornozelos/Pés' },
  { key: 'observations', label: 'Observações' },
]

export default function AssessmentDetail() {
  const { id } = useParams()
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [editValues, setEditValues] = useState<Record<string, string>>({})

  const loadData = async () => {
    if (!id) return
    try {
      const data = await getAssessment(id)
      setAssessment(data)
    } catch {
      toast.error('Erro ao carregar avaliação.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  useRealtime('assessments', (e) => {
    if (e.record.id === id) {
      setAssessment(e.record as Assessment)
    }
  })

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    )
  }
  if (!assessment) {
    return <div className="p-8 text-center text-muted-foreground">Avaliação não encontrada.</div>
  }

  const pa = obj(assessment.posturalAssessment)
  const isReadOnly = assessment.status === 'concluida'

  const posturalFields: DisplayField[] = POSTURAL_FIELDS.map(({ key, label }) => ({
    label,
    value: pa[key] ?? null,
  }))

  const openEdit = () => {
    setEditValues(
      POSTURAL_FIELDS.reduce(
        (acc, { key }) => ({ ...acc, [key]: pa[key] || '' }),
        {} as Record<string, string>,
      ),
    )
    setEditOpen(true)
  }

  const saveEdit = async () => {
    try {
      const updated = await updateAssessment(assessment.id, {
        posturalAssessment: { ...pa, ...editValues },
      })
      setAssessment(updated)
      setEditOpen(false)
      toast.success('Avaliação postual atualizada.')
    } catch {
      toast.error('Erro ao salvar alterações.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center print:hidden">
        <BackButton fallback="/pacientes" label="Voltar" />
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/relatorio/${assessment.id}`}>
              <FileText className="mr-2 h-4 w-4" /> Gerar Relatório
            </Link>
          </Button>
          {assessment.status === 'concluida' && (
            <Button variant="secondary" asChild>
              <Link to={`/sumario/${assessment.id}`}>
                <ScrollText className="mr-2 h-4 w-4" /> Sumário
              </Link>
            </Button>
          )}
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-2xl">Detalhes da Avaliação</CardTitle>
          <CardDescription>
            {assessment.expand?.patientId?.name ?? 'Paciente'} —{' '}
            {format(new Date(assessment.assessmentDate), 'dd/MM/yyyy')} —{' '}
            {STATUS_LABELS[assessment.status]} —{' '}
            {DIAGNOSIS_LABELS[assessment.finalDiagnosis] ?? 'Não avaliado'}
          </CardDescription>
        </CardHeader>
      </Card>

      <SectionCard
        title="Avaliação Postural"
        empty={isEmpty(pa)}
        readOnly={isReadOnly}
        onEdit={openEdit}
      >
        <DefList fields={posturalFields} />
      </SectionCard>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Avaliação Postural</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {POSTURAL_FIELDS.map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-sm font-medium">{label}</Label>
                {key === 'observations' ? (
                  <Textarea
                    value={editValues[key] || ''}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, [key]: e.target.value }))}
                    rows={3}
                  />
                ) : (
                  <Input
                    value={editValues[key] || ''}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, [key]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
