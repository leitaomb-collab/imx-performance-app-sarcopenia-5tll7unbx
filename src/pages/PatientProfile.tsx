import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPatient } from '@/services/patients'
import { getAssessments } from '@/services/assessments'
import { useRealtime } from '@/hooks/use-realtime'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Pencil, Plus, ClipboardList, AlertCircle } from 'lucide-react'
import { calculateAge, calculateIMC, formatGender, getIMCColorClass } from '@/lib/patient-utils'
import { cn } from '@/lib/utils'
import type { Patient, Assessment } from '@/types'
import { EditPatientDialog } from '@/components/patients/EditPatientDialog'
import { DeleteAssessmentDialog } from '@/components/patients/DeleteAssessmentDialog'
import { AssessmentCard } from '@/components/patients/AssessmentCard'
import { PatientProfileSkeleton } from '@/components/patients/PatientProfileSkeleton'
import { PatientInfoCards } from '@/components/patients/PatientInfoCards'

export default function PatientProfile() {
  const { id } = useParams()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Assessment | null>(null)

  const loadData = async () => {
    if (!id) return
    try {
      const [p, a] = await Promise.all([getPatient(id), getAssessments(id)])
      setPatient(p)
      setAssessments(a)
      setError(false)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  useRealtime('assessments', (e) => {
    if (e.record['patientId'] === id) loadData()
  })
  useRealtime('patients', (e) => {
    if (e.record.id === id) loadData()
  })

  if (loading) return <PatientProfileSkeleton />

  if (error || !patient) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-lg font-medium">Erro ao carregar perfil</p>
        <Button
          onClick={() => {
            setLoading(true)
            loadData()
          }}
        >
          Tentar novamente
        </Button>
      </div>
    )
  }

  const age = patient.birthDate ? calculateAge(patient.birthDate) : null
  const hasIMC =
    patient.weight != null && patient.height != null && patient.weight > 0 && patient.height > 0
  const imc = hasIMC ? calculateIMC(patient.weight!, patient.height!) : null

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" size="sm" className="h-11 w-fit" asChild>
        <Link to="/pacientes">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{patient.name}</h1>
          <div className="flex flex-wrap gap-2">
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
            {imc !== null && (
              <Badge variant="secondary" className="gap-1.5">
                <span className={cn('h-2.5 w-2.5 rounded-full', getIMCColorClass(imc))} />
                IMC: {imc.toFixed(1)}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-11" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </Button>
          <Button className="h-11" asChild>
            <Link to={`/avaliacao/nova?patientId=${patient.id}`}>
              <Plus className="mr-2 h-4 w-4" /> Nova Avaliação
            </Link>
          </Button>
        </div>
      </div>

      <PatientInfoCards patient={patient} />

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Histórico de Avaliações</h2>
        {assessments.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-4">
            <ClipboardList className="h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-medium">Nenhuma avaliação registrada</p>
            <Button className="h-11" asChild>
              <Link to={`/avaliacao/nova?patientId=${patient.id}`}>
                <Plus className="mr-2 h-4 w-4" /> Nova Avaliação
              </Link>
            </Button>
          </div>
        ) : (
          assessments.map((av) => (
            <AssessmentCard key={av.id} assessment={av} onDelete={setDeleteTarget} />
          ))
        )}
      </div>

      <EditPatientDialog
        patient={patient}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={setPatient}
      />
      <DeleteAssessmentDialog
        assessment={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onSuccess={(aid) => setAssessments((prev) => prev.filter((a) => a.id !== aid))}
      />
    </div>
  )
}
