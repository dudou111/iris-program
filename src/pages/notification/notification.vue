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

    <scroll-view class="notification-list" scroll-y>
      <view
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item"
        :class="{ unread: !notification.isRead }"
        @tap="handleNotificationClick(notification)"
      >
        <view class="notification-icon" :class="notification.type">
          <text v-if="notification.type === 'like'">❤️</text>
          <text v-if="notification.type === 'comment'">💬</text>
          <text v-if="notification.type === 'follow'">👤</text>
          <text v-if="notification.type === 'system'">🔔</text>
        </view>
        <view class="notification-content">
          <view class="notification-text">
            <text class="notification-user">{{ notification.username }}</text>
            <text class="notification-action">{{ notification.action }}</text>
          </view>
          <view class="notification-time">{{ notification.time }}</view>
        </view>
        <image v-if="notification.thumbnail" :src="notification.thumbnail" class="notification-thumbnail" mode="aspectFill" />
        <view v-if="!notification.isRead" class="unread-dot"></view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const notifications = ref([
  {
    id: 1,
    type: 'like',
    username: '张同学',
    action: '赞了你的动态',
    time: '5分钟前',
    thumbnail: 'https://picsum.photos/60/60?random=1',
    isRead: false,
    targetId: 1
  },
  {
    id: 2,
    type: 'comment',
    username: '李同学',
    action: '评论了你的动态：很棒的分享！',
    time: '1小时前',
    thumbnail: 'https://picsum.photos/60/60?random=2',
    isRead: false,
    targetId: 1
  },
  {
    id: 3,
    type: 'follow',
    username: '王同学',
    action: '关注了你',
    time: '2小时前',
    thumbnail: null,
    isRead: true,
    targetId: 3
  },
  {
    id: 4,
    type: 'system',
    username: '系统通知',
    action: '你的动态获得了100个赞',
    time: '1天前',
    thumbnail: null,
    isRead: true,
    targetId: null
  }
])

const handleBack = () => {
  uni.navigateBack()
}

const handleMarkAllRead = () => {
  notifications.value.forEach(n => n.isRead = true)
  uni.showToast({
    title: '已全部标记为已读',
    icon: 'success'
  })
}

const handleNotificationClick = (notification: any) => {
  notification.isRead = true

  if (notification.type === 'like' || notification.type === 'comment') {
    uni.navigateTo({
      url: `/pages/post-detail/post-detail?id=${notification.targetId}`
    })
  } else if (notification.type === 'follow') {
    uni.navigateTo({
      url: `/pages/user-profile/user-profile?id=${notification.targetId}`
    })
  }
}
</script>

<style scoped>
.notification-page {
  min-height: 100vh;
  background: #f8f8f8;
}

.header {
  position: sticky;
  top: 0;
  height: 44px;
  padding: 0 16px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e5e5;
  z-index: 100;
}

.title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #666;
}

.notification-list {
  height: calc(100vh - 44px);
}

.notification-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
}

.notification-item.unread {
  background: #f0f7ff;
}

.notification-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border-radius: 50%;
  flex-shrink: 0;
}

.notification-icon.like {
  background: #ffe6e6;
}

.notification-icon.comment {
  background: #e6f7ff;
}

.notification-icon.follow {
  background: #f0f0f0;
}

.notification-icon.system {
  background: #fff7e6;
}

.notification-content {
  flex: 1;
}

.notification-text {
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  margin-bottom: 4px;
}

.notification-user {
  font-weight: 500;
  color: #1890ff;
}

.notification-action {
  color: #666;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.notification-thumbnail {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  flex-shrink: 0;
}

.unread-dot {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 8px;
  height: 8px;
  background: #ff4d4f;
  border-radius: 50%;
}
</style>
