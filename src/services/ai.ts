import pb from '@/lib/pocketbase/client'

export const askAnalyst = async (message: string, conversationId: string | null = null) => {
  const res = await pb.send('/backend/v1/ask-analyst', {
    method: 'POST',
    body: JSON.stringify({ message, conversation_id: conversationId }),
  })
  return res
}
