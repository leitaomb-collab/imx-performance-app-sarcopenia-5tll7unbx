import pb from '@/lib/pocketbase/client'

export interface NotificationRecord {
  id: string
  userId: string
  patientId: string
  assessmentId: string
  type: 'overdue' | 'upcoming'
  message: string
  reassessmentDate: string
  isRead: boolean
  created: string
  updated: string
}

export const getNotifications = async (): Promise<NotificationRecord[]> => {
  return pb.collection('notifications').getFullList({
    sort: '-created',
  }) as Promise<NotificationRecord[]>
}

export const markNotificationAsRead = async (id: string): Promise<void> => {
  await pb.collection('notifications').update(id, { isRead: true })
}

export const markAllNotificationsAsRead = async (): Promise<void> => {
  const unread = await pb.collection('notifications').getFullList({
    filter: 'isRead = false',
  })
  await Promise.all(
    unread.map((n) => pb.collection('notifications').update(n.id, { isRead: true })),
  )
}

export const deleteNotificationRecord = async (id: string): Promise<void> => {
  await pb.collection('notifications').delete(id)
}
