import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileText, CheckCircle2, Trash2 } from 'lucide-react'
import { formatDateBR, getDiagnosisInfo } from '@/lib/patient-utils'

interface DetailHeaderProps {
  assessment: Record<string, any>
  isReadOnly: boolean
  onFinalize: () => void
  onDelete: () => void
}

export function DetailHeader({ assessment, isReadOnly, onFinalize, onDelete }: DetailHeaderProps) {
  const dateStr = formatDateBR(assessment.assessmentDate)
  const diagInfo = getDiagnosisInfo(assessment.finalDiagnosis)

  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b -mx-4 px-4 py-3 md:-mx-6 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="h-11">
            <Link to={`/paciente/${assessment.patientId}`}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Link>
          </Button>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{dateStr}</span>
            <Badge
              className={
                assessment.status === 'concluida'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-yellow-500 hover:bg-yellow-600'
              }
            >
              {assessment.status === 'concluida' ? 'Concluída' : 'Rascunho'}
            </Badge>
            {diagInfo && <Badge className={diagInfo.className}>{diagInfo.label}</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isReadOnly ? (
            <Button variant="outline" size="sm" asChild className="h-11">
              <Link to={`/relatorio/${assessment.id}`}>
                <FileText className="h-4 w-4 mr-1" /> Ver Relatório
              </Link>
            </Button>
          ) : (
            <Button size="sm" onClick={onFinalize} className="h-11">
              <CheckCircle2 className="h-4 w-4 mr-1" /> Finalizar
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="h-11"
            aria-label="Excluir avaliação"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
