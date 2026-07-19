import pb from '@/lib/pocketbase/client'

export const getPacientes = async () => {
  return pb.collection('pacientes').getFullList({ sort: '-created' })
}

export const getPaciente = async (id: string) => {
  return pb.collection('pacientes').getOne(id)
}

export const createPaciente = async (data: any) => {
  data.owner = pb.authStore.record?.id
  return pb.collection('pacientes').create(data)
}

export const getAvaliacoes = async (pacienteId?: string) => {
  const filter = pacienteId ? `paciente="${pacienteId}"` : ''
  return pb.collection('avaliacoes').getFullList({ filter, expand: 'paciente', sort: '-data' })
}

export const getAvaliacao = async (id: string) => {
  return pb.collection('avaliacoes').getOne(id, { expand: 'paciente' })
}

export const createAvaliacao = async (data: any) => {
  data.owner = pb.authStore.record?.id
  return pb.collection('avaliacoes').create(data)
}

export const askAgent = async (message: string) => {
  const res = await pb.send('/backend/v1/agent-chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
    headers: { 'Content-Type': 'application/json' },
  })
  return res
}
