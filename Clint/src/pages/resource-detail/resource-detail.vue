<template>
  <view class="resource-detail-page">
    <view class="header">
      <view class="icon-btn" @tap="handleBack">
        <text>‹</text>
      </view>
      <view class="title">资源详情</view>
      <view class="icon-btn" @tap="handleShare">
        <text>⋯</text>
      </view>
    </view>

    <view class="resource-cover">
      <image :src="resource.cover" mode="aspectFill" />
    </view>

    <view class="resource-info">
      <view class="resource-title">{{ resource.title }}</view>
      <view class="resource-meta">
        <text class="meta-item">📁 {{ resource.category }}</text>
        <text class="meta-item">⬇️ {{ resource.downloads }} 次下载</text>
      </view>
      <view class="resource-tags">
        <text v-for="tag in resource.tags" :key="tag" class="tag">{{ tag }}</text>
      </view>
    </view>

    <view class="resource-description">
      <view class="section-title">资源描述</view>
      <view class="description-text">{{ resource.description }}</view>
    </view>

    <view class="action-bar">
      <view class="btn-collect" :class="{ collected: resource.isCollected }" @tap="handleCollect">
        <text>{{ resource.isCollected ? '⭐ 已收藏' : '☆ 收藏' }}</text>
      </view>
      <view class="btn-download" @tap="handleDownload">
        <text>⬇️ 立即下载</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const resource = ref({
  id: 1,
  title: '高等数学复习资料合集',
  cover: 'https://picsum.photos/400/300?random=1',
  category: '学习资料',
  downloads: 1280,
  tags: ['数学', '考试', '复习资料'],
  description: '这是一份完整的高等数学复习资料，包含了所有章节的知识点总结、例题讲解和练习题。适合期末考试复习使用。',
  isCollected: false
})

const handleBack = () => {
  uni.navigateBack()
}

const handleShare = () => {
  uni.showToast({ title: '分享功能开发中', icon: 'none' ,
      duration: 2000
    })
}

const handleCollect = () => {
  resource.value.isCollected = !resource.value.isCollected
  uni.showToast({
    title: resource.value.isCollected ? '收藏成功' : '取消收藏',
    icon: 'success'
  ,
      duration: 2000
    })
}

const handleDownload = () => {
  uni.showToast({ title: '下载成功', icon: 'success' ,
      duration: 2000
    })
  resource.value.downloads++
}
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.resource-detail-page {
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

.resource-cover {
  width: 100%;
  height: 480rpx;
  background: #f0f0f0;
}

.resource-cover image {
  width: 100%;
  height: 100%;
}

.resource-info {
  background: #ffffff;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.resource-title {
  font-size: 40rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 24rpx;
}

.resource-meta {
  display: flex;
  gap: 32rpx;
  margin-bottom: 24rpx;
}

.meta-item {
  font-size: 26rpx;
  color: #999;
}

.resource-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag {
  padding: 8rpx 24rpx;
  font-size: 24rpx;
  color: #1890ff;
  background: #e6f7ff;
  border-radius: 24rpx;
}

.resource-description {
  background: #ffffff;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 24rpx;
}

.description-text {
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
  display: flex;
  gap: 24rpx;
  z-index: 100;
}

.btn-collect,
.btn-download {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  font-size: 30rpx;
  border-radius: 16rpx;
}

.btn-collect {
  flex: 1;
  color: #666;
  background: #f5f5f5;
}

.btn-collect.collected {
  color: #1890ff;
  background: #e6f7ff;
}

.btn-download {
  flex: 2;
  color: #ffffff;
  background: #1890ff;
}
</style>
