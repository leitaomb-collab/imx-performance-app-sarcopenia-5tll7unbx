import { memo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import type { Patient } from '@/types'
import {
  calculateAge,
  calculateIMC,
  formatGender,
  getIMCCategory,
  getIMCColorClass,
} from '@/lib/patient-utils'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { useInView } from '@/hooks/use-in-view'

interface PatientCardProps {
  patient: Patient
  onDelete: (patient: Patient) => void
  isFadingOut?: boolean
  onPrefetch?: () => void
  index?: number
  entranceMode?: 'initial' | 'filter'
  useViewportAnim?: boolean
}

function PatientCardBase({
  patient,
  onDelete,
  isFadingOut,
  onPrefetch,
  index = 0,
  entranceMode = 'initial',
  useViewportAnim = false,
}: PatientCardProps) {
  const reducedMotion = useReducedMotion()
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.1, rootMargin: '50px' })

  const age = patient.birthDate ? calculateAge(patient.birthDate) : null
  const hasIMC =
    patient.weight != null && patient.height != null && patient.weight > 0 && patient.height > 0
  const imc = hasIMC ? calculateIMC(patient.weight!, patient.height!) : null

  const handleDelete = useCallback(() => onDelete(patient), [onDelete, patient])
  const handleMouseEnter = useCallback(() => onPrefetch?.(), [onPrefetch])

  const shouldAnimate = !useViewportAnim || inView
  const staggerMs = Math.min(index, 20) * (entranceMode === 'filter' ? 30 : 40)

  const entranceClass = isFadingOut
    ? reducedMotion
      ? 'animate-fade-in-200'
      : 'animate-delete-slide-out'
    : shouldAnimate
      ? reducedMotion
        ? 'animate-fade-in-200'
        : entranceMode === 'filter'
          ? 'animate-card-enter-right'
          : 'animate-card-enter'
      : 'opacity-0'

  return (
    <Card
      ref={ref}
      className={cn(
        'flex flex-col',
        !isFadingOut && !reducedMotion && 'patient-card-interactive',
        entranceClass,
      )}
      style={{ '--card-delay': `${staggerMs}ms` } as React.CSSProperties}
      onMouseEnter={handleMouseEnter}
    >
      <CardContent className="flex flex-col gap-3 p-5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/paciente/${patient.id}`}
            viewTransition
            style={{ viewTransitionName: `patient-name-${patient.id}` }}
            className="text-lg font-semibold hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded tactile"
          >
            {patient.name}
          </Link>
          <Badge
            className={cn(
              patient.gender === 'M'
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-pink-500 hover:bg-pink-600',
            )}
          >
            {formatGender(patient.gender)}
          </Badge>
        </div>

        <div className="space-y-1 text-sm text-muted-foreground">
          {age !== null && <p>{age} anos</p>}
          <p>
            {patient.weight != null ? `${patient.weight.toFixed(1)} kg` : 'Peso: -'}
            {' · '}
            {patient.height != null ? `${patient.height.toFixed(2)} m` : 'Altura: -'}
          </p>
        </div>

        {imc !== null && (
          <div className="flex items-center gap-2 text-sm">
            <span className={cn('h-3 w-3 rounded-full shrink-0', getIMCColorClass(imc))} />
            <span className="font-medium">IMC: {imc.toFixed(1)}</span>
            <span className="text-muted-foreground">{getIMCCategory(imc)}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-2">
          <Button variant="outline" className="h-11 tactile" asChild>
            <Link to={`/paciente/${patient.id}`} viewTransition>
              Ver perfil
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0 tactile patient-action-btn"
            aria-label="Excluir paciente"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export const PatientCard = memo(PatientCardBase)
