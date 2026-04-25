<template>
  <view class="circles-page">
    <view class="header">
      <text class="title">校园圈子</text>
    </view>

    <scroll-view
      class="circle-list"
      scroll-y
      refresher-enabled
      :refresher-triggered="loading && page === 1"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <view
        v-for="circle in circles"
        :key="circle.id"
        class="circle-card"
        @tap="goToCircleDetail(circle.id)"
      >
        <image :src="circle.cover" class="circle-cover" mode="aspectFill" />
        <view class="circle-info">
          <view class="circle-name">{{ circle.name }}</view>
          <view class="circle-desc">{{ circle.description }}</view>
          <view class="circle-meta">
            <text>{{ circle.membersCount }} 成员</text>
            <text>{{ circle.postsCount }} 动态</text>
          </view>
        </view>
      </view>

      <view v-if="loading" class="loading-tip">加载中...</view>
      <view v-else-if="!hasMore && circles.length > 0" class="loading-tip">没有更多了</view>
      <view v-else-if="circles.length === 0" class="loading-tip">暂无圈子</view>
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
import { getCircles, type Circle } from '@/api/circles'
import { resolveMediaUrl } from '@/utils/media'
import { getToken } from '@/utils/request'

interface CircleCardItem {
  id: string
  name: string
  description: string
  cover: string
  membersCount: number
  postsCount: number
}

const circles = ref<CircleCardItem[]>([])
const loading = ref(false)
const page = ref(1)
const limit = ref(20)
const hasMore = ref(true)

const mapCircle = (circle: Circle): CircleCardItem => ({
  id: circle.id,
  name: circle.name,
  description: circle.description || '这个圈子还没有简介',
  cover: resolveMediaUrl(circle.cover) || 'https://picsum.photos/800/400?random=41',
  membersCount: circle.membersCount || 0,
  postsCount: circle.postsCount || 0
})

const loadCircles = async (refresh = false) => {
  if (loading.value) return

  if (refresh) {
    page.value = 1
    circles.value = []
    hasMore.value = true
  }

  if (!hasMore.value) return

  loading.value = true

  try {
    const res = await getCircles({
      page: page.value,
      limit: limit.value
    })

    const nextBatch = res.data.map(mapCircle)
    circles.value = refresh ? nextBatch : [...circles.value, ...nextBatch]
    hasMore.value = page.value < res.totalPages
    page.value += 1
  } catch (error) {
    console.error('加载圈子失败:', error)
  } finally {
    loading.value = false
  }
}

const goToCircleDetail = (id: string) => {
  uni.navigateTo({
    url: `/pages/circle-detail/circle-detail?id=${id}`
  })
}

const onRefresh = () => {
  loadCircles(true)
}

const onLoadMore = () => {
  if (!loading.value && hasMore.value) {
    loadCircles()
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
    url: '/pages/publish-circle/publish-circle',
    fail: (err) => {
      console.error('页面跳转失败:', err)
    }
  })
}

onMounted(() => {
  loadCircles(true)
})

onShow(() => {
  // 每次页面显示时都刷新数据，确保发布后能立即看到新内容
  loadCircles(true)
})
</script>

<style scoped>
.circles-page {
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

.circle-list {
  height: calc(100vh - 88rpx);
  padding: 16rpx 0 180rpx;
  box-sizing: border-box;
}

/* #ifdef MP */
.circle-list {
  margin-top: 88rpx;
  height: calc(100vh - 88rpx);
}
/* #endif */

.circle-card {
  margin: 16rpx 32rpx;
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
}

.circle-cover {
  width: 100%;
  height: 280rpx;
  display: block;
}

.circle-info {
  padding: 24rpx 28rpx 28rpx;
}

.circle-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 14rpx;
}

.circle-desc {
  font-size: 26rpx;
  line-height: 1.6;
  color: #666;
  margin-bottom: 18rpx;
}

.circle-meta {
  display: flex;
  gap: 24rpx;
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
