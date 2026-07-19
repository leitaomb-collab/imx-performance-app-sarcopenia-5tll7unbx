import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export const getAvaliacoes = async (pacienteId?: string): Promise<RecordModel[]> => {
  const options: any = { sort: '-data', expand: 'paciente' }
  if (pacienteId) {
    options.filter = `paciente = "${pacienteId}"`
  }
  return pb.collection('avaliacoes').getFullList(options)
}

export const getAvaliacao = async (id: string): Promise<RecordModel> => {
  return pb.collection('avaliacoes').getOne(id, { expand: 'paciente' })
}

export const createAvaliacao = async (data: Partial<RecordModel>): Promise<RecordModel> => {
  return pb.collection('avaliacoes').create({ ...data, owner: pb.authStore.model?.id })
}

export const updateAvaliacao = async (
  id: string,
  data: Partial<RecordModel>,
): Promise<RecordModel> => {
  return pb.collection('avaliacoes').update(id, data)
}

export const deleteAvaliacao = async (id: string): Promise<boolean> => {
  return pb.collection('avaliacoes').delete(id)
}
