import { get, post, put, del } from '@/utils/request'

// 动态数据类型
export interface Post {
  id: string
  content: string
  images?: string[]
  location?: string
  tags?: string[]
  visibility: string
  category: string
  likesCount: number
  commentsCount: number
  collectionsCount: number
  viewsCount: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  isLiked?: boolean
  isCollected?: boolean
  isCommented?: boolean
  author: {
    id: string
    nickname: string
    avatar: string
    isFollowing?: boolean
  }
}

// 分页响应
export interface PageResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 创建动态DTO
export interface CreatePostDto {
  content: string
  images?: string[]
  location?: string
  tags?: string[]
  visibility?: string
  category: string
}

// 更新动态DTO
export interface UpdatePostDto {
  content?: string
  images?: string[]
  location?: string
  tags?: string[]
  visibility?: string
  category?: string
}

// 获取动态列表
export function getPosts(params: { page?: number; limit?: number; category?: string }) {
  return get<PageResponse<Post>>('/posts', params)
}

// 获取动态详情
export function getPostDetail(id: string) {
  return get<Post>(`/posts/${id}`)
}

// 创建动态
export function createPost(data: CreatePostDto) {
  return post<Post>('/posts', data)
}

// 更新动态
export function updatePost(id: string, data: UpdatePostDto) {
  return put<Post>(`/posts/${id}`, data)
}

// 删除动态
export function deletePost(id: string) {
  return del(`/posts/${id}`)
}

// 点赞动态
export function likePost(id: string) {
  return post(`/posts/${id}/like`)
}

// 取消点赞
export function unlikePost(id: string) {
  return post(`/posts/${id}/unlike`)
}

// 收藏动态
export function collectPost(id: string) {
  return post(`/posts/${id}/collect`)
}

// 取消收藏
export function uncollectPost(id: string) {
  return post(`/posts/${id}/uncollect`)
}

// 获取用户动态列表
export function getUserPosts(userId: string, params: { page?: number; limit?: number }) {
  return get<PageResponse<Post>>(`/posts/user/${userId}`, params)
}
