import { useState, useEffect, useRef, useCallback } from 'react'

export function useBlurSync<T>(
  externalValue: T,
  onCommit: (value: T) => void,
): [T, (v: T) => void, () => void] {
  const [local, setLocal] = useState(externalValue)
  const localRef = useRef(local)
  localRef.current = local

  useEffect(() => {
    if (JSON.stringify(externalValue) !== JSON.stringify(localRef.current)) {
      setLocal(externalValue)
    }
  }, [externalValue])

  const handleChange = useCallback((v: T) => setLocal(v), [])
  const handleBlur = useCallback(() => onCommit(localRef.current), [onCommit])

  return [local, handleChange, handleBlur]
}
