import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Users } from 'lucide-react'
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

  const loadData = async () => {
    try {
      const [p, a] = await Promise.all([getAllPatients(), getAssessments()])
      setPatients(p)
      setAssessments(a as DashboardAssessment[])
    } catch {
      // error handled by empty state
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
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

      <div className="grid gap-6 md:grid-cols-2">
        <DiagnosisDonut assessments={filteredAssessments} />
        <RecentAssessments assessments={filteredAssessments} />
      </div>

      {selectedPatient && (
        <LongitudinalCharts
          assessments={filteredAssessments}
          patientGender={selectedPatient.gender}
        />
      )}

      {!selectedPatient && (
        <Card className="shadow-subtle border-0">
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              Selecione um paciente para visualizar a evolução longitudinal.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
