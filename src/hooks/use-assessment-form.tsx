import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPatients, getPatient } from '@/services/patients'
import { createAssessment, updateAssessment } from '@/services/assessments'
import { toast } from '@/hooks/use-toast'
import type { AssessmentFormData, Patient } from '@/types'
import type { AssessmentFormData as FormData } from '@/types/assessment'

const emptyForm: FormData = {
  patientId: '',
  assessmentDate: new Date().toISOString().split('T')[0],
  status: 'rascunho',
  finalDiagnosis: 'nao_avaliado',
  reassessmentMonths: 6,
  clinicalSummary: '',
  vitals: {},
  bodyComposition: {},
  anthropometry: {},
  posturalAssessment: {},
  muscleStrength: {},
  balanceAssessment: {},
  respiratoryStrength: {},
  spirometry: {},
  sarcopeniaScreening: {},
  ewgsop2Analysis: {},
}

export function useAssessmentForm(patientIdParam: string | null) {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormData>({ ...emptyForm, patientId: patientIdParam || '' })
  const [patient, setPatient] = useState<Patient | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const dirtyRef = useRef(false)
  const formRef = useRef(form)
  const idRef = useRef<string | null>(null)

  useEffect(() => {
    formRef.current = form
  }, [form])
  useEffect(() => {
    dirtyRef.current = dirty
  }, [dirty])
  useEffect(() => {
    idRef.current = assessmentId
  }, [assessmentId])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const result = await getPatients(1, 100)
      setPatients(result.items)
      if (patientIdParam) {
        const p = await getPatient(patientIdParam)
        setPatient(p)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [patientIdParam])

  useEffect(() => {
    loadData()
  }, [loadData])

  const updateField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
  }, [])

  const selectPatient = useCallback(async (id: string) => {
    try {
      const p = await getPatient(id)
      setPatient(p)
      setForm((prev) => ({ ...prev, patientId: id }))
      setDirty(true)
    } catch {
      toast({ title: 'Erro', description: 'Paciente não encontrado.', variant: 'destructive' })
    }
  }, [])

  const doSave = useCallback(async (status: 'rascunho' | 'concluida'): Promise<string | null> => {
    const data = { ...formRef.current, status, evaluatorId: undefined }
    delete (data as Record<string, unknown>).evaluatorId
    if (idRef.current) {
      await updateAssessment(idRef.current, data as Record<string, unknown>)
      return idRef.current
    }
    const res = await createAssessment(data as Record<string, unknown>)
    setAssessmentId(res.id)
    return res.id
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!dirtyRef.current || !formRef.current.patientId) return
      setDirty(false)
      try {
        await doSave('rascunho')
        setLastSaved(new Date())
      } catch {
        setDirty(true)
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [doSave])

  const saveDraft = useCallback(async () => {
    if (!form.patientId) {
      toast({ title: 'Erro', description: 'Selecione um paciente.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      await doSave('rascunho')
      setDirty(false)
      toast({ title: 'Avaliação salva como rascunho' })
      navigate(`/paciente/${form.patientId}`)
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível salvar.', variant: 'destructive' })
    }
    setSaving(false)
  }, [form.patientId, doSave, navigate])

  const finalize = useCallback(async () => {
    if (!form.patientId) {
      toast({ title: 'Erro', description: 'Selecione um paciente.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const id = await doSave('concluida')
      setDirty(false)
      toast({ title: 'Avaliação finalizada com sucesso' })
      navigate(`/relatorio/${id}`)
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível finalizar.', variant: 'destructive' })
    }
    setSaving(false)
  }, [form.patientId, doSave, navigate])

  return {
    form,
    patient,
    patients,
    loading,
    error,
    saving,
    dirty,
    lastSaved,
    updateField,
    selectPatient,
    saveDraft,
    finalize,
    loadData,
  }
}
