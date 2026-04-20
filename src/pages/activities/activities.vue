<template>
  <view class="activities-page">
    <view class="header">
      <text class="title">校园活动</text>
    </view>

    <scroll-view class="activity-list" scroll-y>
      <view v-for="activity in activities" :key="activity.id" class="activity-card" @tap="goToActivityDetail(activity.id)">
        <image :src="activity.cover" class="activity-cover" mode="aspectFill" />
        <view class="activity-info">
          <view class="activity-name">{{ activity.name }}</view>
          <view class="activity-time">
            <Icon name="clock" :size="14" color="#666" />
            <text>{{ activity.time }}</text>
          </view>
          <view class="activity-location">
            <Icon name="map-pin" :size="14" color="#666" />
            <text>{{ activity.location }}</text>
          </view>
          <view class="activity-meta">
            <text>{{ activity.participants }} 人参加</text>
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

const activities = ref([
  {
    id: 1,
    name: '篮球友谊赛',
    cover: 'https://picsum.photos/300/200?random=20',
    time: '2024-04-20 14:00',
    location: '体育馆',
    participants: 24
  },
  {
    id: 2,
    name: '读书分享会',
    cover: 'https://picsum.photos/300/200?random=21',
    time: '2024-04-22 19:00',
    location: '图书馆三楼',
    participants: 15
  },
  {
    id: 3,
    name: '校园音乐节',
    cover: 'https://picsum.photos/300/200?random=22',
    time: '2024-04-25 18:00',
    location: '大礼堂',
    participants: 156
  }
])

const goToActivityDetail = (id: number) => {
  uni.navigateTo({
    url: `/pages/activity-detail/activity-detail?id=${id}`
  })
}
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.activities-page {
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

.activity-list {
  height: calc(100vh - 88rpx);
  padding: 24rpx;
}

.activity-card {
  margin-bottom: 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
}

.activity-cover {
  width: 100%;
  height: 300rpx;
}

.activity-info {
  padding: 24rpx;
}

.activity-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 16rpx;
}

.activity-time,
.activity-location {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 8rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.activity-meta {
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
