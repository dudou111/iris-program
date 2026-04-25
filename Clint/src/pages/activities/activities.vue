<template>
  <view class="activities-page">
    <view class="header">
      <text class="title">校园活动</text>
    </view>

    <scroll-view
      class="activity-list"
      scroll-y
      refresher-enabled
      :refresher-triggered="loading && page === 1"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <view
        v-for="activity in activities"
        :key="activity.id"
        class="activity-card"
        @tap="goToActivityDetail(activity.id)"
      >
        <image :src="activity.cover" class="activity-cover" mode="aspectFill" />
        <view class="activity-info">
          <view class="activity-name">{{ activity.title }}</view>
          <view class="activity-time">{{ activity.time }}</view>
          <view class="activity-location">{{ activity.location }}</view>
          <view class="activity-meta">
            <text>{{ activity.participants }} 人参加</text>
          </view>
        </view>
      </view>

      <view v-if="loading" class="loading-tip">加载中...</view>
      <view v-else-if="!hasMore && activities.length > 0" class="loading-tip">没有更多了</view>
      <view v-else-if="activities.length === 0" class="loading-tip">暂无活动</view>
    </scroll-view>

    <!-- 发布按钮 -->
    <view class="fab" @tap="handlePublish">
      <Icon name="plus" :size="24" color="#ffffff" />
    </view>

    <custom-tab-bar />
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CustomTabBar from '@/components/custom-tab-bar/custom-tab-bar.vue'
import Icon from '@/components/icon/icon.vue'
import { getActivities, type Activity } from '@/api/activities'
import { resolveMediaUrls } from '@/utils/media'
import { getToken } from '@/utils/request'

interface ActivityCardItem {
  id: string
  title: string
  cover: string
  time: string
  location: string
  participants: number
}

const activities = ref<ActivityCardItem[]>([])
const loading = ref(false)
const page = ref(1)
const limit = ref(20)
const hasMore = ref(true)

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const mapActivity = (activity: Activity): ActivityCardItem => ({
  id: activity.id,
  title: activity.title,
  cover: resolveMediaUrls(activity.images)[0] || 'https://picsum.photos/800/400?random=51',
  time: formatTime(activity.startTime),
  location: activity.location || '待定',
  participants: activity.currentParticipants || 0
})

const loadActivities = async (refresh = false) => {
  if (loading.value) return

  if (refresh) {
    page.value = 1
    activities.value = []
    hasMore.value = true
  }

  if (!hasMore.value) return

  loading.value = true

  try {
    const res = await getActivities({
      page: page.value,
      limit: limit.value
    })

    const nextBatch = res.data.map(mapActivity)
    activities.value = refresh ? nextBatch : [...activities.value, ...nextBatch]
    hasMore.value = page.value < res.totalPages
    page.value += 1
  } catch (error) {
    console.error('加载活动失败:', error)
  } finally {
    loading.value = false
  }
}

const goToActivityDetail = (id: string) => {
  uni.navigateTo({
    url: `/pages/activity-detail/activity-detail?id=${id}`
  })
}

const onRefresh = () => {
  loadActivities(true)
}

const onLoadMore = () => {
  if (!loading.value && hasMore.value) {
    loadActivities()
  }
}

const requireLogin = () => {
  if (getToken()) {
    return true
  }

  uni.showToast({
    title: '请先登录',
    icon: 'none'
  })
  setTimeout(() => {
    uni.navigateTo({ url: '/pages/login/login' })
  }, 600)
  return false
}

const handlePublish = () => {
  if (!requireLogin()) return

  uni.navigateTo({
    url: '/pages/publish-activity/publish-activity',
    fail: (err) => {
      console.error('页面跳转失败:', err)
    }
  })
}

onMounted(() => {
  loadActivities(true)
})

onShow(() => {
  // 每次页面显示时都刷新数据，确保发布后能立即看到新内容
  loadActivities(true)
})
</script>

<style scoped>
.activities-page {
  min-height: 100vh;
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
  border-bottom: 1rpx solid #e5e5e5;
  z-index: 100;
}

/* #ifdef MP */
.header {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
}
/* #endif */

.title {
  font-size: 36rpx;
  font-weight: 500;
  color: #333;
}

.activity-list {
  height: calc(100vh - 88rpx);
  padding: 16rpx 0 180rpx;
  box-sizing: border-box;
}

/* #ifdef MP */
.activity-list {
  margin-top: 88rpx;
  height: calc(100vh - 88rpx);
}
/* #endif */

.activity-card {
  margin: 16rpx 32rpx;
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
}

.activity-cover {
  width: 100%;
  height: 280rpx;
  display: block;
}

.activity-info {
  padding: 24rpx 28rpx 28rpx;
}

.activity-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 14rpx;
}

.activity-time,
.activity-location {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.activity-meta {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #999;
}

.loading-tip {
  padding: 40rpx;
  text-align: center;
  font-size: 28rpx;
  color: #999;
}

.fab {
  position: fixed;
  right: 32rpx;
  bottom: 160rpx;
  width: 112rpx;
  height: 112rpx;
  background: #1890ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  z-index: 100;
  transition: all 0.3s;
}

/* #ifdef H5 */
.fab:hover {
  transform: scale(1.1);
}
/* #endif */
</style>
