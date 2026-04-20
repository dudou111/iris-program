import { get, post, put, del } from '@/utils/request'

// 资源类型
export interface Resource {
  id: string
  title: string
  description: string
  images: string[]
  price?: number
  category: string
  location?: string
  contact?: string
  tags?: string[]
  status: string
  viewsCount: number
  collectionsCount: number
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

// 创建资源DTO
export interface CreateResourceDto {
  title: string
  description: string
  images: string[]
  price?: number
  category: string
  location?: string
  contact?: string
  tags?: string[]
}

// 更新资源DTO
export interface UpdateResourceDto {
  title?: string
  description?: string
  images?: string[]
  price?: number
  category?: string
  location?: string
  contact?: string
  tags?: string[]
  status?: string
}

// 获取资源列表
export function getResources(params: { page?: number; limit?: number; category?: string }) {
  return get<PageResponse<Resource>>('/resources', params)
}

// 获取资源详情
export function getResourceDetail(id: string) {
  return get<Resource>(`/resources/${id}`)
}

// 创建资源
export function createResource(data: CreateResourceDto) {
  return post<Resource>('/resources', data)
}

// 更新资源
export function updateResource(id: string, data: UpdateResourceDto) {
  return put<Resource>(`/resources/${id}`, data)
}

// 删除资源
export function deleteResource(id: string) {
  return del(`/resources/${id}`)
}

// 收藏资源
export function collectResource(id: string) {
  return post(`/resources/${id}/collect`)
}

// 取消收藏
export function uncollectResource(id: string) {
  return post(`/resources/${id}/uncollect`)
}
