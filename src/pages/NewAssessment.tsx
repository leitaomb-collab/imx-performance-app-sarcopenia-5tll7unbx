import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { useAssessmentForm } from '@/hooks/use-assessment-form'
import { AssessmentWizard } from '@/components/assessment/AssessmentWizard'
import { WizardSkeleton } from '@/components/assessment/shared'

export default function NewAssessment() {
  const [params] = useSearchParams()
  const patientId = params.get('patientId')
  const formHook = useAssessmentForm(patientId)

  if (formHook.loading) return <WizardSkeleton />

  if (formHook.error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-lg font-medium">Erro ao carregar dados</p>
        <Button
          onClick={() => {
            formHook.loadData()
          }}
        >
          Tentar novamente
        </Button>
      </div>
    )
  }

  return <AssessmentWizard formHook={formHook} />
}
