import { useEffect } from 'react'

export function usePageTitle(title: string | undefined) {
  useEffect(() => {
    document.title = title ? `${title} | IMX Performance` : 'IMX Performance'
    return () => {
      document.title = 'IMX Performance'
    }
  }, [title])
}
