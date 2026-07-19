import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Save, CheckCircle2, CloudUpload } from 'lucide-react'
import { WizardSidebar } from '@/components/assessment/WizardSidebar'
import { PatientSummaryBar } from '@/components/assessment/PatientSummaryBar'
import {
  Step1Identification,
  Step2Vitals,
  Step5Postural,
  Step12Conclusion,
} from '@/components/assessment/steps/StepsBasic'
import { Step3Bioimpedance, Step4Anthropometry } from '@/components/assessment/steps/StepsBody'
import { Step6Strength, Step7Balance } from '@/components/assessment/steps/StepsFunction'
import { Step8Respiratory, Step9Spirometry } from '@/components/assessment/steps/StepsRespiratory'
import { Step10Screening, Step11EWGSOP2 } from '@/components/assessment/steps/StepsDiagnosis'
import type { useAssessmentForm } from '@/hooks/use-assessment-form'
import type { StepProps } from '@/types/assessment'

const STEP_COMPONENTS: Array<(props: StepProps) => React.JSX.Element> = [
  Step1Identification,
  Step2Vitals,
  Step3Bioimpedance,
  Step4Anthropometry,
  Step5Postural,
  Step6Strength,
  Step7Balance,
  Step8Respiratory,
  Step9Spirometry,
  Step10Screening,
  Step11EWGSOP2,
  Step12Conclusion,
]

export function AssessmentWizard({ formHook }: { formHook: ReturnType<typeof useAssessmentForm> }) {
  const [step, setStep] = useState(0)
  const stepProps: StepProps = {
    form: formHook.form,
    patient: formHook.patient,
    updateField: formHook.updateField,
    patients: formHook.patients,
    selectPatient: formHook.selectPatient,
  }
  const StepComponent = STEP_COMPONENTS[step]
  const canProceed = step !== 0 || (!!formHook.form.patientId && !!formHook.form.assessmentDate)

  return (
    <div className="space-y-4">
      <PatientSummaryBar patient={formHook.patient} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nova Avaliação</h1>
        {formHook.lastSaved && !formHook.dirty && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CloudUpload className="h-3.5 w-3.5" /> Salvo automaticamente
          </span>
        )}
        {formHook.saving && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />{' '}
            Salvando...
          </span>
        )}
      </div>

      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Etapa {step + 1} de 12</span>
        </div>
        <Progress value={((step + 1) / 12) * 100} />
      </div>

      <div className="flex gap-6">
        <WizardSidebar currentStep={step} onStepClick={setStep} />
        <div className="flex-1 min-w-0">
          <Card className="border-0 shadow-subtle">
            <CardContent className="pt-6">
              <StepComponent {...stepProps} />
            </CardContent>
          </Card>

          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
            </Button>
            {step < 11 ? (
              <Button disabled={!canProceed} onClick={() => setStep(step + 1)}>
                Próximo <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" disabled={formHook.saving} onClick={formHook.saveDraft}>
                  <Save className="mr-1 h-4 w-4" /> Salvar Rascunho
                </Button>
                <Button disabled={formHook.saving} onClick={formHook.finalize}>
                  <CheckCircle2 className="mr-1 h-4 w-4" /> Finalizar Avaliação
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
