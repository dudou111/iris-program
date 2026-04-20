<template>
  <view class="resource-page">
    <view class="header">
      <text class="title">学习资源</text>
    </view>

    <scroll-view class="resource-list" scroll-y>
      <view v-for="resource in resources" :key="resource.id" class="resource-card" @tap="goToResourceDetail(resource.id)">
        <view class="resource-icon">
          <Icon name="book" :size="32" color="#1890ff" />
        </view>
        <view class="resource-info">
          <view class="resource-name">{{ resource.name }}</view>
          <view class="resource-desc">{{ resource.description }}</view>
          <view class="resource-meta">
            <view class="meta-item">
              <Icon name="download" :size="12" color="#999" />
              <text>{{ resource.downloads }} 下载</text>
            </view>
            <text>{{ resource.size }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 自定义 TabBar -->
    <custom-tab-bar />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CustomTabBar from '@/components/custom-tab-bar/custom-tab-bar.vue'
import Icon from '@/components/icon/icon.vue'

const resources = ref([
  {
    id: 1,
    name: '高等数学复习资料',
    description: '期末考试重点整理',
    downloads: 234,
    size: '2.5MB'
  },
  {
    id: 2,
    name: '英语四级词汇表',
    description: '核心词汇3000个',
    downloads: 567,
    size: '1.2MB'
  },
  {
    id: 3,
    name: '计算机网络课件',
    description: '完整PPT课件',
    downloads: 123,
    size: '5.8MB'
  }
])

const goToResourceDetail = (id: number) => {
  uni.navigateTo({
    url: `/pages/resource-detail/resource-detail?id=${id}`
  })
}
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.resource-page {
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

.resource-list {
  height: calc(100vh - 88rpx);
  padding: 24rpx;
}

.resource-card {
  margin-bottom: 24rpx;
  padding: 32rpx;
  background: #ffffff;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
}

.resource-icon {
  width: 96rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.resource-info {
  flex: 1;
}

.resource-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.resource-desc {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.resource-meta {
  display: flex;
  gap: 24rpx;
  font-size: 24rpx;
  color: #999;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
</style>
