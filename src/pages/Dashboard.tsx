import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Users, UserSearch } from 'lucide-react'
import { useAccessibility } from '@/hooks/use-accessibility'
import { getAllPatients } from '@/services/patients'
import { getAssessments } from '@/services/assessments'
import { useRealtime } from '@/hooks/use-realtime'
import type { Patient } from '@/types'
import type { DashboardAssessment } from '@/lib/chart-utils'
import { PatientSelector } from '@/components/dashboard/PatientSelector'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { DiagnosisDonut } from '@/components/dashboard/DiagnosisDonut'
import { RecentAssessments } from '@/components/dashboard/RecentAssessments'
import { LongitudinalCharts } from '@/components/dashboard/LongitudinalCharts'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'

export default function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [assessments, setAssessments] = useState<DashboardAssessment[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { announce } = useAccessibility()

  const loadData = async () => {
    try {
      const [p, a] = await Promise.all([getAllPatients(), getAssessments()])
      setPatients(p)
      setAssessments(a as DashboardAssessment[])
      announce('Conteúdo carregado')
    } catch {
      announce('Erro ao carregar conteúdo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('patients', loadData)
  useRealtime('assessments', loadData)

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) ?? null,
    [patients, selectedPatientId],
  )

  const filteredAssessments = useMemo(
    () =>
      selectedPatientId
        ? assessments.filter((a) => a.patientId === selectedPatientId)
        : assessments,
    [assessments, selectedPatientId],
  )

  if (loading) return <DashboardSkeleton />

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Users className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Nenhum paciente cadastrado</h2>
        <Button asChild>
          <Link to="/pacientes">Cadastrar Paciente</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-[1.5rem] font-bold tracking-[-0.025em]">Dashboard</h1>
        <PatientSelector
          patients={patients}
          value={selectedPatientId}
          onChange={setSelectedPatientId}
        />
      </div>

      <StatsCards
        patients={patients}
        assessments={filteredAssessments}
        patientSelected={!!selectedPatientId}
      />

      <div className="grid gap-6 md:grid-cols-[1fr_1.5fr]">
        <DiagnosisDonut assessments={filteredAssessments} />
        <RecentAssessments assessments={filteredAssessments} />
      </div>

      {selectedPatient && (
        <LongitudinalCharts
          assessments={filteredAssessments}
          patientGender={selectedPatient.gender}
          patientId={selectedPatient.id}
          patientName={selectedPatient.name}
        />
      )}

      {!selectedPatient && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 animate-fade-in">
          <UserSearch className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-[1rem] font-semibold">Evolução Longitudinal</h3>
          <p className="text-[0.875rem] text-muted-foreground text-center max-w-md">
            Selecione um paciente para visualizar a evolução longitudinal dos marcadores clínicos.
          </p>
        </div>
      )}
    </div>
  )
}
