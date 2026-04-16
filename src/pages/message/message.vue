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
  uni.showToast({ title: '设置功能开发中', icon: 'none' })
}

const handleItemClick = (item: any) => {
  if (item.isSystem) {
    uni.navigateTo({ url: '/pages/notification/notification' })
  } else {
    uni.navigateTo({ url: `/pages/chat/chat?id=${item.id}` })
  }
}
</script>

<style scoped>
.message-page {
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
  font-size: 20px;
  color: #666;
}

.message-list {
  height: calc(100vh - 44px);
  background: #ffffff;
}

.message-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.message-item:active {
  background: #f5f5f5;
}

.message-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.badge-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background: #ff4d4f;
  border-radius: 50%;
  border: 2px solid #ffffff;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.message-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.message-time {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
}

.message-preview {
  font-size: 13px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
