<template>
  <view class="circles-page">
    <view class="header">
      <text class="title">校园圈子</text>
    </view>

    <scroll-view class="circle-list" scroll-y>
      <view v-for="circle in circles" :key="circle.id" class="circle-card" @tap="goToCircleDetail(circle.id)">
        <image :src="circle.cover" class="circle-cover" mode="aspectFill" />
        <view class="circle-info">
          <view class="circle-name">{{ circle.name }}</view>
          <view class="circle-desc">{{ circle.description }}</view>
          <view class="circle-meta">
            <text>{{ circle.members }} 成员</text>
            <text>{{ circle.posts }} 动态</text>
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

const circles = ref([
  {
    id: 1,
    name: '学习交流',
    description: '分享学习经验，共同进步',
    cover: 'https://picsum.photos/300/200?random=10',
    members: 1234,
    posts: 567
  },
  {
    id: 2,
    name: '运动健身',
    description: '一起运动，保持健康',
    cover: 'https://picsum.photos/300/200?random=11',
    members: 890,
    posts: 345
  },
  {
    id: 3,
    name: '美食分享',
    description: '发现校园美食',
    cover: 'https://picsum.photos/300/200?random=12',
    members: 2345,
    posts: 1234
  }
])

const goToCircleDetail = (id: number) => {
  uni.navigateTo({
    url: `/pages/circle-detail/circle-detail?id=${id}`
  })
}
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.circles-page {
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

.circle-list {
  height: calc(100vh - 88rpx);
  padding: 24rpx;
}

.circle-card {
  margin-bottom: 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
}

.circle-cover {
  width: 100%;
  height: 300rpx;
}

.circle-info {
  padding: 24rpx;
}

.circle-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.circle-desc {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.circle-meta {
  display: flex;
  
  font-size: 24rpx;
  color: #999;
}
</style>
