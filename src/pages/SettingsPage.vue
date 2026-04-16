<template>
  <view class="settings-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="icon-btn" @tap="handleBack">
        <ChevronLeft :size="24" />
      </view>
      <view class="title">设置</view>
      <view class="icon-btn"></view>
    </view>

    <!-- 设置列表 -->
    <view class="settings-list">
      <view class="settings-group">
        <view class="settings-item" @tap="handleNavigate('account')">
          <view class="item-left">
            <User :size="20" />
            <span>账号设置</span>
          </view>
          <ChevronRight :size="20" />
        </view>
        <view class="settings-item" @tap="handleNavigate('privacy')">
          <view class="item-left">
            <Lock :size="20" />
            <span>隐私设置</span>
          </view>
          <ChevronRight :size="20" />
        </view>
        <view class="settings-item" @tap="handleNavigate('notification')">
          <view class="item-left">
            <Bell :size="20" />
            <span>通知设置</span>
          </view>
          <ChevronRight :size="20" />
        </view>
      </view>

      <view class="settings-group">
        <view class="settings-item">
          <view class="item-left">
            <HelpCircle :size="20" />
            <span>帮助与反馈</span>
          </view>
          <ChevronRight :size="20" />
        </view>
        <view class="settings-item">
          <view class="item-left">
            <Info :size="20" />
            <span>关于我们</span>
          </view>
          <ChevronRight :size="20" />
        </view>
      </view>

      <view class="settings-group">
        <view class="settings-item logout" @tap="handleLogout">
          <span>退出登录</span>
        </view>
      </view>
    </view>

    <!-- 子路由出口 -->
    <router-view />
  </view>
</template>

<script setup lang="ts">


const handleBack = () => {
  uni.navigateBack()
}

const handleNavigate = (path: string) => {
  uni.navigateTo({ url: `/settings/${path}`)
}

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('user_token')
    uni.navigateTo({ url: '/home')
  }
}
</script>

<style scoped>
.settings-page {
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

.settings-list {
  padding: var(--spacing-sm) 0;
}

.settings-group {
  background: var(--color-bg-white);
  margin-bottom: var(--spacing-sm);
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--page-padding);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
  border-bottom: var(--border-width-thin) solid var(--color-border-base);
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-item:hover {
  background: var(--color-bg-gray);
}

.item-left {
  display: flex;
  align-items: center;
  
  color: var(--color-text-primary);
}

.settings-item.logout {
  justify-content: center;
  color: var(--color-error);
  font-weight: var(--font-weight-medium);
}
</style>
