import { useState, useEffect, useRef, useCallback } from 'react'
import type { AssessmentFormData } from '@/types/assessment'

export type SaveState = 'idle' | 'saving' | 'saved'

export interface StoredDraft {
  data: AssessmentFormData
  step: number
  timestamp: number
}

const SAVE_INTERVAL_MS = 30_000
const MIN_SAVING_MS = 600
const SAVED_DISPLAY_MS = 1800

export function getStoredDraft(key: string): StoredDraft | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as StoredDraft
  } catch {
    return null
  }
}

export function clearStoredDraft(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* noop */
  }
}

export function useAutoSave(form: AssessmentFormData, step: number, storageKey: string) {
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [recoveryDraft, setRecoveryDraft] = useState<StoredDraft | null>(null)

  const formRef = useRef(form)
  const stepRef = useRef(step)
  const lastSavedDataRef = useRef<string>('')
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const initializedRef = useRef(false)

  formRef.current = form
  stepRef.current = step

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  const performSave = useCallback(() => {
    const data = formRef.current
    const dataJson = JSON.stringify(data)
    if (dataJson === lastSavedDataRef.current) return

    setHasUnsavedChanges(false)
    setSaveState('saving')

    const t1 = setTimeout(() => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ data, step: stepRef.current, timestamp: Date.now() }),
        )
      } catch {
        /* noop */
      }
      lastSavedDataRef.current = dataJson
      setSaveState('saved')
      const t2 = setTimeout(() => setSaveState('idle'), SAVED_DISPLAY_MS)
      timersRef.current.push(t2)
    }, MIN_SAVING_MS)
    timersRef.current.push(t1)
  }, [storageKey])

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    const stored = getStoredDraft(storageKey)
    if (stored) {
      setRecoveryDraft(stored)
      lastSavedDataRef.current = JSON.stringify(stored.data)
    } else {
      lastSavedDataRef.current = JSON.stringify(form)
    }
  }, [storageKey, form])

  useEffect(() => {
    if (!initializedRef.current) return
    const dataJson = JSON.stringify(form)
    if (dataJson !== lastSavedDataRef.current) {
      setHasUnsavedChanges(true)
    }
  }, [form])

  useEffect(() => {
    const interval = setInterval(() => {
      const dataJson = JSON.stringify(formRef.current)
      if (dataJson !== lastSavedDataRef.current) {
        performSave()
      }
    }, SAVE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [performSave])

  const prevStepRef = useRef(step)
  useEffect(() => {
    if (!initializedRef.current) return
    if (step !== prevStepRef.current) {
      prevStepRef.current = step
      performSave()
    }
  }, [step, performSave])

  useEffect(() => clearTimers, [clearTimers])

  const triggerSave = useCallback(() => {
    const dataJson = JSON.stringify(formRef.current)
    if (dataJson === lastSavedDataRef.current) return
    performSave()
  }, [performSave])

  const acceptDraft = useCallback((): StoredDraft | null => {
    const draft = recoveryDraft
    setRecoveryDraft(null)
    if (draft) {
      lastSavedDataRef.current = JSON.stringify(draft.data)
    }
    return draft
  }, [recoveryDraft])

  const discardDraft = useCallback(() => {
    clearStoredDraft(storageKey)
    setRecoveryDraft(null)
    lastSavedDataRef.current = JSON.stringify(formRef.current)
  }, [storageKey])

  const clearDraft = useCallback(() => {
    clearStoredDraft(storageKey)
    lastSavedDataRef.current = JSON.stringify(formRef.current)
    setSaveState('idle')
    setHasUnsavedChanges(false)
  }, [storageKey])

  return {
    saveState,
    hasUnsavedChanges,
    triggerSave,
    clearDraft,
    recoveryDraft,
    acceptDraft,
    discardDraft,
  }
}
