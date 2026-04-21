<template>
  <view class="my-posts-page">
    <view class="header">
      <text class="title">我的发布</text>
    </view>

    <scroll-view class="post-list" scroll-y>
      <view v-if="loading" class="empty-tip">加载中...</view>
      <view v-else-if="posts.length === 0" class="empty-tip">还没有发布动态</view>
      <view v-for="post in posts" :key="post.id" class="post-card" @tap="goToPost(post.id)">
        <view class="post-content">{{ post.content }}</view>
        <view v-if="post.images.length" class="post-images">
          <image
            v-for="(image, index) in post.images"
            :key="index"
            :src="image"
            class="post-image"
            mode="aspectFill"
          />
        </view>
        <view class="post-time">{{ post.time }}</view>
        <view class="post-stats">
          <text>❤️ {{ post.likes }}</text>
          <text>💬 {{ post.comments }}</text>
          <text>⭐ {{ post.collects }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getUserPosts, type Post } from '@/api/posts'
import { getCurrentUser } from '@/api/users'
import { resolveMediaUrls } from '@/utils/media'
import { getToken } from '@/utils/request'

interface MyPostItem {
  id: string
  content: string
  images: string[]
  time: string
  likes: number
  comments: number
  collects: number
}

const posts = ref<MyPostItem[]>([])
const loading = ref(false)

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString('zh-CN')
}

const mapPost = (post: Post): MyPostItem => ({
  id: post.id,
  content: post.content,
  images: resolveMediaUrls(post.images),
  time: formatTime(post.createdAt),
  likes: post.likesCount || 0,
  comments: post.commentsCount || 0,
  collects: post.collectionsCount || 0
})

const loadMyPosts = async () => {
  if (!getToken()) {
    posts.value = []
    uni.navigateTo({ url: '/pages/login/login' })
    return
  }

  loading.value = true

  try {
    const user = await getCurrentUser()
    const res = await getUserPosts(user.id, { page: 1, limit: 50 })
    posts.value = res.data.map(mapPost)
  } catch (error) {
    console.error('加载我的发布失败:', error)
    posts.value = []
  } finally {
    loading.value = false
  }
}

const goToPost = (id: string) => {
  uni.navigateTo({ url: `/pages/post-detail/post-detail?id=${id}` })
}

onMounted(loadMyPosts)
onShow(loadMyPosts)
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.my-posts-page {
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

.post-list {
  height: calc(100vh - 88rpx);
  padding: 24rpx;
}

.post-card {
  margin-bottom: 24rpx;
  padding: 32rpx;
  background: #ffffff;
  border-radius: 16rpx;
}

.post-content {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.post-time {
  font-size: 24rpx;
  color: #999;
}

.post-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.post-image {
  width: 180rpx;
  height: 180rpx;
  border-radius: 12rpx;
}

.post-stats {
  display: flex;
  gap: 24rpx;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #666;
}

.empty-tip {
  padding: 80rpx 24rpx;
  text-align: center;
  font-size: 28rpx;
  color: #999;
}
</style>
