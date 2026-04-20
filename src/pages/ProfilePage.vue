<template>
  <view class="profile-page">
    <!-- 用户信息区 -->
    <view class="profile-header">
      <view class="header-bg"></view>
      <view class="icon-btn settings-btn" @tap="handleSettings">
        <Settings :size="24" />
      </view>
      <view class="profile-info">
        <image src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" alt="头像" class="profile-avatar" @tap="handleEditProfile" />
        <view class="profile-name">用户昵称</view>
        <view class="profile-bio">这是一段个性签名 | 某某大学</view>
        <button class="btn-edit" @tap="handleEditProfile">编辑资料</button>
      </view>
      <view class="profile-stats">
        <view class="stat-item" @tap="handleStatClick('posts')">
          <view class="stat-value">12</view>
          <view class="stat-label">动态</view>
        </view>
        <view class="stat-item" @tap="handleStatClick('following')">
          <view class="stat-value">156</view>
          <view class="stat-label">关注</view>
        </view>
        <view class="stat-item" @tap="handleStatClick('followers')">
          <view class="stat-value">89</view>
          <view class="stat-label">粉丝</view>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-item" @tap="handleMenuClick('posts')">
        <view class="menu-icon">📝</view>
        <view class="menu-label">我的发布</view>
        <view class="menu-arrow">›</view>
      </view>
      <view class="menu-item" @tap="handleMenuClick('favorites')">
        <view class="menu-icon">⭐</view>
        <view class="menu-label">我的收藏</view>
        <view class="menu-arrow">›</view>
      </view>
      <view class="menu-item" @tap="handleMenuClick('orders')">
        <view class="menu-icon">🏷️</view>
        <view class="menu-label">我的订单</view>
        <view class="menu-arrow">›</view>
      </view>
    </view>

    <view class="menu-section">
      <view class="menu-item" @tap="handleMenuClick('settings')">
        <view class="menu-icon">⚙️</view>
        <view class="menu-label">设置</view>
        <view class="menu-arrow">›</view>
      </view>
    </view>

    <!-- 底部导航 -->
    <TabBar />
  </view>
</template>

<script setup lang="ts">
import TabBar from '@/components/TabBar.vue'


const handleSettings = () => {
  uni.navigateTo({ url: '/settings')
}

const handleEditProfile = () => {
  uni.navigateTo({ url: '/edit-profile')
}

const handleStatClick = (type: string) => {
  if (type === 'posts') {
    uni.navigateTo({ url: '/my-posts')
  } else if (type === 'following') {
    uni.navigateTo({ url: '/following')
  } else if (type === 'followers') {
    uni.navigateTo({ url: '/followers')
  }
}

const handleMenuClick = (type: string) => {
  if (type === 'posts') {
    uni.navigateTo({ url: '/my-posts')
  } else if (type === 'favorites') {
    uni.navigateTo({ url: '/my-collections')
  } else if (type === 'orders') {
    console.log('我的订单功能待开发')
  } else if (type === 'settings') {
    uni.navigateTo({ url: '/settings')
  }
}
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.profile-page {
  min-height: 100vh;
  padding-bottom: 100rpx;
  background: var(--color-bg-page);
}

.profile-header {
  position: relative;
  background: var(--color-bg-white);
  padding-bottom: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.header-bg {
  height: 240rpx;
  background: var(--gradient-primary);
}

.settings-btn {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  width: 48rpx;
  height: 48rpx;
  color: var(--color-text-white);
  cursor: pointer;
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -80rpx;
}

.profile-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: var(--radius-round);
  border: 8rpx solid var(--color-bg-white);
  object-fit: cover;
  margin-bottom: var(--spacing-sm);
}

.profile-name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.profile-bio {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  text-align: center;
  margin-bottom: var(--spacing-md);
}

.btn-edit {
  padding: 12rpx 48rpx;
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  background: var(--color-bg-white);
  border: 2rpx solid var(--color-primary);
  border-radius: var(--radius-full);
  cursor: pointer;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  padding: var(--spacing-lg) var(--spacing-xl) 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.menu-section {
  background: var(--color-bg-white);
  border-radius: var(--radius-base);
  margin: 0 var(--page-padding) var(--spacing-md);
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  height: 100rpx;
  padding: 0 var(--spacing-md);
  border-bottom: var(--border-width-thin) solid var(--color-border-light);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: var(--color-bg-gray);
}

.menu-icon {
  font-size: 40rpx;
  margin-right: var(--spacing-md);
}

.menu-label {
  flex: 1;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.menu-arrow {
  font-size: 40rpx;
  color: var(--color-text-tertiary);
}
</style>
