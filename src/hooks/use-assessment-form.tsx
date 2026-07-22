import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPatients, getPatient } from '@/services/patients'
import { createAssessment, updateAssessment } from '@/services/assessments'
import { toast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import type { Patient } from '@/types'
import type { AssessmentFormData as FormData } from '@/types/assessment'
import { calculateAge } from '@/lib/patient-utils'
import { getHandgripPercentile } from '@/constants/handgripNorms'

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

const DEBOUNCE_MS = 5_000
const MIN_SAVE_INTERVAL_MS = 30_000

export function useAssessmentForm(patientIdParam: string | null) {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormData>({ ...emptyForm, patientId: patientIdParam || '' })
  const [patient, setPatient] = useState<Patient | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [editCount, setEditCount] = useState(0)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const dirtyRef = useRef(false)
  const formRef = useRef(form)
  const idRef = useRef<string | null>(null)
  const lastSavedRef = useRef<Date | null>(null)
  const patientRef = useRef<Patient | null>(null)

  useEffect(() => {
    formRef.current = form
  }, [form])
  useEffect(() => {
    dirtyRef.current = dirty
  }, [dirty])
  useEffect(() => {
    idRef.current = assessmentId
  }, [assessmentId])
  useEffect(() => {
    lastSavedRef.current = lastSaved
  }, [lastSaved])

  useEffect(() => {
    patientRef.current = patient
  }, [patient])

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
    setEditCount((c) => c + 1)
  }, [])

  const selectPatient = useCallback(async (id: string) => {
    try {
      const p = await getPatient(id)
      setPatient(p)
      setForm((prev) => ({ ...prev, patientId: id }))
      setDirty(true)
      setEditCount((c) => c + 1)
    } catch {
      toast({ title: 'Erro', description: 'Paciente não encontrado.', variant: 'destructive' })
    }
  }, [])

  const doSave = useCallback(async (status: 'rascunho' | 'concluida'): Promise<string | null> => {
    const { anthropometry, posturalAssessment, spirometry, posturalPhotos, ...rest } =
      formRef.current

    const ms = rest.muscleStrength
    const computedMs = { ...ms }
    if (ms.handgripLeft != null || ms.handgripRight != null) {
      computedMs.handgripMax = Math.max(ms.handgripLeft ?? 0, ms.handgripRight ?? 0)
      const patientData = patientRef.current
      if (patientData?.birthDate) {
        const age = calculateAge(patientData.birthDate)
        const result = getHandgripPercentile(patientData.gender, age, computedMs.handgripMax)
        computedMs.handgripPercentile = result.percentile ?? undefined
      }
    }

    const data: Record<string, unknown> = { ...rest, muscleStrength: computedMs, status }
    delete data.evaluatorId
    delete data.id
    if (idRef.current) {
      await updateAssessment(idRef.current, data as Record<string, unknown>)
      return idRef.current
    }
    const res = await createAssessment(data as Record<string, unknown>)
    setAssessmentId(res.id)
    return res.id
  }, [])

  useEffect(() => {
    if (editCount === 0 || !formRef.current.patientId) return
    const now = Date.now()
    const timeSinceLastSave = lastSavedRef.current ? now - lastSavedRef.current.getTime() : Infinity
    const delay = Math.max(DEBOUNCE_MS, MIN_SAVE_INTERVAL_MS - timeSinceLastSave)

    const timer = setTimeout(async () => {
      if (!dirtyRef.current || !formRef.current.patientId) return
      setDirty(false)
      try {
        await doSave('rascunho')
        const savedTime = new Date()
        setLastSaved(savedTime)
        lastSavedRef.current = savedTime
      } catch (err) {
        console.error('Auto-save error:', err)
        setDirty(true)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [editCount, doSave])

  const saveDraft = useCallback(async () => {
    if (!form.patientId) {
      toast({ title: 'Erro', description: 'Selecione um paciente.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      await doSave('rascunho')
      setDirty(false)
      const savedTime = new Date()
      setLastSaved(savedTime)
      lastSavedRef.current = savedTime
      toast({ title: 'Avaliação salva como rascunho' })
      navigate(`/paciente/${form.patientId}`)
    } catch (err) {
      toast({
        title: 'Erro ao salvar',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
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
    } catch (err) {
      console.error('Finalize assessment error:', err)
      toast({
        title: 'Erro ao finalizar',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
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
