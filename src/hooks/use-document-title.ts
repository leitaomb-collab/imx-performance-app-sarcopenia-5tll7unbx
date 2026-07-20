import { useEffect } from 'react'

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} — IMX Performance` : 'IMX Performance'
    return () => {
      document.title = 'IMX Performance'
    }
  }, [title])
}
