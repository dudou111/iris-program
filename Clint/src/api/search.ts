import { get } from '@/utils/request'
import type { Post } from '@/api/posts'
import type { User } from '@/api/users'
import type { Resource } from '@/api/resources'

export interface SearchResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface SearchAllResponse {
  posts: SearchResult<Post>
  users: SearchResult<User>
  resources: SearchResult<Resource>
}

export function searchAll(q: string) {
  return get<SearchAllResponse>('/search', {
    q,
    type: 'all',
    page: 1,
    limit: 10
  })
}
