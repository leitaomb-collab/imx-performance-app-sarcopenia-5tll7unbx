import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export const WIZARD_STEPS = [
  'Identificação',
  'Sinais Vitais',
  'Bioimpedância',
  'Antropometria',
  'Avaliação Postural',
  'Força Muscular',
  'Equilíbrio & Mobilidade',
  'Força Respiratória',
  'Espirometria',
  'Triagem de Sarcopenia',
  'Análise EWGSOP2',
  'Conclusão',
] as const

interface WizardSidebarProps {
  currentStep: number
  onStepClick: (step: number) => void
}

export function WizardSidebar({ currentStep, onStepClick }: WizardSidebarProps) {
  return (
    <nav aria-label="Etapas da avaliação" className="hidden md:block w-56 shrink-0">
      <ol className="space-y-1">
        {WIZARD_STEPS.map((name, i) => {
          const isActive = i === currentStep
          const isComplete = i < currentStep
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => onStepClick(i)}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Etapa ${i + 1}: ${name} ${isComplete ? 'concluída' : isActive ? 'atual' : 'pendente'}`}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : isComplete
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground',
                  )}
                >
                  {isComplete ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
                </span>
                <span className="truncate">{name}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
