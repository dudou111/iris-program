<template>
  <view class="following-page">
    <view class="header">
      <view class="icon-btn" @tap="handleBack">
        <ChevronLeft :size="24" />
      </view>
      <view class="title">我的关注</view>
      <view class="icon-btn"></view>
    </view>

    <view class="user-list">
      <view v-for="user in users" :key="user.id" class="user-item" @tap="handleUserClick(user)">
        <image :src="user.avatar" :alt="user.username" class="user-avatar" />
        <view class="user-info">
          <view class="user-name">{{ user.username }}</view>
          <view class="user-bio">{{ user.bio }}</view>
        </view>
        <button class="btn-unfollow" @tap.stop="handleUnfollow(user)">已关注</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'


const users = ref([
  { id: 1, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User1', username: '张同学', bio: '计算机学院' },
  { id: 2, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User2', username: '李同学', bio: '设计学院' }
])

const handleBack = () => uni.navigateBack()
const handleUserClick = (user: any) => uni.navigateTo({ url: `/user/${user.id}`)
const handleUnfollow = (user: any) => {
  users.value = users.value.filter(u => u.id !== user.id)
}
</script>

<style scoped>
.following-page {
  min-height: 100vh;
  background: var(--color-bg-page);
}

.header {
  position: sticky;
  top: 0;
  height: 44px;
  padding: 0 var(--page-padding);
  background: var(--color-bg-white);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: var(--border-width-thin) solid var(--color-border-base);
  z-index: var(--z-index-sticky);
}

.title {
  flex: 1;
  text-align: center;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.icon-btn {
  width: 24px;
  height: 24px;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.user-list {
  padding: var(--spacing-sm) var(--page-padding);
}

.user-item {
  display: flex;
  align-items: center;
  
  padding: var(--spacing-md);
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
  cursor: pointer;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-round);
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.user-bio {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.btn-unfollow {
  padding: 6px 16px;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: var(--color-bg-gray);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
}
</style>
