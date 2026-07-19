import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  calculateAge,
  calculateIMC,
  formatGender,
  getIMCCategory,
  getIMCColorClass,
} from '@/lib/patient-utils'
import { cn } from '@/lib/utils'
import type { Patient } from '@/types'

export function PatientSummaryBar({ patient }: { patient: Patient | null }) {
  if (!patient) return null

  const age = patient.birthDate ? calculateAge(patient.birthDate) : null
  const hasIMC =
    patient.weight != null && patient.height != null && patient.weight > 0 && patient.height > 0
  const imc = hasIMC ? calculateIMC(patient.weight!, patient.height!) : null

  return (
    <Card className="sticky top-0 z-20 border-0 shadow-md bg-card/95 backdrop-blur">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{patient.name}</span>
        </div>
        {age !== null && <Badge variant="secondary">{age} anos</Badge>}
        <Badge
          className={cn(
            patient.gender === 'M'
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'bg-pink-500 hover:bg-pink-600',
          )}
        >
          {formatGender(patient.gender)}
        </Badge>
        {patient.weight != null && (
          <span className="text-sm text-muted-foreground">{patient.weight} kg</span>
        )}
        {patient.height != null && (
          <span className="text-sm text-muted-foreground">{patient.height} m</span>
        )}
        {imc !== null && (
          <Badge variant="secondary" className="gap-1.5">
            <span className={cn('h-2.5 w-2.5 rounded-full', getIMCColorClass(imc))} />
            IMC: {imc.toFixed(1)} ({getIMCCategory(imc)})
          </Badge>
        )}
      </div>
    </Card>
  )
}
