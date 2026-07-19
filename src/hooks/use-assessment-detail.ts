import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getAssessment, updateAssessment } from '@/services/assessments'
import { useRealtime } from '@/hooks/use-realtime'
import type { Patient } from '@/types'

export function useAssessmentDetail(id: string | undefined) {
  const navigate = useNavigate()
  const [assessment, setAssessment] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const loadData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(false)
    try {
      const data = await getAssessment(id)
      setAssessment(data as Record<string, any>)
      setNotFound(false)
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
      if (e.action === 'delete') {
        toast.error('Avaliação excluída por outro usuário')
        const pid = assessment?.patientId
        setTimeout(() => navigate(`/paciente/${pid}`), 2000)
      } else {
        loadData()
      }
    },
    !!id,
  )

  const updateFields = useCallback(
    async (updates: Record<string, unknown>) => {
      if (!id) return
      try {
        const updated = await updateAssessment(id, updates)
        setAssessment(updated as Record<string, any>)
      } catch {
        toast.error('Erro ao atualizar seção')
      }
    },
    [id],
  )

  const patient: Patient | null = (assessment?.expand?.patientId as Patient) ?? null
  const isReadOnly = assessment?.status === 'concluida'

  return {
    assessment,
    patient,
    loading,
    error,
    notFound,
    isReadOnly,
    updateFields,
    retry: loadData,
  }
}
