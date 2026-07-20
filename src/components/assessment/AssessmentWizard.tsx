import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Save, CheckCircle2, Loader2 } from 'lucide-react'
import { WizardSidebar, WIZARD_STEPS } from '@/components/assessment/WizardSidebar'
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
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const stepProps: StepProps = {
    form: formHook.form,
    patient: formHook.patient,
    updateField: formHook.updateField,
    patients: formHook.patients,
    selectPatient: formHook.selectPatient,
  }
  const StepComponent = STEP_COMPONENTS[step]
  const canProceed = step !== 0 || (!!formHook.form.patientId && !!formHook.form.assessmentDate)
  const progress = ((step + 1) / 12) * 100

  const goToStep = (newStep: number) => {
    setDirection(newStep > step ? 'forward' : 'backward')
    setStep(newStep)
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  return (
    <div className="space-y-4">
      <div className="md:hidden sticky top-0 z-30 bg-background border-b">
        <div className="flex items-center justify-between px-4 h-12">
          <span className="text-sm font-medium" aria-live="polite">
            Etapa {step + 1} de 12: {WIZARD_STEPS[step]}
          </span>
          <div className="flex items-center gap-2">
            {formHook.saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
            {formHook.lastSaved && !formHook.dirty && !formHook.saving && (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            )}
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
        </div>
        <div className="h-1 bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <PatientSummaryBar patient={formHook.patient} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nova Avaliação</h1>
        <div className="hidden md:flex items-center gap-2">
          {formHook.saving && (
            <span className="flex items-center gap-1.5 text-xs text-primary">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Salvando...
            </span>
          )}
          {formHook.lastSaved && !formHook.dirty && !formHook.saving && (
            <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Salvo automaticamente
            </span>
          )}
          {formHook.dirty && !formHook.saving && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full border border-muted-foreground/40" />
              Não salvo
            </span>
          )}
        </div>
      </div>

      <div className="hidden md:block">
        <Progress value={progress} className="h-1" />
      </div>

      <div className="flex gap-6">
        <WizardSidebar currentStep={step} onStepClick={goToStep} />
        <div className="flex-1 min-w-0">
          <Card className="border-0 shadow-subtle">
            <CardContent className="pt-6">
              <div
                key={step}
                className={
                  direction === 'forward' ? 'animate-step-forward' : 'animate-step-backward'
                }
              >
                <StepComponent {...stepProps} />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between mt-4 sticky bottom-0 bg-card/95 backdrop-blur-sm pt-2 pb-[max(0.5rem,var(--sab))] md:pb-2 -mx-4 px-4 md:mx-0 md:px-0 border-t md:border-0">
            <Button
              variant="outline"
              disabled={step === 0}
              onClick={() => goToStep(step - 1)}
              className="h-11 rounded-lg min-h-[44px] transition-transform duration-200 active:scale-[0.98]"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
            </Button>
            {step < 11 ? (
              <Button
                disabled={!canProceed}
                onClick={() => goToStep(step + 1)}
                className="h-11 rounded-lg min-h-[44px] transition-transform duration-200 active:scale-[0.98]"
              >
                Próximo <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={formHook.saving}
                  onClick={formHook.saveDraft}
                  className="h-11 rounded-lg min-h-[44px] transition-transform duration-200 active:scale-[0.98]"
                >
                  {formHook.saving ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-1 h-4 w-4" />
                  )}
                  Salvar Rascunho
                </Button>
                <Button
                  disabled={formHook.saving}
                  onClick={formHook.finalize}
                  className="h-11 rounded-lg min-h-[44px] transition-transform duration-200 active:scale-[0.98]"
                >
                  {formHook.saving ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                  )}
                  Finalizar Avaliação
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
