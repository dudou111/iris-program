import { get, put } from '@/utils/request'

export type NotificationType = 'like' | 'comment' | 'follow'

export interface NotificationActor {
  id: string
  nickname: string
  avatar: string
}

export interface NotificationPost {
  id: string
  content: string
  images?: string[] | null
}

export interface NotificationComment {
  id: string
  content: string
}

export interface SocialNotification {
  id: string
  type: NotificationType
  isRead: boolean
  actorId: string
  recipientId: string
  postId?: string | null
  commentId?: string | null
  actor?: NotificationActor
  post?: NotificationPost | null
  comment?: NotificationComment | null
  createdAt: string
  updatedAt: string
}

export interface PageResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function getNotifications(params: { page?: number; limit?: number }) {
  return get<PageResponse<SocialNotification>>('/notifications', params)
}

export function getNotificationUnreadCount() {
  return get<{ count: number }>('/notifications/unread/count')
}

export function markNotificationRead(id: string) {
  return put<SocialNotification>(`/notifications/${id}/read`)
}

export function markAllNotificationsRead() {
  return put<{ count: number }>('/notifications/read/all')
}
