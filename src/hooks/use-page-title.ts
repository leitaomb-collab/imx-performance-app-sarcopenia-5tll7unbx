import { useEffect } from 'react'

export function usePageTitle(title: string | undefined) {
  useEffect(() => {
    document.title = title ? `${title} | IEMEX Performance` : 'IEMEX Performance'
    return () => {
      document.title = 'IEMEX Performance'
    }
  }, [title])
}
