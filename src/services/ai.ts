import pb from '@/lib/pocketbase/client'

interface AnalystResult {
  content: string
  conversation_id?: string
  message_id?: string
}

export const askAnalyst = async (message: string): Promise<AnalystResult> => {
  return pb.send('/backend/v1/ask-analyst', {
    method: 'POST',
    body: JSON.stringify({ message }),
    headers: { 'Content-Type': 'application/json' },
  })
}
