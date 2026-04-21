<template>
  <view class="notification-page">
    <view class="header">
      <view class="icon-btn" @tap="handleBack">
        <text>‹</text>
      </view>
      <view class="title">通知</view>
      <view class="icon-btn" @tap="handleMarkAllRead">
        <text>✓</text>
      </view>
    </view>

    <scroll-view class="notification-list" scroll-y @scrolltolower="handleLoadMore">
      <view
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item"
        :class="{ unread: !notification.isRead }"
        @tap="handleNotificationClick(notification)"
      >
        <view class="notification-avatar-wrap">
          <image :src="notification.avatar" class="notification-avatar" mode="aspectFill" />
          <view class="notification-icon" :class="notification.type">
            <text>{{ notification.icon }}</text>
          </view>
        </view>
        <view class="notification-content">
          <view class="notification-text">
            <text class="notification-user">{{ notification.username }}</text>
            <text class="notification-action">{{ notification.action }}</text>
          </view>
          <view class="notification-time">{{ notification.time }}</view>
        </view>
        <image
          v-if="notification.thumbnail"
          :src="notification.thumbnail"
          class="notification-thumbnail"
          mode="aspectFill"
        />
        <view v-if="!notification.isRead" class="unread-dot"></view>
      </view>

      <view v-if="loading" class="status-text">加载中...</view>
      <view v-else-if="!hasMore && notifications.length > 0" class="status-text">没有更多通知了</view>
      <view v-else-if="notifications.length === 0" class="empty-state">
        <view class="empty-title">暂无通知</view>
        <view class="empty-desc">有人点赞、评论或关注你后，会在这里出现。</view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationType,
  type SocialNotification
} from '@/api/notifications'
import { createDefaultAvatar, resolveMediaUrl, resolveMediaUrls } from '@/utils/media'

interface NotificationItem {
  id: string
  type: NotificationType
  icon: string
  username: string
  avatar: string
  action: string
  time: string
  thumbnail: string
  isRead: boolean
  postId: string
  actorId: string
}

const notifications = ref<NotificationItem[]>([])
const loading = ref(false)
const page = ref(1)
const limit = ref(20)
const hasMore = ref(true)

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

const buildActionText = (notification: SocialNotification) => {
  if (notification.type === 'like') {
    return '赞了你的动态'
  }

  if (notification.type === 'comment') {
    const content = notification.comment?.content?.trim()
    return content ? `评论了你的动态：${content}` : '评论了你的动态'
  }

  return '关注了你'
}

const getNotificationIcon = (type: NotificationType) => {
  if (type === 'like') return '❤'
  if (type === 'comment') return '💬'
  return '👤'
}

const mapNotification = (notification: SocialNotification): NotificationItem => {
  const nickname = notification.actor?.nickname || '新朋友'
  const images = resolveMediaUrls(notification.post?.images ?? undefined)

  return {
    id: notification.id,
    type: notification.type,
    icon: getNotificationIcon(notification.type),
    username: nickname,
    avatar: resolveMediaUrl(notification.actor?.avatar) || createDefaultAvatar(nickname),
    action: buildActionText(notification),
    time: formatTime(notification.createdAt),
    thumbnail: images[0] || '',
    isRead: Boolean(notification.isRead),
    postId: notification.postId || '',
    actorId: notification.actorId
  }
}

const loadNotifications = async (refresh = false) => {
  if (loading.value) return

  if (refresh) {
    page.value = 1
    hasMore.value = true
    notifications.value = []
  }

  if (!hasMore.value) return

  loading.value = true

  try {
    const res = await getNotifications({
      page: page.value,
      limit: limit.value
    })
    const items = res.data.map(mapNotification)

    if (refresh) {
      notifications.value = items
    } else {
      notifications.value = [...notifications.value, ...items]
    }

    hasMore.value = page.value < res.totalPages
    page.value += 1
  } catch (error) {
    console.error('加载通知失败:', error)
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  uni.navigateBack()
}

const syncUnreadState = () => {
  uni.$emit('notifications:updated')
}

const markAsReadIfNeeded = async (notification: NotificationItem) => {
  if (notification.isRead) {
    return
  }

  await markNotificationRead(notification.id)
  notification.isRead = true
  syncUnreadState()
}

const handleMarkAllRead = async () => {
  try {
    const res = await markAllNotificationsRead()

    if (!res.count) {
      uni.showToast({
        title: '暂无未读通知',
        icon: 'none'
      })
      return
    }

    notifications.value.forEach((item) => {
      item.isRead = true
    })
    syncUnreadState()
    uni.showToast({
      title: '已全部标记为已读',
      icon: 'success'
    })
  } catch (error) {
    console.error('标记通知已读失败:', error)
  }
}

const handleNotificationClick = async (notification: NotificationItem) => {
  try {
    await markAsReadIfNeeded(notification)

    if (notification.type === 'follow' && notification.actorId) {
      uni.navigateTo({
        url: `/pages/user-profile/user-profile?id=${notification.actorId}`
      })
      return
    }

    if (notification.postId) {
      uni.navigateTo({
        url: `/pages/post-detail/post-detail?id=${notification.postId}`
      })
    }
  } catch (error) {
    console.error('处理通知点击失败:', error)
  }
}

const handleLoadMore = () => {
  if (!loading.value && hasMore.value) {
    loadNotifications()
  }
}

onShow(() => {
  loadNotifications(true)
})
</script>

<style scoped>
.notification-page {
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
  flex: 1;
  text-align: center;
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
  font-size: 48rpx;
  color: #666;
}

.notification-list {
  height: calc(100vh - 88rpx);
  box-sizing: border-box;
}

.notification-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 32rpx;
  background: #ffffff;
  border-bottom: 2rpx solid #f0f0f0;
}

.notification-item.unread {
  background: #f0f7ff;
}

.notification-avatar-wrap {
  position: relative;
  width: 88rpx;
  height: 88rpx;
  flex-shrink: 0;
}

.notification-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: #f0f0f0;
}

.notification-icon {
  position: absolute;
  right: -4rpx;
  bottom: -4rpx;
  width: 36rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  border-radius: 50%;
  color: #ffffff;
  border: 4rpx solid #ffffff;
}

.notification-icon.like {
  background: #ff6b81;
}

.notification-icon.comment {
  background: #4dabf7;
}

.notification-icon.follow {
  background: #51cf66;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-text {
  font-size: 28rpx;
  line-height: 1.5;
  color: #333;
  margin-bottom: 8rpx;
}

.notification-user {
  font-weight: 500;
  color: #1890ff;
}

.notification-action {
  color: #666;
}

.notification-time {
  font-size: 24rpx;
  color: #999;
}

.notification-thumbnail {
  width: 100rpx;
  height: 100rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  background: #f5f5f5;
}

.unread-dot {
  position: absolute;
  top: 32rpx;
  right: 32rpx;
  width: 16rpx;
  height: 16rpx;
  background: #ff4d4f;
  border-radius: 50%;
}

.status-text {
  text-align: center;
  padding: 32rpx;
  font-size: 26rpx;
  color: #999;
}

.empty-state {
  padding: 160rpx 48rpx;
  text-align: center;
}

.empty-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.empty-desc {
  margin-top: 16rpx;
  font-size: 26rpx;
  line-height: 1.6;
  color: #999;
}
</style>
