import { get, post, put, del } from '@/utils/request'

// 活动类型
export interface Activity {
  id: string
  title: string
  description: string
  images: string[]
  category: string
  location: string
  startTime: string
  endTime: string
  maxParticipants?: number
  currentParticipants: number
  status: string
  viewsCount: number
  authorId: string
  author: {
    id: string
    nickname: string
    avatar: string
  }
  createdAt: string
  updatedAt: string
}

// 分页响应
export interface PageResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 创建活动DTO
export interface CreateActivityDto {
  title: string
  description: string
  images: string[]
  category: string
  location: string
  startTime: string
  endTime: string
  maxParticipants?: number
}

// 更新活动DTO
export interface UpdateActivityDto {
  title?: string
  description?: string
  images?: string[]
  category?: string
  location?: string
  startTime?: string
  endTime?: string
  maxParticipants?: number
  status?: string
}

// 获取活动列表
export function getActivities(params: { page?: number; limit?: number; category?: string; status?: string }) {
  return get<PageResponse<Activity>>('/activities', params)
}

// 获取活动详情
export function getActivityDetail(id: string) {
  return get<Activity>(`/activities/${id}`)
}

// 创建活动
export function createActivity(data: CreateActivityDto) {
  return post<Activity>('/activities', data)
}

// 更新活动
export function updateActivity(id: string, data: UpdateActivityDto) {
  return put<Activity>(`/activities/${id}`, data)
}

// 删除活动
export function deleteActivity(id: string) {
  return del(`/activities/${id}`)
}

// 报名活动
export function joinActivity(id: string) {
  return post(`/activities/${id}/join`)
}

// 取消报名
export function leaveActivity(id: string) {
  return post(`/activities/${id}/leave`)
}
