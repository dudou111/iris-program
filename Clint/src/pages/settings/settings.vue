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
import { clearToken } from '@/utils/request'

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        clearToken()
        uni.removeStorageSync('userInfo')
        uni.$emit('user:updated')

        uni.showToast({
          title: '已退出',
          icon: 'success',
          duration: 1200
        })

        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/login/login'
          })
        }, 300)
      }
    }
  })
}
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.settings-page {
  min-height: 100vh;
  background: #f8f8f8;
}

.header {
  height: 88rpx;
  padding: 0 32rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  border-bottom: 2rpx solid #e5e5e5;
}

.title {
  font-size: 36rpx;
  font-weight: 500;
  color: #333;
}

.menu-list {
  margin-top: 24rpx;
  background: #ffffff;
}

.menu-item {
  padding: 32rpx;
  display: flex;
  align-items: center;
  border-bottom: 2rpx solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.menu-value {
  font-size: 28rpx;
  color: #999;
  margin-right: 16rpx;
}

.menu-arrow {
  font-size: 48rpx;
  color: #ccc;
}

.logout-btn {
  margin: 48rpx 32rpx;
  padding: 24rpx;
  font-size: 32rpx;
  color: #ff4d4f;
  background: #ffffff;
  border-radius: 16rpx;
  text-align: center;
}
</style>
