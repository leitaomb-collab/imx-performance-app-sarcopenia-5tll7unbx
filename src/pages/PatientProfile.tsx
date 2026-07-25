import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { getPatient } from '@/services/patients'
import { getAssessments } from '@/services/assessments'
import { useRealtime } from '@/hooks/use-realtime'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Plus, AlertCircle, TrendingUp } from 'lucide-react'
import { calculateAge, calculateIMC, formatGender, getIMCColorClass } from '@/lib/patient-utils'
import { cn } from '@/lib/utils'
import type { Patient, Assessment } from '@/types'
import { EditPatientDialog } from '@/components/patients/EditPatientDialog'
import { DeleteAssessmentDialog } from '@/components/patients/DeleteAssessmentDialog'
import { PatientInfoCards } from '@/components/patients/PatientInfoCards'
import { EvolutionCharts } from '@/components/patients/EvolutionCharts'
import { AssessmentTimeline } from '@/components/patient/AssessmentTimeline'
import { PatientProfileSkeleton } from '@/components/patients/PatientProfileSkeleton'
import { BackButton } from '@/components/BackButton'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

function TabErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center py-12 gap-4">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <p className="text-lg font-medium">{message}</p>
      <Button onClick={onRetry} className="tactile">
        Tentar novamente
      </Button>
    </div>
  )
}

export default function PatientProfile() {
  const { id } = useParams()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [patientError, setPatientError] = useState(false)
  const [assessmentsError, setAssessmentsError] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Assessment | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const handleDeleteSuccess = useCallback((aid: string) => {
    setDeleteTarget(null)
    setAssessments((prev) => prev.filter((a) => a.id !== aid))
  }, [])

  const loadData = async (showSkeleton = true) => {
    if (!id) return
    if (showSkeleton) setLoading(true)

    const [patientResult, assessmentsResult] = await Promise.allSettled([
      getPatient(id),
      getAssessments(id),
    ])

    if (patientResult.status === 'fulfilled') {
      setPatient(patientResult.value)
      setPatientError(false)
    } else {
      setPatientError(true)
      toast.error('Não foi possível carregar os dados do paciente')
    }

    if (assessmentsResult.status === 'fulfilled') {
      setAssessments(assessmentsResult.value)
      setAssessmentsError(false)
    } else {
      setAssessmentsError(true)
    }

    if (showSkeleton) setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [id])

  useRealtime('assessments', (e) => {
    if (e.record['patientId'] !== id) return
    if (e.action === 'create') {
      setAssessments((prev) => [...prev, e.record as Assessment])
    } else if (e.action === 'update') {
      setAssessments((prev) =>
        prev.map((a) => (a.id === e.record.id ? (e.record as Assessment) : a)),
      )
    } else if (e.action === 'delete') {
      setAssessments((prev) => prev.filter((a) => a.id !== e.record.id))
    }
  })

  useRealtime('patients', (e) => {
    if (e.record.id === id) {
      if (e.action === 'delete') return
      setPatient(e.record as Patient)
    }
  })

  if (loading) return <PatientProfileSkeleton />

  if (patientError || !patient) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-lg font-medium">Erro ao carregar perfil</p>
        <Button onClick={() => loadData()}>Tentar novamente</Button>
      </div>
    )
  }

  const age = patient.birthDate ? calculateAge(patient.birthDate) : null
  const hasIMC =
    patient.weight != null && patient.height != null && patient.weight > 0 && patient.height > 0
  const imc = hasIMC ? calculateIMC(patient.weight!, patient.height!) : null

  return (
    <div className="space-y-6 animate-fade-in">
      <BackButton fallback="/pacientes" className="h-11" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ viewTransitionName: `patient-name-${patient.id}` }}
          >
            {patient.name}
          </h1>
          <div className="flex flex-wrap gap-2">
            {age !== null && <Badge variant="secondary">{age} anos</Badge>}
            <Badge
              className={cn(
                patient.gender === 'M'
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20'
                  : 'bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20',
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
          <Button variant="outline" className="h-11 tactile" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </Button>
          <Button className="h-11 tactile" asChild>
            <Link to={`/avaliacao/nova?patientId=${patient.id}`} viewTransition>
              <Plus className="mr-2 h-4 w-4" /> Nova Avaliação
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList aria-label="Seções do paciente" className="flex w-full overflow-x-auto sm:w-auto">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="evolution">Evolução</TabsTrigger>
          <TabsTrigger value="assessments">Avaliações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className={cn(!prefersReducedMotion && 'animate-fade-in')}>
          <PatientInfoCards patient={patient} />
        </TabsContent>

        <TabsContent value="evolution" className={cn(!prefersReducedMotion && 'animate-fade-in')}>
          {assessmentsError ? (
            <TabErrorState message="Erro ao carregar evolução" onRetry={() => loadData(false)} />
          ) : assessments.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <TrendingUp className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                Sem dados de evolução disponíveis
              </p>
            </div>
          ) : (
            <EvolutionCharts assessments={assessments} patient={patient} />
          )}
        </TabsContent>

        <TabsContent value="assessments" className={cn(!prefersReducedMotion && 'animate-fade-in')}>
          {assessmentsError ? (
            <TabErrorState message="Erro ao carregar avaliações" onRetry={() => loadData(false)} />
          ) : (
            <AssessmentTimeline
              assessments={assessments}
              patientId={patient.id}
              onDelete={setDeleteTarget}
            />
          )}
        </TabsContent>
      </Tabs>

      <EditPatientDialog
        patient={patient}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={setPatient}
      />
      <DeleteAssessmentDialog
        assessment={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )
}
