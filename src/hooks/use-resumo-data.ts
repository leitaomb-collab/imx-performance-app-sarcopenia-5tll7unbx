import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { sortAssessmentsByDate } from '@/lib/chart-utils'
import type { Patient, User } from '@/types'

interface ResumoAssessment {
  id: string
  patientId: string
  evaluatorId: string
  assessmentDate: string
  status: string
  finalDiagnosis: string
  reassessmentMonths: number
  clinicalSummary: string
  expand?: {
    patientId?: Patient
    evaluatorId?: User
  }
  [key: string]: unknown
}

export function useResumoData(id: string | undefined) {
  const [assessment, setAssessment] = useState<ResumoAssessment | null>(null)
  const [allAssessments, setAllAssessments] = useState<ResumoAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const loadData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(false)
    setNotFound(false)
    try {
      const record = await pb
        .collection('assessments')
        .getOne(id, { expand: 'patientId,evaluatorId' })
      const current = record as unknown as ResumoAssessment
      const patientId = current.patientId
      const allRecords = await pb.collection('assessments').getFullList({
        filter: `patientId = "${patientId}"`,
        sort: 'assessmentDate',
      })
      const sorted = sortAssessmentsByDate(
        allRecords as Array<{ assessmentDate: string }>,
      ) as ResumoAssessment[]
      setAssessment(current)
      setAllAssessments(sorted)
    } catch (err: unknown) {
      const statusErr = err as { status?: number }
      if (statusErr?.status === 404) setNotFound(true)
      else setError(true)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime(
    'assessments',
    (e) => {
      if (e.record.id !== id) return
      if (e.action === 'update') {
        setAssessment(e.record as unknown as ResumoAssessment)
      }
    },
    !!id,
  )

  const patient: Patient | null = assessment?.expand?.patientId ?? null
  const evaluator: User | null = assessment?.expand?.evaluatorId ?? null
  const isDraft = assessment?.status === 'rascunho'

  const prevAssessment: ResumoAssessment | null =
    allAssessments
      .filter(
        (a) =>
          a.id !== id &&
          new Date(a.assessmentDate).getTime() <=
            new Date(assessment?.assessmentDate ?? 0).getTime(),
      )
      .pop() ?? null

  return {
    assessment,
    patient,
    evaluator,
    prevAssessment,
    allAssessments,
    loading,
    error,
    notFound,
    isDraft,
    retry: loadData,
  }
}
