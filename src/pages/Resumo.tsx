import { useMemo, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Printer, Loader2, FileX, AlertCircle, ArrowLeft } from 'lucide-react'
import { usePrintStyles } from '@/hooks/use-print-styles'
import { useResumoData } from '@/hooks/use-resumo-data'
import { buildKpiCards, buildComparativeRows, computeGlobalStatus } from '@/lib/resumo-utils'
import { ResumoKpiCards } from '@/components/resumo/ResumoKpiCards'
import { ResumoTable } from '@/components/resumo/ResumoTable'
import { ResumoSkeleton } from '@/components/resumo/ResumoSkeleton'
import { calculateAge, formatGender, formatDateBR } from '@/lib/patient-utils'

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value}</p>
    </div>
  )
}

export default function Resumo() {
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
    retry,
  } = useResumoData(id)

  const [printing, setPrinting] = useState(false)

  const kpiCards = useMemo(() => {
    if (!assessment || !patient) return []
    return buildKpiCards(
      assessment as unknown as Record<string, unknown>,
      (prevAssessment ?? null) as unknown as Record<string, unknown> | null,
      allAssessments as unknown as Record<string, unknown>[],
      patient.gender,
    )
  }, [assessment, patient, prevAssessment, allAssessments])

  const tableRows = useMemo(() => {
    if (!assessment || !patient) return []
    return buildComparativeRows(
      assessment as unknown as Record<string, unknown>,
      allAssessments as unknown as Record<string, unknown>[],
      patient.gender,
      allAssessments.length > 1,
    )
  }, [assessment, patient, allAssessments])

  const globalStatus = useMemo(() => computeGlobalStatus(kpiCards), [kpiCards])

  useEffect(() => {
    if (error) {
      toast.error('Não foi possível carregar o resumo. Tente novamente', {
        action: { label: 'Tentar novamente', onClick: retry },
      })
    }
  }, [error, retry])

  useEffect(() => {
    const before = () => setPrinting(true)
    const after = () => setPrinting(false)
    window.addEventListener('beforeprint', before)
    window.addEventListener('afterprint', after)
    return () => {
      window.removeEventListener('beforeprint', before)
      window.removeEventListener('afterprint', after)
    }
  }, [])

  if (loading) return <ResumoSkeleton />

  if (notFound) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <FileX className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <p className="text-lg font-semibold">Avaliação não encontrada</p>
          <p className="text-sm text-muted-foreground mt-1">
            A avaliação solicitada não existe ou foi removida
          </p>
        </div>
        {id && (
          <Button asChild>
            <Link to={`/relatorio/${id}`}>Voltar para o relatório</Link>
          </Button>
        )}
      </main>
    )
  }

  if (error || !assessment || !patient) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>Não foi possível carregar o resumo.</AlertDescription>
        </Alert>
        <Button onClick={retry}>Tentar novamente</Button>
      </main>
    )
  }

  return (
    <main className="resumo-page max-w-4xl mx-auto px-4 md:px-6">
      <div className="resumo-print-header hidden print:block">
        <h1 className="text-lg font-bold">Resumo da Avaliação</h1>
        <p className="text-sm">
          {patient.name} • {formatDateBR(assessment.assessmentDate)}
        </p>
      </div>

      <header className="resumo-action-bar sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border flex items-center justify-between py-3 -mx-4 px-4 md:-mx-6 md:px-6 mb-6">
        <Button variant="secondary" className="h-11 rounded-lg" asChild>
          <Link to={`/relatorio/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
        <div className="flex-1 text-center px-2 min-w-0">
          <h1 className="text-base font-semibold truncate">Resumo da Avaliação</h1>
          <p className="text-xs text-muted-foreground truncate">
            {patient.name} • {formatDateBR(assessment.assessmentDate)}
          </p>
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="h-11 w-11 rounded-lg shrink-0"
          onClick={handlePrint}
          aria-label="Imprimir resumo"
        >
          {printing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Printer className="h-4 w-4" />
          )}
        </Button>
      </header>

      <div className="resumo-content space-y-6">
        <section className="resumo-general-card border border-border rounded-lg p-4 md:p-6 break-inside-avoid">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Nome" value={patient.name} />
            <Field label="Idade" value={`${calculateAge(patient.birthDate)} anos`} />
            <Field label="Sexo" value={formatGender(patient.gender)} />
            <Field label="Data de Nascimento" value={formatDateBR(patient.birthDate)} />
            <Field
              label="Tipo de Avaliação"
              value={assessment.status === 'concluida' ? 'Concluída' : 'Rascunho'}
            />
            {evaluator && <Field label="Avaliador" value={evaluator.name} />}
          </div>
        </section>

        <div
          className={`resumo-status-badge rounded-lg p-3 text-center break-inside-avoid ${globalStatus.className}`}
        >
          <span className="font-semibold text-sm">{globalStatus.label}</span>
        </div>

        <ResumoKpiCards cards={kpiCards} />

        <ResumoTable rows={tableRows} hasMultiple={allAssessments.length > 1} />

        <footer className="resumo-footer text-center text-xs text-muted-foreground pt-4 border-t border-border break-inside-avoid">
          <p className="font-semibold">IMX Performance</p>
          <p className="mt-0.5">
            {formatDateBR(assessment.assessmentDate)} • ID: {assessment.id}
          </p>
          <p className="mt-2 italic max-w-md mx-auto">
            Este resumo é um documento informativo. Para interpretação clínica completa, consulte o
            laudo técnico.
          </p>
        </footer>
      </div>
    </main>
  )
}
