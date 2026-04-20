import { post } from '@/utils/request'

// 登录请求参数
export interface LoginDto {
  username: string
  password: string
}

// 注册请求参数
export interface RegisterDto {
  username: string
  password: string
  nickname: string
}

// 微信登录请求参数
export interface WechatLoginDto {
  code: string
  nickname?: string
  avatar?: string
}

// 登录响应
export interface LoginResponse {
  access_token: string
  user: {
    id: string
    username: string
    nickname: string
    avatar: string
    school?: string
    college?: string
    major?: string
    grade?: string
    bio?: string
  }
}

// 普通登录
export function login(data: LoginDto) {
  return post<LoginResponse>('/auth/login', data)
}

// 注册
export function register(data: RegisterDto) {
  return post<LoginResponse>('/auth/register', data)
}

// 微信登录
export function wechatLogin(data: WechatLoginDto) {
  return post<LoginResponse>('/auth/wechat/login', data)
}
