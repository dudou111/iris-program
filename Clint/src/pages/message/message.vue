<template>
  <view class="message-page">
    <view class="header">
      <view class="title">消息</view>
      <view class="icon-btn" @tap="handleSettings">
        <text>⚙️</text>
      </view>
    </view>

    <scroll-view class="message-list" scroll-y>
      <view
        v-for="item in messages"
        :key="item.id"
        class="message-item"
        @tap="handleItemClick(item)"
      >
        <view class="message-avatar">
          <image :src="item.avatar" class="avatar-img" mode="aspectFill" />
          <view v-if="item.unreadCount > 0" class="badge-dot"></view>
        </view>
        <view class="message-content">
          <view class="message-header">
            <view class="message-name">{{ item.name }}</view>
            <view class="message-time">{{ item.time }}</view>
          </view>
          <view class="message-preview">{{ item.lastMessage }}</view>
        </view>
      </view>
      <view v-if="loading" class="status-text">加载中...</view>
      <view v-else-if="messages.length === 0" class="status-text">还没有聊天记录，去和同学打个招呼吧</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getConversations, type Conversation } from '@/api/messages'
import { createDefaultAvatar, resolveMediaUrl } from '@/utils/media'

interface MessageListItem {
  id: string
  userId: string
  avatar: string
  name: string
  lastMessage: string
  time: string
  unreadCount: number
}

const messages = ref<MessageListItem[]>([])
const loading = ref(false)

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString('zh-CN')
}

const mapConversation = (conversation: Conversation): MessageListItem => ({
  id: conversation.user.id,
  userId: conversation.user.id,
  avatar:
    resolveMediaUrl(conversation.user.avatar) ||
    createDefaultAvatar(conversation.user.nickname || conversation.user.id),
  name: conversation.user.nickname || '未知用户',
  lastMessage: conversation.lastMessage.content || '开始聊天吧',
  time: formatTime(conversation.lastMessage.createdAt),
  unreadCount: conversation.unreadCount || 0
})

const loadConversations = async () => {
  loading.value = true

  try {
    const res = await getConversations({ page: 1, limit: 50 })
    messages.value = res.data.map(mapConversation)
  } catch (error) {
    console.error('加载会话列表失败:', error)
    uni.showToast({ title: '加载消息失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const handleSettings = () => {
  uni.showToast({ title: '设置功能开发中', icon: 'none', duration: 2000 })
}

const handleItemClick = (item: MessageListItem) => {
  const query = `id=${item.userId}&nickname=${encodeURIComponent(item.name)}&avatar=${encodeURIComponent(item.avatar)}`

  uni.navigateTo({
    url: `/pages/chat/chat?${query}`,
    fail: (err) => {
      console.error('页面跳转失败:', err)
    }
  })
}

onShow(() => {
  loadConversations()
})
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.message-page {
  min-height: 100vh;
  background: #f8f8f8;
}

.header {
  position: sticky;
  top: 0;
  height: 88rpx;
  padding: 0 32rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2rpx solid #e5e5e5;
  z-index: 100;
}

.title {
  font-size: 36rpx;
  font-weight: 500;
  color: #333;
}

.icon-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #666;
}

.message-list {
  height: calc(100vh - 88rpx);
  background: #ffffff;
}

.message-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.message-item:active {
  background: #f5f5f5;
}

.message-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-img {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
}

.badge-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 16rpx;
  height: 16rpx;
  background: #ff4d4f;
  border-radius: 50%;
  border: 4rpx solid #ffffff;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.message-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
}

.message-time {
  font-size: 24rpx;
  color: #999;
  flex-shrink: 0;
}

.message-preview {
  font-size: 26rpx;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-text {
  padding: 64rpx 32rpx;
  text-align: center;
  font-size: 28rpx;
  color: #999;
}
</style>
