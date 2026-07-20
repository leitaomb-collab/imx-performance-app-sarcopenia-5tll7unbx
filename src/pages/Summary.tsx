import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Printer, FileDown, AlertCircle, FileX, AlertTriangle } from 'lucide-react'
import { BackButton } from '@/components/BackButton'
import { useSummaryData } from '@/hooks/use-summary-data'
import { usePrintStyles } from '@/hooks/use-print-styles'
import { SummaryHeader } from '@/components/summary/SummaryHeader'
import { SummaryCards } from '@/components/summary/SummaryCards'
import { SummarySkeleton } from '@/components/summary/SummarySkeleton'
import { buildSummaryCards } from '@/lib/summary-cards'
import { formatDateExtendedBR } from '@/lib/report-utils'
import { stripHtml } from '@/lib/report-utils'

export default function Summary() {
  const { id } = useParams()
  const { handlePrint } = usePrintStyles()
  const {
    assessment,
    patient,
    evaluator,
    prevAssessment,
    allAssessments,
    loading,
    error,
    notFound,
    isDraft,
    retry,
  } = useSummaryData(id)

  if (loading) return <SummarySkeleton />

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <FileX className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-semibold">Sumário não encontrado</p>
        <Button asChild>
          <Link to="/dashboard">Voltar ao Dashboard</Link>
        </Button>
      </div>
    )
  }

  if (error || !assessment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>Não foi possível carregar o sumário.</AlertDescription>
        </Alert>
        <Button onClick={retry}>Tentar novamente</Button>
      </div>
    )
  }

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

  const cards = buildSummaryCards(assessment, prevAssessment, allAssessments, patient)
  const summaryText = stripHtml(assessment.clinicalSummary)

  return (
    <div className="max-w-4xl mx-auto" style={{ maxWidth: '52rem' }}>
      <div className="summary-action-bar sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border flex items-center justify-between -mx-4 px-4 py-3 md:-mx-6 md:px-6 mb-4 print:hidden">
        <BackButton
          fallback="/dashboard"
          variant="secondary"
          className="h-11 gap-2 rounded-lg duration-200"
        />
        <div className="flex items-center gap-2">
          <Button className="h-11 gap-2 rounded-lg duration-200" onClick={handlePrint}>
            <Printer className="w-4 h-4" /> Imprimir
          </Button>
          <Button
            variant="secondary"
            className="h-11 gap-2 rounded-lg duration-200"
            onClick={handlePrint}
          >
            <FileDown className="w-4 h-4" /> Baixar PDF
          </Button>
        </div>
      </div>

      {isDraft && (
        <div className="mb-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Avaliação em rascunho</p>
            <p className="text-sm text-muted-foreground">
              Esta avaliação ainda não foi finalizada. Finalize-a para gerar um sumário completo.
            </p>
          </div>
        </div>
      )}

      <div className="summary-document bg-card border border-border rounded-lg shadow-lg overflow-hidden my-4 animate-summary-enter">
        <div className="p-4 md:p-8">
          <SummaryHeader patient={patient} assessment={assessment} evaluator={evaluator} />
          <SummaryCards cards={cards} />

          {summaryText && (
            <div className="summary-clinical-summary mt-4 p-3 border border-border rounded-lg max-h-24 overflow-hidden break-inside-avoid bg-secondary/30">
              <h2 className="text-sm font-semibold mb-1">Síntese Clínica</h2>
              <p className="text-xs text-muted-foreground line-clamp-4">{summaryText}</p>
            </div>
          )}

          <div className="mt-3 text-xs text-muted-foreground break-inside-avoid">
            Reavaliação recomendada em {assessment.reassessmentMonths || '-'} meses
          </div>

          <footer className="mt-6 pt-4 border-t border-border text-center text-xs break-inside-avoid">
            <p>{formatDateExtendedBR(assessment.assessmentDate)}</p>
            {evaluator && (
              <div className="mt-4">
                <p className="text-muted-foreground">{evaluator.name}</p>
                <div className="summary-footer-line mx-auto mt-1 w-40 border-t border-border" />
                <p className="text-[10px] text-muted-foreground mt-0.5">Avaliador</p>
              </div>
            )}
          </footer>
        </div>
      </div>
    </div>
  )
}
