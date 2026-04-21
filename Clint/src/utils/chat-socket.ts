import { getBaseUrl, getToken } from './request'

export interface ChatSocketEvent<T = any> {
  type: string
  data?: T
}

type ChatSocketListener = (event: ChatSocketEvent) => void

let socketTask: UniApp.SocketTask | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let manualClose = false
const listeners = new Set<ChatSocketListener>()

const notify = (event: ChatSocketEvent) => {
  listeners.forEach((listener) => listener(event))
}

const getOrigin = () => {
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.protocol}//${window.location.host}`
  }

  return getBaseUrl()
}

const getSocketUrl = () => {
  const token = getToken()
  if (!token) return ''

  const httpBase = getBaseUrl().startsWith('/') ? `${getOrigin()}${getBaseUrl()}` : getBaseUrl()
  const wsBase = httpBase.replace(/^http/, 'ws')

  return `${wsBase}/messages/ws?token=${encodeURIComponent(token)}`
}

const scheduleReconnect = () => {
  if (manualClose || reconnectTimer) return

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    ensureChatSocketConnected()
  }, 3000)
}

export const subscribeChatSocket = (listener: ChatSocketListener) => {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export const ensureChatSocketConnected = () => {
  const url = getSocketUrl()
  if (!url || socketTask) return

  manualClose = false
  const task = uni.connectSocket({
    url,
    complete: () => {}
  }) as unknown as UniApp.SocketTask

  if (!task || typeof task.onOpen !== 'function') {
    console.error('创建聊天 WebSocket 连接失败: 返回的 socketTask 不可用')
    socketTask = null
    scheduleReconnect()
    return
  }

  socketTask = task

  task.onOpen(() => {
    notify({ type: 'socket:open' })
  })

  task.onMessage((message) => {
    try {
      notify(JSON.parse(message.data as string))
    } catch (error) {
      console.error('解析实时消息失败:', error)
    }
  })

  task.onClose(() => {
    socketTask = null
    notify({ type: 'socket:close' })
    scheduleReconnect()
  })

  task.onError(() => {
    notify({ type: 'socket:error' })
  })
}

export const disconnectChatSocket = () => {
  manualClose = true

  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  if (!socketTask) {
    return
  }

  const current = socketTask
  socketTask = null
  current.close({})
}
