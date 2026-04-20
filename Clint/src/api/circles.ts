import { get, post, put, del } from '@/utils/request'

// 圈子类型
export interface Circle {
  id: string
  name: string
  description: string
  avatar: string
  cover: string
  type: string
  category: string
  tags: string[]
  membersCount: number
  postsCount: number
  ownerId: string
  owner: {
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

// 创建圈子DTO
export interface CreateCircleDto {
  name: string
  description: string
  avatar: string
  cover: string
  type: string
  category: string
  tags?: string[]
}

// 更新圈子DTO
export interface UpdateCircleDto {
  name?: string
  description?: string
  avatar?: string
  cover?: string
  type?: string
  category?: string
  tags?: string[]
}

// 获取圈子列表
export function getCircles(params: { page?: number; limit?: number; category?: string }) {
  return get<PageResponse<Circle>>('/circles', params)
}

// 获取圈子详情
export function getCircleDetail(id: string) {
  return get<Circle>(`/circles/${id}`)
}

// 创建圈子
export function createCircle(data: CreateCircleDto) {
  return post<Circle>('/circles', data)
}

// 更新圈子
export function updateCircle(id: string, data: UpdateCircleDto) {
  return put<Circle>(`/circles/${id}`, data)
}

// 删除圈子
export function deleteCircle(id: string) {
  return del(`/circles/${id}`)
}

// 加入圈子
export function joinCircle(id: string) {
  return post(`/circles/${id}/join`)
}

// 退出圈子
export function leaveCircle(id: string) {
  return post(`/circles/${id}/leave`)
}

// 获取圈子成员
export function getCircleMembers(id: string, params: { page?: number; limit?: number }) {
  return get<PageResponse<any>>(`/circles/${id}/members`, params)
}
