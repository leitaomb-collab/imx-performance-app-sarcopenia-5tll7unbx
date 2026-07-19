import { calculateAge, calculateIMC, formatGender, getIMCCategory } from '@/lib/patient-utils'
import { cn } from '@/lib/utils'
import type { Patient } from '@/types'

function getImcBadgeClass(imc: number): string {
  if (imc >= 18.5 && imc <= 24.9) return 'imc-badge-green'
  if ((imc >= 17 && imc < 18.5) || (imc >= 25 && imc <= 29.9)) return 'imc-badge-yellow'
  return 'imc-badge-red'
}

export function PatientSummaryBar({ patient }: { patient: Patient | null }) {
  if (!patient) return null

  const age = patient.birthDate ? calculateAge(patient.birthDate) : null
  const hasIMC =
    patient.weight != null && patient.height != null && patient.weight > 0 && patient.height > 0
  const imc = hasIMC ? calculateIMC(patient.weight!, patient.height!) : null

  return (
    <div className="sticky top-2 z-20 rounded-lg bg-secondary/90 backdrop-blur">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 px-4 py-3">
        <span className="text-base font-semibold">{patient.name}</span>
        {age !== null && (
          <>
            <Dot />
            <span className="text-sm text-muted-foreground">{age} anos</span>
          </>
        )}
        <Dot />
        <span className="text-sm text-muted-foreground">{formatGender(patient.gender)}</span>
        {patient.weight != null && (
          <>
            <Dot />
            <span className="text-sm text-muted-foreground">{patient.weight} kg</span>
          </>
        )}
        {patient.height != null && (
          <>
            <Dot />
            <span className="text-sm text-muted-foreground">{patient.height} m</span>
          </>
        )}
        {imc !== null && (
          <>
            <Dot />
            <span
              className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                getImcBadgeClass(imc),
              )}
            >
              IMC: {imc.toFixed(1)} ({getIMCCategory(imc)})
            </span>
          </>
        )}
      </div>
    </div>
  )
}

function Dot() {
  return <span className="text-muted-foreground select-none">·</span>
}
