import pb from '@/lib/pocketbase/client'

export async function exportLongitudinalCsv(patientId: string): Promise<Blob> {
  const url = `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/export/longitudinal?patientId=${encodeURIComponent(patientId)}`
  const res = await fetch(url, {
    headers: {
      Authorization: pb.authStore.token,
    },
  })

  if (!res.ok) {
    let message = 'Falha ao exportar CSV.'
    try {
      const data = await res.json()
      message = data.message || data.error || message
    } catch {
      // response is not JSON
    }
    throw new Error(message)
  }

  return res.blob()
}
