import { useState, useEffect, useCallback, useRef } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<unknown>>()
const STALE_TIME = 30_000

export function invalidateCache(key: string): void {
  cache.delete(key)
}

export function useSwrCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  enabled: boolean = true,
): { data: T | null; loading: boolean; error: boolean; mutate: (updater: (data: T) => T) => void } {
  const [data, setData] = useState<T | null>(() => {
    const entry = cache.get(key)
    return entry ? (entry.data as T) : null
  })
  const [loading, setLoading] = useState(!cache.has(key))
  const [error, setError] = useState(false)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const fetchData = useCallback(
    async (background: boolean) => {
      if (!background) setLoading(true)
      setError(false)
      try {
        const result = await fetcherRef.current()
        cache.set(key, { data: result, timestamp: Date.now() })
        setData(result)
      } catch {
        setError(true)
      } finally {
        if (!background) setLoading(false)
      }
    },
    [key],
  )

  useEffect(() => {
    if (!enabled) return
    const entry = cache.get(key)
    if (entry && Date.now() - entry.timestamp < STALE_TIME) {
      setData(entry.data as T)
      setLoading(false)
      return
    }
    if (entry) {
      setData(entry.data as T)
      setLoading(false)
      fetchData(true)
    } else {
      fetchData(false)
    }
  }, [key, enabled, fetchData])

  const mutate = useCallback(
    (updater: (d: T) => T) => {
      setData((prev) => {
        if (!prev) return prev
        const next = updater(prev)
        cache.set(key, { data: next, timestamp: Date.now() })
        return next
      })
    },
    [key],
  )

  return { data, loading, error, mutate }
}
