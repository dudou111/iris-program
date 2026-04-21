<template>
  <view class="chat-page">
    <view class="header">
      <view class="header-action" @tap="handleBack">
        <text>‹</text>
      </view>
      <view class="chat-user">
        <view class="chat-user-avatar-wrap">
          <image :src="chatUser.avatar" class="chat-user-avatar" mode="aspectFill" />
          <view class="chat-user-status"></view>
        </view>
        <view class="chat-user-meta">
          <text class="chat-user-name">{{ chatUser.username }}</text>
          <text class="chat-user-subtitle">好友聊天中</text>
        </view>
      </view>
      <view class="header-action" @tap="handleMore">
        <text>⋯</text>
      </view>
    </view>

    <scroll-view class="message-list" scroll-y :scroll-into-view="scrollIntoView">
      <view
        v-for="message in messages"
        :key="message.id"
        :id="'msg-' + message.id"
        class="message-item"
        :class="{ self: message.isSelf }"
      >
        <image
          v-if="!message.isSelf"
          :src="chatUser.avatar"
          class="message-avatar"
          mode="aspectFill"
        />
        <view class="message-content">
          <view class="message-bubble">{{ message.content }}</view>
          <view class="message-time">{{ message.time }}</view>
        </view>
        <image
          v-if="message.isSelf"
          :src="currentUser.avatar"
          class="message-avatar"
          mode="aspectFill"
        />
      </view>
      <view v-if="!loading && messages.length === 0" class="empty-state">还没有消息，先打个招呼吧</view>
    </scroll-view>

    <view class="input-bar">
      <view class="input-icon" @tap="handleEmoji">
        <text>😊</text>
      </view>
      <input
        v-model="inputText"
        type="text"
        placeholder="说点什么..."
        class="message-input"
        confirm-type="send"
        :adjust-position="true"
        :hold-keyboard="false"
        :cursor-spacing="50"
        placeholder-style="color: #999;"
        @confirm="handleSend"
      />
      <view class="input-icon" @tap="handleImage">
        <text>🖼️</text>
      </view>
      <view class="btn-send" :class="{ disabled: !inputText.trim() || sending }" @tap="handleSend">
        发送
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  getChatMessages,
  markConversationRead,
  sendMessage,
  type Message as ApiMessage
} from '@/api/messages'
import { getCurrentUser, getUserDetail } from '@/api/users'
import {
  disconnectChatSocket,
  ensureChatSocketConnected,
  subscribeChatSocket,
  type ChatSocketEvent
} from '@/utils/chat-socket'

interface ChatUser {
  id: string
  avatar: string
  username: string
}

interface ChatMessage {
  id: string
  content: string
  time: string
  isSelf: boolean
}

const inputText = ref('')
const scrollIntoView = ref('')
const loading = ref(true)
const sending = ref(false)

const currentUser = ref<ChatUser>({
  id: (uni.getStorageSync('userInfo')?.id || '') as string,
  avatar:
    (uni.getStorageSync('userInfo')?.avatar as string) ||
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Me',
  username: (uni.getStorageSync('userInfo')?.nickname as string) || '我'
})

const chatUser = ref<ChatUser>({
  id: '',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
  username: '聊天中'
})

const messages = ref<ChatMessage[]>([])
const routeParams = ref<Record<string, string>>({})
let unsubscribeSocket: (() => void) | null = null

const getRouteParams = () => routeParams.value

const getChatUserId = () => getRouteParams().id || ''

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const mapMessage = (message: ApiMessage): ChatMessage => ({
  id: message.id,
  content: message.content,
  time: formatTime(message.createdAt),
  isSelf: message.senderId === currentUser.value.id
})

const scrollToBottom = (messageId?: string) => {
  setTimeout(() => {
    const targetId = messageId || messages.value[messages.value.length - 1]?.id
    if (targetId) {
      scrollIntoView.value = `msg-${targetId}`
    }
  }, 80)
}

const loadCurrentUser = async () => {
  if (currentUser.value.id && currentUser.value.username) return

  try {
    const me = await getCurrentUser()
    currentUser.value = {
      id: me.id,
      avatar: me.avatar || currentUser.value.avatar,
      username: me.nickname || currentUser.value.username
    }
  } catch (error) {
    console.error('加载当前用户失败:', error)
  }
}

const loadChatUser = async () => {
  const params = getRouteParams()
  const userId = params.id || ''

  if (!userId) {
    uni.showToast({ title: '聊天对象不存在', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
    return false
  }

  chatUser.value = {
    id: userId,
    avatar: decodeURIComponent(params.avatar || '') || chatUser.value.avatar,
    username: decodeURIComponent(params.nickname || '') || chatUser.value.username
  }

  if (params.nickname && params.avatar) {
    return true
  }

  try {
    const detail = await getUserDetail(userId)
    chatUser.value = {
      id: detail.id,
      avatar: detail.avatar || chatUser.value.avatar,
      username: detail.nickname || chatUser.value.username
    }
  } catch (error) {
    console.error('加载聊天对象失败:', error)
  }

  return true
}

const loadMessages = async () => {
  const userId = getChatUserId()
  if (!userId) return

  const res = await getChatMessages(userId, { page: 1, limit: 100 })
  messages.value = res.data.map(mapMessage)
  scrollToBottom()
}

const markCurrentConversationRead = async () => {
  const userId = getChatUserId()
  if (!userId) return

  try {
    await markConversationRead(userId)
    uni.$emit('messages:updated')
  } catch (error) {
    console.error('标记会话已读失败:', error)
  }
}

const handleRealtimeEvent = async (event: ChatSocketEvent<ApiMessage>) => {
  if (event.type !== 'message:new' || !event.data) {
    return
  }

  uni.$emit('messages:updated')

  if (event.data.senderId !== chatUser.value.id) {
    return
  }

  if (messages.value.some((message) => message.id === event.data!.id)) {
    return
  }

  messages.value.push(mapMessage(event.data))
  scrollToBottom(event.data.id)
  await markCurrentConversationRead()
}

const handleBack = () => {
  uni.navigateBack()
}

const handleMore = () => {
  uni.showActionSheet({
    itemList: ['查看主页', '刷新聊天'],
    success: async (res) => {
      if (res.tapIndex === 0) {
        uni.navigateTo({
          url: `/pages/user-profile/user-profile?id=${chatUser.value.id}`
        })
        return
      }

      try {
        await loadMessages()
      } catch (error) {
        console.error('刷新聊天失败:', error)
      }
    }
  })
}

const handleEmoji = () => {
  uni.showToast({ title: '表情功能开发中', icon: 'none' })
}

const handleImage = () => {
  uni.showToast({ title: '图片消息稍后支持', icon: 'none' })
}

const handleSend = async () => {
  const content = inputText.value.trim()
  if (!content || !chatUser.value.id || sending.value) return

  sending.value = true

  try {
    const message = await sendMessage({
      content,
      receiverId: chatUser.value.id,
      type: 'text'
    })

    messages.value.push(
      mapMessage({
        ...message,
        senderId: message.senderId || currentUser.value.id,
        receiverId: message.receiverId || chatUser.value.id,
        createdAt: message.createdAt || new Date().toISOString()
      })
    )
    inputText.value = ''
    scrollToBottom(message.id)
  } catch (error) {
    console.error('发送消息失败:', error)
  } finally {
    sending.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await loadCurrentUser()
    const ready = await loadChatUser()
    if (!ready) return
    await loadMessages()
    await markCurrentConversationRead()
    unsubscribeSocket = subscribeChatSocket(handleRealtimeEvent)
    ensureChatSocketConnected()
  } catch (error) {
    console.error('加载聊天记录失败:', error)
    uni.showToast({ title: '聊天加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  unsubscribeSocket?.()
  unsubscribeSocket = null
  disconnectChatSocket()
})

onLoad((options) => {
  const nextParams: Record<string, string> = {}
  const rawOptions = options || {}

  for (const key in rawOptions) {
    const value = rawOptions[key]
    nextParams[key] = typeof value === 'string' ? value : ''
  }

  routeParams.value = nextParams
})
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at top, rgba(124, 183, 255, 0.22) 0, rgba(124, 183, 255, 0) 34%),
    linear-gradient(180deg, #f5f8ff 0%, #edf3fb 48%, #eef2f9 100%);
}

.header {
  min-height: 104rpx;
  padding: 16rpx 24rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 248, 255, 0.94) 100%);
  display: flex;
  align-items: center;
  gap: 16rpx;
  border-bottom: 1rpx solid rgba(95, 141, 215, 0.12);
  flex-shrink: 0;
  box-sizing: border-box;
  backdrop-filter: blur(12rpx);
  box-shadow: 0 10rpx 30rpx rgba(109, 154, 221, 0.08);
}

.header-action {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #4d6b93;
  border-radius: 22rpx;
  background: linear-gradient(180deg, #f6f9ff 0%, #ebf2ff 100%);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
}

.chat-user {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 0 12rpx;
}

.chat-user-avatar-wrap {
  position: relative;
  width: 72rpx;
  height: 72rpx;
  flex-shrink: 0;
}

.chat-user-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  box-shadow: 0 12rpx 28rpx rgba(85, 135, 215, 0.24);
}

.chat-user-status {
  position: absolute;
  right: 2rpx;
  bottom: 2rpx;
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background: #3ad16f;
  border: 3rpx solid #ffffff;
  box-shadow: 0 0 0 4rpx rgba(58, 209, 111, 0.16);
}

.chat-user-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.chat-user-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #26354d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-user-subtitle {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #7e95b3;
}

.message-list {
  flex: 1;
  padding: 28rpx 24rpx 40rpx;
  box-sizing: border-box;
}

.message-item {
  display: flex;
  align-items: flex-end;
  gap: 18rpx;
  width: 100%;
  margin-bottom: 30rpx;
  box-sizing: border-box;
}

.message-item.self {
  justify-content: flex-end;
}

.message-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  flex-shrink: 0;
  background: #ffffff;
  box-shadow: 0 10rpx 22rpx rgba(72, 114, 172, 0.12);
}

.message-content {
  max-width: min(72%, calc(100% - 112rpx));
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.message-item.self .message-content {
  align-items: flex-end;
}

.message-bubble {
  max-width: 100%;
  padding: 22rpx 28rpx;
  font-size: 28rpx;
  line-height: 1.5;
  background: rgba(255, 255, 255, 0.96);
  color: #243447;
  border-radius: 26rpx 26rpx 26rpx 12rpx;
  border: 1rpx solid rgba(198, 214, 236, 0.6);
  box-shadow: 0 14rpx 32rpx rgba(70, 101, 144, 0.08);
  word-break: break-word;
  box-sizing: border-box;
}

.message-item.self .message-bubble {
  background: linear-gradient(135deg, #58a6ff 0%, #348df8 55%, #2a7cf0 100%);
  color: #ffffff;
  border: none;
  border-radius: 26rpx 26rpx 12rpx 26rpx;
  box-shadow: 0 16rpx 34rpx rgba(52, 141, 248, 0.24);
}

.message-time {
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #8d9caf;
  padding: 0 8rpx;
}

.input-bar {
  min-height: 120rpx;
  margin: 0 16rpx calc(84rpx + env(safe-area-inset-bottom));
  padding: 12rpx 20rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(245, 249, 255, 0.98) 100%);
  border: 1rpx solid rgba(95, 141, 215, 0.12);
  border-radius: 34rpx;
  display: flex;
  align-items: center;
  gap: 14rpx;
  flex-shrink: 0;
  box-sizing: border-box;
  backdrop-filter: blur(12rpx);
  box-shadow: 0 14rpx 36rpx rgba(71, 125, 198, 0.12);
}

.input-icon {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38rpx;
  color: #6680a2;
  flex-shrink: 0;
}

.message-input {
  flex: 1;
  height: 72rpx;
  min-width: 0;
  padding: 0 28rpx;
  font-size: 28rpx;
  color: #243447;
  background: linear-gradient(180deg, #f2f6fd 0%, #edf2fa 100%);
  border: none;
  border-radius: 36rpx;
  box-sizing: border-box;
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.85);
}

.btn-send {
  min-width: 112rpx;
  padding: 0 28rpx;
  height: 72rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #8cc1ff 0%, #5ba5ff 45%, #4196ff 100%);
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 28rpx rgba(65, 150, 255, 0.28);
  flex-shrink: 0;
}

.btn-send.disabled {
  opacity: 0.55;
  box-shadow: none;
}

.empty-state {
  padding-top: 160rpx;
  text-align: center;
  font-size: 26rpx;
  color: #8c98a7;
}
</style>
