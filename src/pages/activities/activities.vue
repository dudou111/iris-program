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
          <view class="activity-time">⏰ {{ activity.time }}</view>
          <view class="activity-location">📍 {{ activity.location }}</view>
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
.activities-page {
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

.activity-list {
  height: calc(100vh - 44px);
  padding: 12px;
}

.activity-card {
  margin-bottom: 12px;
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
}

.activity-cover {
  width: 100%;
  height: 150px;
}

.activity-info {
  padding: 12px;
}

.activity-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.activity-time,
.activity-location {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.activity-meta {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}
</style>
