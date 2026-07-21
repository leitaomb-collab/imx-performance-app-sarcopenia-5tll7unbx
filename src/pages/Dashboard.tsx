import { useState, useMemo, useCallback, lazy, Suspense, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Users, UserSearch } from 'lucide-react'
import { useAccessibility } from '@/hooks/use-accessibility'
import { getAllPatients } from '@/services/patients'
import { getAssessments } from '@/services/assessments'
import { useRealtime } from '@/hooks/use-realtime'
import { useSwrCache, invalidateCache } from '@/hooks/use-swr-cache'
import type { Patient } from '@/types'
import type { DashboardAssessment } from '@/lib/chart-utils'
import { PatientSelector } from '@/components/dashboard/PatientSelector'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { RecentAssessments } from '@/components/dashboard/RecentAssessments'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'
import { RefreshButton } from '@/components/dashboard/RefreshButton'

const DiagnosisDonut = lazy(() =>
  import('@/components/dashboard/DiagnosisDonut').then((m) => ({ default: m.DiagnosisDonut })),
)
const LongitudinalCharts = lazy(() =>
  import('@/components/dashboard/LongitudinalCharts').then((m) => ({
    default: m.LongitudinalCharts,
  })),
)

function ChartsFallback() {
  return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      Carregando gráficos...
    </div>
  )
}

interface DashboardData {
  patients: Patient[]
  assessments: DashboardAssessment[]
}

export default function Dashboard() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const { announce } = useAccessibility()

  const fetcher = useCallback(async (): Promise<DashboardData> => {
    const [p, a] = await Promise.all([getAllPatients(), getAssessments()])
    return { patients: p, assessments: a as DashboardAssessment[] }
  }, [])

  const { data, loading, mutate } = useSwrCache<DashboardData>('dashboard-data', fetcher)

  useEffect(() => {
    if (data) announce('Conteúdo carregado')
  }, [data, announce])

  useRealtime('patients', (e) => {
    if (e.action === 'create') {
      mutate((d) => ({ ...d, patients: [...d.patients, e.record as Patient] }))
    } else if (e.action === 'update') {
      mutate((d) => ({
        ...d,
        patients: d.patients.map((p) => (p.id === e.record.id ? (e.record as Patient) : p)),
      }))
    } else if (e.action === 'delete') {
      mutate((d) => ({ ...d, patients: d.patients.filter((p) => p.id !== e.record.id) }))
    }
  })

  useRealtime('assessments', (e) => {
    if (e.action === 'create') {
      mutate((d) => ({
        ...d,
        assessments: [...d.assessments, e.record as DashboardAssessment],
      }))
    } else if (e.action === 'update') {
      mutate((d) => ({
        ...d,
        assessments: d.assessments.map((a) =>
          a.id === e.record.id ? (e.record as DashboardAssessment) : a,
        ),
      }))
    } else if (e.action === 'delete') {
      mutate((d) => ({
        ...d,
        assessments: d.assessments.filter((a) => a.id !== e.record.id),
      }))
    }
  })

  const patients = data?.patients ?? []
  const assessments = data?.assessments ?? []

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

  const handlePatientChange = useCallback((id: string | null) => {
    setSelectedPatientId(id)
  }, [])

  const handleRefresh = useCallback(() => {
    invalidateCache('dashboard-data')
  }, [])

  if (loading && !data) return <DashboardSkeleton />

  if (patients.length === 0) {
    return (
      <div className="dashboard-fade-in flex flex-col items-center justify-center py-20 gap-4">
        <Users className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Nenhum paciente cadastrado</h2>
        <Button asChild>
          <Link to="/pacientes">Cadastrar Paciente</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="dashboard-container dashboard-fade-in">
      <div className="dashboard-header-enter flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-[1.5rem] font-bold tracking-[-0.025em]">Dashboard</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <PatientSelector
            patients={patients}
            value={selectedPatientId}
            onChange={handlePatientChange}
          />
          <RefreshButton onRefresh={handleRefresh} />
        </div>
      </div>

      <StatsCards
        patients={patients}
        assessments={filteredAssessments}
        patientSelected={!!selectedPatientId}
      />

      <div className="grid gap-6 md:grid-cols-[1fr_1.5fr]">
        <Suspense fallback={<ChartsFallback />}>
          <DiagnosisDonut assessments={filteredAssessments} />
        </Suspense>
        <RecentAssessments assessments={filteredAssessments} />
      </div>

      {selectedPatient && (
        <Suspense fallback={<ChartsFallback />}>
          <LongitudinalCharts
            assessments={filteredAssessments}
            patientGender={selectedPatient.gender}
            patientId={selectedPatient.id}
            patientName={selectedPatient.name}
          />
        </Suspense>
      )}

      {!selectedPatient && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 dashboard-fade-in">
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
