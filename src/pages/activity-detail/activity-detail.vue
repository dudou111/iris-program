<template>
  <view class="activity-detail-page">
    <view class="header">
      <view class="icon-btn" @tap="handleBack">
        <text>‹</text>
      </view>
      <view class="title">活动详情</view>
      <view class="icon-btn" @tap="handleShare">
        <text>⋯</text>
      </view>
    </view>

    <view class="activity-cover">
      <image :src="activity.cover" mode="aspectFill" />
    </view>

    <view class="activity-info">
      <view class="activity-title">{{ activity.title }}</view>
      <view class="activity-meta">
        <text class="meta-item">📅 {{ activity.date }}</text>
        <text class="meta-item">📍 {{ activity.location }}</text>
        <text class="meta-item">👥 {{ activity.participants }}/{{ activity.maxParticipants }}</text>
      </view>
      <view class="activity-desc">{{ activity.description }}</view>
    </view>

    <view class="action-bar">
      <view class="btn-register" :class="{ registered: activity.isRegistered }" @tap="handleRegister">
        <text>{{ activity.isRegistered ? '已报名' : '立即报名' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activity = ref({
  id: 1,
  title: '编程马拉松大赛',
  cover: 'https://picsum.photos/400/300?random=20',
  date: '2026-04-20 09:00',
  location: '图书馆',
  participants: 45,
  maxParticipants: 100,
  description: '这是一场精彩的编程马拉松活动，欢迎所有编程爱好者参加！我们将进行为期一天的编程挑战，优胜者将获得丰厚奖品。',
  isRegistered: false
})

const handleBack = () => {
  uni.navigateBack()
}

const handleShare = () => {
  uni.showToast({ title: '分享功能开发中', icon: 'none' ,
      duration: 2000
    })
}

const handleRegister = () => {
  activity.value.isRegistered = !activity.value.isRegistered
  if (activity.value.isRegistered) {
    activity.value.participants++
  } else {
    activity.value.participants--
  }
  uni.showToast({
    title: activity.value.isRegistered ? '报名成功' : '取消报名',
    icon: 'success'
  ,
      duration: 2000
    })
}
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.activity-detail-page {
  min-height: 100vh;
  padding-bottom: 140rpx;
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

.activity-cover {
  width: 100%;
  height: 480rpx;
  background: #f0f0f0;
}

.activity-cover image {
  width: 100%;
  height: 100%;
}

.activity-info {
  background: #ffffff;
  padding: 32rpx;
}

.activity-title {
  font-size: 40rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 24rpx;
}

.activity-meta {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.meta-item {
  font-size: 28rpx;
  color: #666;
}

.activity-desc {
  font-size: 28rpx;
  line-height: 1.6;
  color: #666;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  padding: 16rpx 32rpx;
  background: #ffffff;
  border-top: 2rpx solid #e5e5e5;
  z-index: 100;
}

.btn-register {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 500;
  color: #ffffff;
  background: #1890ff;
  border-radius: 16rpx;
}

.btn-register.registered {
  color: #666;
  background: #f5f5f5;
}
</style>
