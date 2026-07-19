import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEP_TITLES = [
  'Identificação',
  'Sinais Vitais',
  'Bioimpedância',
  'Antropometria',
  'Avaliação Postural',
  'Força Muscular',
  'Equilíbrio',
  'Força Respiratória',
  'Espirometria',
  'Triagem Sarcopenia',
  'Análise EWGSOP2',
  'Conclusão',
]

export function WizardSidebar({
  currentStep,
  onStepClick,
}: {
  currentStep: number
  onStepClick: (step: number) => void
}) {
  return (
    <nav className="hidden md:block w-56 shrink-0">
      <ol className="space-y-1">
        {STEP_TITLES.map((title, idx) => {
          const isComplete = idx < currentStep
          const isCurrent = idx === currentStep
          return (
            <li key={idx}>
              <button
                type="button"
                onClick={() => onStepClick(idx)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  isCurrent && 'bg-primary/10 font-medium text-primary',
                  !isCurrent && 'hover:bg-muted',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    isComplete && 'bg-green-500 text-white',
                    isCurrent && 'bg-primary text-primary-foreground',
                    !isComplete && !isCurrent && 'bg-muted text-muted-foreground',
                  )}
                >
                  {isComplete ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                </span>
                <span className="truncate">{title}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
