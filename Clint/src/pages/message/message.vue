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
          <view v-if="item.unread" class="badge-dot"></view>
        </view>
        <view class="message-content">
          <view class="message-header">
            <view class="message-name">{{ item.name }}</view>
            <view class="message-time">{{ item.time }}</view>
          </view>
          <view class="message-preview">{{ item.lastMessage }}</view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const messages = ref([
  {
    id: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang2',
    name: '张同学',
    lastMessage: '好的，明天见！',
    time: '10:30',
    unread: true
  },
  {
    id: 2,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Li2',
    name: '李同学',
    lastMessage: '这本书我已经看完了',
    time: '昨天',
    unread: false
  },
  {
    id: 3,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=System',
    name: '系统通知',
    lastMessage: '您有新的点赞和评论',
    time: '09-15',
    unread: true,
    isSystem: true
  },
  {
    id: 4,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wang2',
    name: '王同学',
    lastMessage: '周末一起打球吗？',
    time: '09-14',
    unread: false
  }
])

const handleSettings = () => {
  uni.showToast({ title: '设置功能开发中', icon: 'none' ,
      duration: 2000
    })
}

const handleItemClick = (item: any) => {
  if (item.isSystem) {
    uni.navigateTo({
    url: '/pages/notification/notification',
    fail: (err) => {
      console.error('页面跳转失败:', err)
    }
  })
  } else {
    uni.navigateTo({ url: `/pages/chat/chat?id=${item.id}` })
  }
}
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
</style>
