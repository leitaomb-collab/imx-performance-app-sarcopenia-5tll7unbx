import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { calculateIMC, formatDateBR, getIMCCategory } from '@/lib/patient-utils'
import { RichText } from '@/components/patients/RichText'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'
import type { Patient } from '@/types'

export function PatientInfoCards({ patient }: { patient: Patient }) {
  const imc = patient.weight && patient.height ? calculateIMC(patient.weight, patient.height) : null
  const prefersReducedMotion = useReducedMotion()

  const cardProps = (i: number) => ({
    className: cn(!prefersReducedMotion && 'animate-fade-in-up'),
    style: !prefersReducedMotion ? { animationDelay: `${i * 50}ms` } : undefined,
  })

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card {...cardProps(0)}>
        <CardHeader>
          <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
            Dados Cadastrais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Nascimento:</span>{' '}
            {formatDateBR(patient.birthDate)}
          </p>
          <p>
            <span className="text-muted-foreground">Peso:</span>{' '}
            {patient.weight != null ? `${patient.weight.toFixed(1)} kg` : '-'}
          </p>
          <p>
            <span className="text-muted-foreground">Estatura:</span>{' '}
            {patient.height != null ? `${patient.height.toFixed(2)} m` : '-'}
          </p>
          {imc !== null && (
            <p>
              <span className="text-muted-foreground">Classificação:</span> {getIMCCategory(imc)}
            </p>
          )}
        </CardContent>
      </Card>
      <Card {...cardProps(1)}>
        <CardHeader>
          <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
            Medicamentos de Uso Contínuo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-32 overflow-y-auto">
            <RichText
              content={patient.chronicMedications}
              emptyMsg="Nenhum medicamento registrado."
            />
          </div>
        </CardContent>
      </Card>
      <Card {...cardProps(2)}>
        <CardHeader>
          <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
            Observações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-32 overflow-y-auto">
            <RichText content={patient.notes} emptyMsg="Sem observações." />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
