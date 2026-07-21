import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export const WIZARD_STEPS = [
  'Identificação',
  'Sinais Vitais',
  'Bioimpedância',
  'Força Muscular',
  'Equilíbrio & Mobilidade',
  'Força Respiratória',
  'Rastreamento de Sarcopenia',
  'Análise EWGSOP2',
  'Conclusão',
] as const

interface WizardSidebarProps {
  currentStep: number
  onStepClick: (step: number) => void
}

export function WizardSidebar({ currentStep, onStepClick }: WizardSidebarProps) {
  return (
    <nav aria-label="Etapas da avaliação" className="hidden md:block w-60 shrink-0">
      <div className="sticky top-0">
        <ol className="space-y-1 relative py-2">
          <div
            className="absolute left-[1.875rem] top-6 bottom-6 w-px bg-border"
            aria-hidden="true"
          />
          {WIZARD_STEPS.map((name, i) => {
            const isActive = i === currentStep
            const isComplete = i < currentStep
            return (
              <li key={i} className="relative">
                <button
                  type="button"
                  onClick={() => onStepClick(i)}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`Etapa ${i + 1}: ${name} ${isComplete ? 'concluída' : isActive ? 'atual' : 'pendente'}`}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold z-10 ring-2 ring-card',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : isComplete
                          ? 'bg-green-500 text-white'
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
      </div>
    </nav>
  )
}
