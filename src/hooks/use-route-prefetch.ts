import { useCallback } from 'react'

const prefetched = new Set<string>()
const MAX_CONCURRENT = 2
let activeCount = 0
const queue: Array<() => void> = []

function processQueue(): void {
  while (activeCount < MAX_CONCURRENT && queue.length > 0) {
    const next = queue.shift()
    if (next) next()
  }
}

export function useRoutePrefetch() {
  return useCallback((key: string, importFn: () => Promise<unknown>) => {
    if (prefetched.has(key)) return
    prefetched.add(key)

    const run = () => {
      activeCount++
      importFn()
        .catch(() => {
          prefetched.delete(key)
        })
        .finally(() => {
          activeCount--
          processQueue()
        })
    }

    if (activeCount < MAX_CONCURRENT) {
      run()
    } else {
      queue.push(run)
    }
  }, [])
}
