import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Printer, FileDown, Pencil, AlertCircle, FileX, AlertTriangle } from 'lucide-react'
import { BackButton } from '@/components/BackButton'
import { ReportHeader } from '@/components/report/ReportHeader'
import { ReportSectionsA } from '@/components/report/ReportSectionsA'
import { ReportSectionsB } from '@/components/report/ReportSectionsB'
import { ReportSkeleton } from '@/components/report/ReportSkeleton'
import { formatDateExtendedBR } from '@/lib/report-utils'
import type { Patient, User } from '@/types'

export default function Report() {
  const { id } = useParams()
  const [data, setData] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const loadData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(false)
    setNotFound(false)
    try {
      const record = await pb
        .collection('assessments')
        .getOne(id, { expand: 'patientId,evaluatorId' })
      setData(record as Record<string, any>)
    } catch (err: any) {
      if (err?.status === 404) setNotFound(true)
      else setError(true)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="h-12 mb-4" />
        <ReportSkeleton />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <FileX className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-semibold">Avaliação não encontrada</p>
        <Button asChild>
          <Link to="/dashboard">Voltar ao Dashboard</Link>
        </Button>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>Não foi possível carregar o relatório.</AlertDescription>
        </Alert>
        <Button onClick={loadData}>Tentar novamente</Button>
      </div>
    )
  }

  const patient = data.expand?.patientId as Patient | null
  const evaluator = data.expand?.evaluatorId as User | null
  const isDraft = data.status === 'rascunho'

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-semibold">Dados do paciente não encontrados</p>
        <Button asChild>
          <Link to="/dashboard">Voltar ao Dashboard</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="report-action-bar sticky top-0 z-30 h-14 bg-card border-b border-border flex items-center justify-between -mx-4 px-4 md:-mx-6 md:px-6 mb-8">
        <BackButton
          fallback="/dashboard"
          variant="secondary"
          className="h-10 rounded-lg duration-200"
        />
        <div className="flex items-center gap-2">
          <Button
            className="h-10 rounded-lg duration-200"
            onClick={() => window.print()}
            disabled={isDraft}
          >
            <Printer className="h-4 w-4 mr-1" /> Imprimir
          </Button>
          <Button
            variant="secondary"
            className="h-10 rounded-lg duration-200"
            onClick={() => window.print()}
            disabled={isDraft}
          >
            <FileDown className="h-4 w-4 mr-1" /> Baixar PDF
          </Button>
          {isDraft && (
            <Button variant="secondary" className="h-10 rounded-lg duration-200" asChild>
              <Link to={`/avaliacao/${id}`}>
                <Pencil className="h-4 w-4 mr-1" /> Editar Avaliação
              </Link>
            </Button>
          )}
        </div>
      </div>

      {isDraft && (
        <div className="mb-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Avaliação em rascunho</p>
            <p className="text-sm text-muted-foreground">
              Esta avaliação ainda não foi finalizada. Finalize-a para gerar um relatório completo.
            </p>
          </div>
        </div>
      )}

      <div className="report-document bg-card border border-border rounded-none md:rounded-lg md:shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden md:my-8">
        <div className="report-accent-bar" />
        <div className="p-6 md:p-10">
          <ReportHeader patient={patient} assessment={data} evaluator={evaluator} />
          <ReportSectionsA assessment={data} patient={patient} />
          <ReportSectionsB assessment={data} patient={patient} />
          <footer className="mt-8 pt-6 border-t border-border/60 text-center text-xs text-muted-foreground break-inside-avoid">
            <p>Relatório gerado em {formatDateExtendedBR(new Date().toISOString())}</p>
            <p className="mt-1">
              IMX Performance — Protocolo de Monitoramento de Sarcopenia e Risco de Quedas
            </p>
            {evaluator && <p className="mt-1">Avaliador: {evaluator.name}</p>}
          </footer>
        </div>
      </div>
    </div>
  )
}
