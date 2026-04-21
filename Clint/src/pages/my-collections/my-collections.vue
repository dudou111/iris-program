<template>
  <view class="my-collections-page">
    <view class="header">
      <text class="title">我的收藏</text>
    </view>

    <scroll-view class="collection-list" scroll-y>
      <view v-if="loading" class="empty-tip">加载中...</view>
      <view v-else-if="collections.length === 0" class="empty-tip">还没有收藏内容</view>
      <view v-for="item in collections" :key="`${item.type}-${item.id}`" class="collection-card" @tap="goToDetail(item)">
        <image v-if="item.cover" :src="item.cover" class="collection-cover" mode="aspectFill" />
        <view class="collection-type">{{ item.type === 'post' ? '动态' : '资源' }}</view>
        <view class="collection-content">{{ item.content }}</view>
        <view class="collection-time">{{ item.time }}</view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getMyCollections } from '@/api/users'
import type { Post } from '@/api/posts'
import type { Resource } from '@/api/resources'
import { resolveMediaUrls } from '@/utils/media'
import { getToken } from '@/utils/request'

interface CollectionItem {
  id: string
  type: 'post' | 'resource'
  content: string
  cover: string
  time: string
  sortTime: number
}

const collections = ref<CollectionItem[]>([])
const loading = ref(false)

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚收藏'
  if (minutes < 60) return `收藏于 ${minutes}分钟前`
  if (hours < 24) return `收藏于 ${hours}小时前`
  if (days < 7) return `收藏于 ${days}天前`

  return `收藏于 ${date.toLocaleDateString('zh-CN')}`
}

const mapPost = (post: Post): CollectionItem => ({
  id: post.id,
  type: 'post',
  content: post.content,
  cover: resolveMediaUrls(post.images)[0] || '',
  time: formatTime(post.createdAt),
  sortTime: new Date(post.createdAt).getTime()
})

const mapResource = (resource: Resource): CollectionItem => ({
  id: resource.id,
  type: 'resource',
  content: resource.title,
  cover: resolveMediaUrls(resource.images)[0] || '',
  time: formatTime(resource.createdAt),
  sortTime: new Date(resource.createdAt).getTime()
})

const loadCollections = async () => {
  if (!getToken()) {
    collections.value = []
    uni.navigateTo({ url: '/pages/login/login' })
    return
  }

  loading.value = true

  try {
    const res = await getMyCollections()
    collections.value = [
      ...res.posts.map(mapPost),
      ...res.resources.map(mapResource)
    ].sort((a, b) => b.sortTime - a.sortTime)
  } catch (error) {
    console.error('加载我的收藏失败:', error)
    collections.value = []
  } finally {
    loading.value = false
  }
}

const goToDetail = (item: CollectionItem) => {
  uni.navigateTo({
    url:
      item.type === 'post'
        ? `/pages/post-detail/post-detail?id=${item.id}`
        : `/pages/resource-detail/resource-detail?id=${item.id}`
  })
}

onMounted(loadCollections)
onShow(loadCollections)
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.my-collections-page {
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

.collection-list {
  height: calc(100vh - 88rpx);
  padding: 24rpx;
}

.collection-card {
  position: relative;
  margin-bottom: 24rpx;
  padding: 32rpx;
  background: #ffffff;
  border-radius: 16rpx;
}

.collection-cover {
  width: 100%;
  height: 240rpx;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
}

.collection-type {
  display: inline-flex;
  margin-bottom: 12rpx;
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
  background: #eef6ff;
  color: #1890ff;
  font-size: 24rpx;
}

.collection-content {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.collection-time {
  font-size: 24rpx;
  color: #999;
}

.empty-tip {
  padding: 80rpx 24rpx;
  text-align: center;
  font-size: 28rpx;
  color: #999;
}
</style>
