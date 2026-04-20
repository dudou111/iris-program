import { get, post, put } from '@/utils/request'

// 用户信息类型
export interface User {
  id: string
  openid: string
  nickname: string
  avatar: string
  bio?: string
  school?: string
  college?: string
  major?: string
  grade?: string
  followersCount: number
  followingCount: number
  postsCount: number
  createdAt: string
  updatedAt: string
}

// 更新用户信息DTO
export interface UpdateUserDto {
  nickname?: string
  bio?: string
  school?: string
  college?: string
  major?: string
  grade?: string
}

// 分页响应
export interface PageResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 获取用户列表
export function getUsers(params: { page?: number; limit?: number }) {
  return get<PageResponse<User>>('/users', params)
}

// 获取当前用户信息
export function getCurrentUser() {
  return get<User>('/users/me')
}

// 获取用户详情
export function getUserDetail(id: string) {
  return get<User>(`/users/${id}`)
}

// 更新用户信息
export function updateUser(data: UpdateUserDto) {
  return put<User>('/users/me', data)
}

// 关注用户
export function followUser(id: string) {
  return post(`/users/${id}/follow`)
}

// 取消关注
export function unfollowUser(id: string) {
  return post(`/users/${id}/unfollow`)
}

// 获取粉丝列表
export function getFollowers(id: string, params: { page?: number; limit?: number }) {
  return get<PageResponse<User>>(`/users/${id}/followers`, params)
}

// 获取关注列表
export function getFollowing(id: string, params: { page?: number; limit?: number }) {
  return get<PageResponse<User>>(`/users/${id}/following`, params)
}
