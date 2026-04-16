<template>
  <view class="settings-page">
    <view class="header">
      <text class="title">设置</text>
    </view>

    <view class="menu-list">
      <view class="menu-item">
        <text class="menu-text">账号与安全</text>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item">
        <text class="menu-text">隐私设置</text>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item">
        <text class="menu-text">通知设置</text>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item">
        <text class="menu-text">清除缓存</text>
        <text class="menu-value">0.0MB</text>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item">
        <text class="menu-text">关于我们</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="logout-btn" @tap="handleLogout">退出登录</view>
  </view>
</template>

<script setup lang="ts">
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: '已退出',
          icon: 'success'
        })
      }
    }
  })
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: #f8f8f8;
}

.header {
  height: 44px;
  padding: 0 16px;
  background: #ffffff;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e5e5e5;
}

.title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.menu-list {
  margin-top: 12px;
  background: #ffffff;
}

.menu-item {
  padding: 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-text {
  flex: 1;
  font-size: 15px;
  color: #333;
}

.menu-value {
  font-size: 14px;
  color: #999;
  margin-right: 8px;
}

.menu-arrow {
  font-size: 24px;
  color: #ccc;
}

.logout-btn {
  margin: 24px 16px;
  padding: 12px;
  font-size: 16px;
  color: #ff4d4f;
  background: #ffffff;
  border-radius: 8px;
  text-align: center;
}
</style>
