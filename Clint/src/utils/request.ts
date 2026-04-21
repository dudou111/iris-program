// API请求工具类
const SERVER_ORIGIN = 'http://127.0.0.1:3001'
let BASE_URL = SERVER_ORIGIN

// #ifdef H5
BASE_URL = '/api'
// #endif

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: any
}

interface ResponseData {
  data?: any
  statusCode: number
  message: string
  timestamp?: string
}

// 获取token
export function getToken(): string {
  const token = uni.getStorageSync('token')

  if (typeof token !== 'string') {
    return ''
  }

  const normalized = token.trim()

  if (!normalized || normalized === 'undefined' || normalized === 'null') {
    uni.removeStorageSync('token')
    return ''
  }

  return normalized
}

export function getBaseUrl(): string {
  return BASE_URL
}

export function getServerOrigin(): string {
  return SERVER_ORIGIN
}

export function getAuthHeader() {
  const token = getToken()

  if (!token) {
    return {}
  }

  return {
    Authorization: `Bearer ${token}`
  }
}

// 设置token
export function setToken(token: string) {
  if (!token || token === 'undefined' || token === 'null') {
    clearToken()
    return
  }

  uni.setStorageSync('token', token)
}

// 清除token
export function clearToken() {
  uni.removeStorageSync('token')
}

// 请求拦截器
function requestInterceptor(options: RequestOptions) {
  const token = getToken()

  if (!options.header) {
    options.header = {}
  }

  // 添加token
  if (token) {
    options.header['Authorization'] = `Bearer ${token}`
  }

  // 添加Content-Type
  if (!options.header['Content-Type']) {
    options.header['Content-Type'] = 'application/json'
  }

  return options
}

// 响应拦截器
function responseInterceptor(response: any): Promise<any> {
  const { statusCode, data } = response

  // 成功响应
  if (statusCode >= 200 && statusCode < 300) {
    // 后端使用了 TransformInterceptor，返回格式为 {data: ..., statusCode: ..., message: ..., timestamp: ...}
    // 需要提取 data.data 作为实际数据
    if (data && typeof data === 'object' && 'data' in data) {
      return Promise.resolve(data.data)
    }
    return Promise.resolve(data)
  }

  // 401未授权，清除token并跳转登录
  if (statusCode === 401) {
    clearToken()
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/login/login'
      })
    }, 1500)
    return Promise.reject(data)
  }

  // 其他错误
  const errorMessage = data?.message || '请求失败'
  uni.showToast({
    title: errorMessage,
    icon: 'none'
  })

  return Promise.reject(data)
}

// 通用请求方法
export function request<T = any>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    // 请求拦截
    const interceptedOptions = requestInterceptor(options)

    uni.request({
      url: BASE_URL + interceptedOptions.url,
      method: interceptedOptions.method || 'GET',
      data: interceptedOptions.data,
      header: interceptedOptions.header,
      success: (res) => {
        responseInterceptor(res)
          .then(resolve)
          .catch(reject)
      },
      fail: (err) => {
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// GET请求
export function get<T = any>(url: string, data?: any): Promise<T> {
  return request<T>({
    url,
    method: 'GET',
    data
  })
}

// POST请求
export function post<T = any>(url: string, data?: any): Promise<T> {
  return request<T>({
    url,
    method: 'POST',
    data
  })
}

// PUT请求
export function put<T = any>(url: string, data?: any): Promise<T> {
  return request<T>({
    url,
    method: 'PUT',
    data
  })
}

// DELETE请求
export function del<T = any>(url: string, data?: any): Promise<T> {
  return request<T>({
    url,
    method: 'DELETE',
    data
  })
}
