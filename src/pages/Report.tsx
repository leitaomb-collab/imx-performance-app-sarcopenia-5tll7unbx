import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Printer,
  FileDown,
  Pencil,
  AlertCircle,
  FileX,
  AlertTriangle,
  ScrollText,
  CheckCircle2,
  FileText,
} from 'lucide-react'
import { BackButton } from '@/components/BackButton'
import { ReportHeader } from '@/components/report/ReportHeader'
import { ReportSkeleton } from '@/components/report/ReportSkeleton'
import { Section1PatientSummary } from '@/components/report/Section1PatientSummary'
import { Section2MuscleStrength } from '@/components/report/Section2MuscleStrength'
import { Section3MuscleMass } from '@/components/report/Section3MuscleMass'
import { Section4PhysicalPerformance } from '@/components/report/Section4PhysicalPerformance'
import { Section5Diagnosis } from '@/components/report/Section5Diagnosis'
import { Section6Recommendations } from '@/components/report/Section6Recommendations'
import { Section7Trends } from '@/components/report/Section7Trends'
import { ReportPrint } from '@/components/report/ReportPrint'
import { FinalizeDialog } from '@/components/assessment/detail/FinalizeDialog'
import { formatDateCuritibaBR } from '@/lib/report-utils'
import { usePrintStyles } from '@/hooks/use-print-styles'
import type { Patient, User, Assessment } from '@/types'

export default function Report() {
  const { id } = useParams()
  const { handlePrint } = usePrintStyles()
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [historical, setHistorical] = useState<Assessment[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [finalizeOpen, setFinalizeOpen] = useState(false)

  const loadData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(false)
    setNotFound(false)
    try {
      const record = await pb
        .collection('assessments')
        .getOne(id, { expand: 'patientId,evaluatorId' })
      setData(record as Record<string, unknown>)

      const patientId = (record as Record<string, unknown>).patientId as string
      try {
        const history = await pb.collection('assessments').getFullList({
          filter: `patientId = "${patientId}"`,
          sort: 'assessmentDate',
        })
        setHistorical(history as unknown as Assessment[])
      } catch {
        setHistorical(null)
      }
    } catch (err: unknown) {
      const statusErr = err as { status?: number }
      if (statusErr?.status === 404) setNotFound(true)
      else {
        setError(true)
        toast.error('Não foi possível carregar o relatório')
      }
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
        <BackButton fallback="/dashboard" />
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

  const patient = (data.expand as Record<string, unknown> | undefined)?.patientId as Patient | null
  const evaluator = (data.expand as Record<string, unknown> | undefined)?.evaluatorId as User | null
  const isDraft = data.status === 'rascunho'

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-semibold">Dados do paciente não encontrados</p>
        <Button asChild>
          <Link to="/pacientes">Voltar para Pacientes</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="report-action-bar sticky top-0 z-30 border-b border-border flex items-center justify-between -mx-4 px-4 md:-mx-6 md:px-6 mb-8">
        <BackButton
          fallback="/dashboard"
          variant="secondary"
          className="report-btn-secondary h-11 rounded-lg duration-200"
        />
        <div className="flex items-center gap-2">
          <Button
            className="report-btn-print h-11 rounded-lg duration-200"
            onClick={handlePrint}
            disabled={isDraft}
            aria-label="Imprimir"
          >
            <Printer className="h-4 w-4" />
            <span className="report-btn-label ml-1">Imprimir</span>
          </Button>
          <Button
            variant="secondary"
            className="report-btn-secondary h-11 rounded-lg duration-200"
            onClick={handlePrint}
            disabled={isDraft}
            aria-label="Baixar PDF"
          >
            <FileDown className="h-4 w-4" />
            <span className="report-btn-label ml-1">Baixar PDF</span>
          </Button>
          {!isDraft && (
            <Button
              variant="secondary"
              className="report-btn-secondary h-11 rounded-lg duration-200"
              asChild
            >
              <Link to={`/sumario/${id}`} aria-label="Sumário">
                <ScrollText className="h-4 w-4" />
                <span className="report-btn-label ml-1">Sumário</span>
              </Link>
            </Button>
          )}
          <Button
            variant="secondary"
            className="report-btn-secondary h-11 rounded-lg duration-200"
            asChild
          >
            <Link to={`/resumo/${id}`} aria-label="Ver Resumo">
              <FileText className="h-4 w-4" />
              <span className="report-btn-label ml-1">Ver Resumo</span>
            </Link>
          </Button>
          {isDraft && (
            <Button
              variant="secondary"
              className="report-btn-secondary h-11 rounded-lg duration-200"
              asChild
            >
              <Link to={`/avaliacao/${id}`} aria-label="Editar Avaliação">
                <Pencil className="h-4 w-4" />
                <span className="report-btn-label ml-1">Editar Avaliação</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      {isDraft && (
        <div className="report-draft-warning mb-4 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-sm">Esta é uma versão de rascunho</p>
            <p className="text-sm text-muted-foreground">
              Esta avaliação ainda não foi finalizada. Finalize-a para gerar um relatório completo.
            </p>
          </div>
          <Button size="sm" className="shrink-0" onClick={() => setFinalizeOpen(true)}>
            <CheckCircle2 className="h-4 w-4 mr-1" /> Finalizar Avaliação
          </Button>
        </div>
      )}

      <FinalizeDialog
        open={finalizeOpen}
        onOpenChange={setFinalizeOpen}
        assessmentId={data.id as string}
        currentDiagnosis={(data.finalDiagnosis as string) || 'nao_avaliado'}
        onSuccess={loadData}
      />

      <div className="report-document bg-card border border-border rounded-none md:rounded-lg md:shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden md:my-8 animate-fade-in">
        <div className="report-accent-bar" />
        <div className="p-5 md:p-10 report-body space-y-8">
          <div className="screen-only">
            <ReportHeader patient={patient} assessment={data} evaluator={evaluator} />
            <Section1PatientSummary
              assessment={data}
              patient={patient}
              allAssessments={(historical as unknown as Record<string, unknown>[]) ?? undefined}
            />
            <Section2MuscleStrength
              assessment={data}
              patient={patient}
              allAssessments={(historical as unknown as Record<string, unknown>[]) ?? undefined}
            />
            <Section3MuscleMass
              assessment={data}
              patient={patient}
              allAssessments={(historical as unknown as Record<string, unknown>[]) ?? undefined}
            />
            <Section4PhysicalPerformance
              assessment={data}
              allAssessments={(historical as unknown as Record<string, unknown>[]) ?? undefined}
            />
            <Section5Diagnosis assessment={data} patient={patient} />
            <Section6Recommendations assessment={data} />
            <Section7Trends historicalAssessments={historical} patient={patient} />
          </div>
          <ReportPrint assessment={data} patient={patient} evaluator={evaluator} />
          <footer className="mt-8 pt-6 border-t border-border/60 text-center text-xs text-muted-foreground break-inside-avoid">
            <p>{formatDateCuritibaBR(new Date().toISOString())}</p>
            <p className="mt-1">
              IEMEX Performance — Avaliação funcional e monitoramento de sarcopenia
            </p>
            {evaluator && <p className="mt-1">Avaliador: {evaluator.name}</p>}
            <div className="report-footer-signature">
              <p className="text-xs">{evaluator?.name || 'Avaliador responsável'}</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
