<template>
  <view class="resource-page">
    <view class="header">
      <text class="title">学习资源</text>
    </view>

    <scroll-view
      class="resource-list"
      scroll-y
      refresher-enabled
      :refresher-triggered="loading && page === 1"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <view
        v-for="resource in resources"
        :key="resource.id"
        class="resource-card"
        @tap="goToResourceDetail(resource.id)"
      >
        <image v-if="resource.cover" :src="resource.cover" class="resource-cover" mode="aspectFill" />
        <view class="resource-info">
          <view class="resource-name">{{ resource.title }}</view>
          <view class="resource-desc">{{ resource.description }}</view>
          <view class="resource-meta">
            <text>{{ resource.category }}</text>
            <text>{{ resource.downloads }} 收藏</text>
          </view>
        </view>
      </view>

      <view v-if="loading" class="loading-tip">加载中...</view>
      <view v-else-if="!hasMore && resources.length > 0" class="loading-tip">没有更多了</view>
      <view v-else-if="resources.length === 0" class="loading-tip">暂无资源</view>
    </scroll-view>

    <custom-tab-bar />
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CustomTabBar from '@/components/custom-tab-bar/custom-tab-bar.vue'
import { getResources, type Resource } from '@/api/resources'
import { resolveMediaUrls } from '@/utils/media'

interface ResourceCardItem {
  id: string
  title: string
  description: string
  category: string
  downloads: number
  cover: string
}

const resources = ref<ResourceCardItem[]>([])
const loading = ref(false)
const page = ref(1)
const limit = ref(20)
const hasMore = ref(true)

const mapResource = (resource: Resource): ResourceCardItem => ({
  id: resource.id,
  title: resource.title,
  description: resource.description || '这个资源还没有简介',
  category: resource.category || '未分类',
  downloads: resource.collectionsCount || 0,
  cover: resolveMediaUrls(resource.images)[0] || ''
})

const loadResources = async (refresh = false) => {
  if (loading.value) return

  if (refresh) {
    page.value = 1
    resources.value = []
    hasMore.value = true
  }

  if (!hasMore.value) return

  loading.value = true

  try {
    const res = await getResources({
      page: page.value,
      limit: limit.value
    })

    const nextBatch = res.data.map(mapResource)
    resources.value = refresh ? nextBatch : [...resources.value, ...nextBatch]
    hasMore.value = page.value < res.totalPages
    page.value += 1
  } catch (error) {
    console.error('加载资源失败:', error)
  } finally {
    loading.value = false
  }
}

const goToResourceDetail = (id: string) => {
  uni.navigateTo({
    url: `/pages/resource-detail/resource-detail?id=${id}`
  })
}

const onRefresh = () => {
  loadResources(true)
}

const onLoadMore = () => {
  if (!loading.value && hasMore.value) {
    loadResources()
  }
}

onMounted(() => {
  loadResources(true)
})

onShow(() => {
  if (!resources.value.length) {
    loadResources(true)
  }
})
</script>

<style scoped>
.resource-page {
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

.resource-list {
  height: calc(100vh - 88rpx);
  padding: 16rpx 0 180rpx;
  box-sizing: border-box;
}

/* #ifdef MP */
.resource-list {
  margin-top: 88rpx;
  height: calc(100vh - 88rpx);
}
/* #endif */

.resource-card {
  margin: 16rpx 32rpx;
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
}

.resource-cover {
  width: 100%;
  height: 280rpx;
  display: block;
}

.resource-info {
  padding: 24rpx 28rpx 28rpx;
}

.resource-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 12rpx;
}

.resource-desc {
  font-size: 28rpx;
  line-height: 1.6;
  color: #666;
  margin-bottom: 18rpx;
}

.resource-meta {
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
</style>
