import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { sortAssessmentsByDate } from '@/lib/chart-utils'
import type { Patient, User } from '@/types'

export function useSummaryData(id: string | undefined) {
  const [assessment, setAssessment] = useState<Record<string, any> | null>(null)
  const [previousAssessments, setPreviousAssessments] = useState<Record<string, any>[]>([])
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
      const patientId = (record as Record<string, any>).patientId
      const allRecords = await pb.collection('assessments').getFullList({
        filter: `patientId = "${patientId}" && status = "concluida"`,
        sort: 'assessmentDate',
      })
      const prev = (allRecords as Record<string, any>[]).filter((a) => a.id !== id)
      const sorted = sortAssessmentsByDate(prev as Array<{ assessmentDate: string }>) as Record<
        string,
        any
      >[]
      setAssessment(record as Record<string, any>)
      setPreviousAssessments(sorted)
    } catch (err: any) {
      if (err?.status === 404) setNotFound(true)
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
        setAssessment(e.record as Record<string, any>)
      }
    },
    !!id,
  )

  const patient: Patient | null = (assessment?.expand?.patientId as Patient) ?? null
  const evaluator: User | null = (assessment?.expand?.evaluatorId as User) ?? null
  const isDraft = assessment?.status === 'rascunho'

  const prevAssessment =
    previousAssessments.length > 0
      ? (previousAssessments
          .filter(
            (a) =>
              new Date(a.assessmentDate).getTime() <=
              new Date(assessment?.assessmentDate ?? 0).getTime(),
          )
          .pop() ?? null)
      : null

  const allAssessments: Record<string, any>[] = assessment
    ? [...previousAssessments, assessment]
    : previousAssessments

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
