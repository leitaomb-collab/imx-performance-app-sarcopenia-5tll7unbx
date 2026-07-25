import { useEffect } from 'react'

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} — IEMEX Performance` : 'IEMEX Performance'
    return () => {
      document.title = 'IEMEX Performance'
    }
  }, [title])
}
