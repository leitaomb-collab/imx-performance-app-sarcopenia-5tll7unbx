import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationRecord,
  type NotificationRecord,
} from '@/services/notifications'

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    try {
      setError(null)
      const result = await getNotifications()
      setNotifications(result)
    } catch {
      setError('Falha ao carregar notificações.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchNotifications()
    } else {
      setNotifications([])
      setLoading(false)
    }
  }, [user, fetchNotifications])

  useRealtime(
    'notifications',
    () => {
      fetchNotifications()
    },
    !!user,
  )

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAsRead = useCallback(
    async (id: string) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
      try {
        await markNotificationAsRead(id)
      } catch {
        fetchNotifications()
      }
    },
    [fetchNotifications],
  )

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    try {
      await markAllNotificationsAsRead()
    } catch {
      fetchNotifications()
    }
  }, [fetchNotifications])

  const removeNotification = useCallback(
    async (id: string) => {
      try {
        await deleteNotificationRecord(id)
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      } catch {
        fetchNotifications()
      }
    },
    [fetchNotifications],
  )

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    refetch: fetchNotifications,
  }
}
