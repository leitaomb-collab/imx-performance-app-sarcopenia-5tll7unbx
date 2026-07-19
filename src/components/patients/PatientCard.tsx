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

interface PatientCardProps {
  patient: Patient
  onDelete: (patient: Patient) => void
  isFadingOut?: boolean
}

export function PatientCard({ patient, onDelete, isFadingOut }: PatientCardProps) {
  const age = patient.birthDate ? calculateAge(patient.birthDate) : null
  const hasIMC =
    patient.weight != null && patient.height != null && patient.weight > 0 && patient.height > 0
  const imc = hasIMC ? calculateIMC(patient.weight!, patient.height!) : null

  return (
    <Card className={cn('flex flex-col transition-opacity', isFadingOut && 'animate-fade-out')}>
      <CardContent className="flex flex-col gap-3 p-5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/paciente/${patient.id}`}
            className="text-lg font-semibold hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
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
          <Button variant="outline" className="h-11" asChild>
            <Link to={`/paciente/${patient.id}`}>Ver perfil</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            aria-label="Excluir paciente"
            onClick={() => onDelete(patient)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
