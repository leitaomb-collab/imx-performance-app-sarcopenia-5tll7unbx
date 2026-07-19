import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { calculateIMC, formatDateBR, getIMCCategory } from '@/lib/patient-utils'
import { RichText } from '@/components/patients/RichText'
import type { Patient } from '@/types'

export function PatientInfoCards({ patient }: { patient: Patient }) {
  const imc = patient.weight && patient.height ? calculateIMC(patient.weight, patient.height) : null

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados Cadastrais</CardTitle>
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
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Medicamentos de Uso Contínuo</CardTitle>
        </CardHeader>
        <CardContent>
          <RichText
            content={patient.chronicMedications}
            emptyMsg="Nenhum medicamento registrado."
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <RichText content={patient.notes} emptyMsg="Sem observações." />
        </CardContent>
      </Card>
    </div>
  )
}
