import { get, post, put } from '@/utils/request'

// 消息类型
export interface Message {
  id: string
  content: string
  type: string
  senderId: string
  receiverId: string
  isRead: boolean
  sender: {
    id: string
    nickname: string
    avatar: string
  }
  receiver: {
    id: string
    nickname: string
    avatar: string
  }
  createdAt: string
  updatedAt: string
}

// 会话类型
export interface Conversation {
  user: {
    id: string
    nickname: string
    avatar: string
  }
  lastMessage: {
    content: string
    createdAt: string
  }
  unreadCount: number
}

// 分页响应
export interface PageResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 发送消息DTO
export interface CreateMessageDto {
  content: string
  receiverId: string
  type: string
}

// 获取会话列表
export function getConversations(params: { page?: number; limit?: number }) {
  return get<PageResponse<Conversation>>('/messages/conversations', params)
}

// 获取聊天记录
export function getChatMessages(userId: string, params: { page?: number; limit?: number }) {
  return get<PageResponse<Message>>(`/messages/conversation/${userId}`, params)
}

// 发送消息
export function sendMessage(data: CreateMessageDto) {
  return post<Message>('/messages', data)
}

// 标记消息已读
export function markMessageRead(id: string) {
  return put(`/messages/${id}/read`)
}

// 标记会话已读
export function markConversationRead(userId: string) {
  return put(`/messages/conversation/${userId}/read`)
}

// 获取未读消息数
export function getUnreadCount() {
  return get<{ count: number }>('/messages/unread/count')
}
