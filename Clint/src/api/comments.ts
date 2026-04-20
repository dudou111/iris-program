import { get, post, put, del } from '@/utils/request'

// 评论类型
export interface Comment {
  id: string
  content: string
  postId: string
  authorId: string
  parentId?: string
  replyToUserId?: string
  likesCount: number
  repliesCount: number
  author: {
    id: string
    nickname: string
    avatar: string
  }
  replyToUser?: {
    id: string
    nickname: string
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

// 创建评论DTO
export interface CreateCommentDto {
  content: string
  postId: string
  parentId?: string
  replyToUserId?: string
}

// 更新评论DTO
export interface UpdateCommentDto {
  content: string
}

// 获取动态评论
export function getPostComments(postId: string, params: { page?: number; limit?: number }) {
  return get<PageResponse<Comment>>(`/comments/post/${postId}`, params)
}

// 获取评论详情
export function getCommentDetail(id: string) {
  return get<Comment>(`/comments/${id}`)
}

// 创建评论
export function createComment(data: CreateCommentDto) {
  return post<Comment>('/comments', data)
}

// 更新评论
export function updateComment(id: string, data: UpdateCommentDto) {
  return put<Comment>(`/comments/${id}`, data)
}

// 删除评论
export function deleteComment(id: string) {
  return del(`/comments/${id}`)
}

// 点赞评论
export function likeComment(id: string) {
  return post(`/comments/${id}/like`)
}

// 取消点赞
export function unlikeComment(id: string) {
  return post(`/comments/${id}/unlike`)
}
