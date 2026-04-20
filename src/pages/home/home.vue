<template>
  <view class="home-page">
    <!-- 顶部栏 -->
    <view class="header">
      <view class="header-left">
        <view class="logo">🌸</view>
        <view class="title">Iris Program</view>
      </view>
      <view class="header-right">
        <view class="icon-btn" @tap="handleSearch">
          <Icon name="search" :size="20" color="#333" />
        </view>
        <view class="icon-btn" @tap="handleNotification">
          <Icon name="bell" :size="20" color="#333" />
          <view v-if="hasUnread" class="badge-dot"></view>
        </view>
      </view>
    </view>

    <!-- 话题分类栏 -->
    <scroll-view class="topic-tabs" scroll-x>
      <view
        v-for="topic in topics"
        :key="topic.id"
        class="topic-tab"
        :class="{ active: currentTopic === topic.id }"
        @tap="handleTopicChange(topic.id)"
      >
        {{ topic.name }}
      </view>
    </scroll-view>

    <!-- 发布按钮 -->
    <view class="fab" @tap="handlePublish">
      <Icon name="plus" :size="24" color="#ffffff" />
    </view>

    <!-- 动态列表 -->
    <scroll-view
      class="post-list"
      scroll-y
      refresher-enabled
      :refresher-triggered="loading && page === 1"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <view v-for="post in posts" :key="post.id" class="card-post">
        <!-- 用户信息 -->
        <view class="card-post-header">
          <image :src="post.avatar" class="card-post-avatar" mode="aspectFill" />
          <view class="card-post-user">
            <view class="card-post-username">{{ post.username }}</view>
            <view class="card-post-time">{{ post.time }}</view>
          </view>
        </view>

        <!-- 动态内容 -->
        <view class="card-post-content">
          {{ post.content }}
        </view>

        <!-- 图片展示 -->
        <view v-if="post.images && post.images.length" class="card-post-images" :class="getImageClass(post.images.length)">
          <image
            v-for="(image, index) in post.images"
            :key="index"
            :src="image"
            class="card-post-image"
            mode="aspectFill"
            @tap="handleImagePreview(post.images, index)"
          />
        </view>

        <!-- 互动栏 -->
        <view class="card-post-actions">
          <view class="card-post-action" :class="{ active: post.isLiked }" @tap="handleLike(post)">
            <Icon :name="post.isLiked ? 'heart' : 'heart'" :size="18" :color="post.isLiked ? '#ff4d4f' : '#666'" />
            <text>{{ post.likes }}</text>
          </view>
          <view class="card-post-action" @tap="handleComment(post)">
            <Icon name="message" :size="18" color="#666" />
            <text>{{ post.comments }}</text>
          </view>
          <view class="card-post-action" @tap="handleCollect(post)">
            <Icon name="star" :size="18" color="#666" />
            <text>{{ post.collects }}</text>
          </view>
        </view>
      </view>

      <!-- 加载提示 -->
      <view v-if="loading" class="loading-tip">加载中...</view>
      <view v-else-if="!hasMore && posts.length > 0" class="loading-tip">没有更多了</view>
      <view v-else-if="posts.length === 0" class="empty-tip">暂无动态</view>
    </scroll-view>

    <!-- 自定义 TabBar -->
    <custom-tab-bar />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CustomTabBar from '@/components/custom-tab-bar/custom-tab-bar.vue'
import Icon from '@/components/icon/icon.vue'
import { getPosts, likePost, unlikePost, collectPost, uncollectPost, type Post } from '@/api/posts'
import { getUnreadCount } from '@/api/messages'

// 未读消息标识
const hasUnread = ref(false)

// 话题分类
const topics = ref([
  { id: 'all', name: '全部' },
  { id: 'study', name: '学习' },
  { id: 'life', name: '生活' },
  { id: 'activity', name: '活动' },
  { id: 'confession', name: '表白墙' }
])

const currentTopic = ref('all')

// 动态列表数据
const posts = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const limit = ref(20)
const hasMore = ref(true)

// 加载动态列表
const loadPosts = async (refresh = false) => {
  if (loading.value) return

  if (refresh) {
    page.value = 1
    posts.value = []
    hasMore.value = true
  }

  if (!hasMore.value) return

  loading.value = true

  try {
    const res = await getPosts({
      page: page.value,
      limit: limit.value,
      category: currentTopic.value === 'all' ? undefined : currentTopic.value
    })

    // 检查返回数据格式
    if (!res || !res.data || !Array.isArray(res.data)) {
      console.error('API 返回数据格式错误:', res)
      return
    }

    // 转换数据格式
    const newPosts = res.data.map((post: Post) => ({
      id: post.id,
      avatar: post.author.avatar,
      username: post.author.nickname,
      time: formatTime(post.createdAt),
      content: post.content,
      category: post.category,
      images: post.images || [],
      likes: post.likesCount,
      comments: post.commentsCount,
      collects: post.collectionsCount,
      isLiked: false, // TODO: 需要后端返回当前用户是否点赞
      isCollected: false // TODO: 需要后端返回当前用户是否收藏
    }))

    if (refresh) {
      posts.value = newPosts
    } else {
      posts.value = [...posts.value, ...newPosts]
    }

    hasMore.value = page.value < res.totalPages
    page.value++
  } catch (error) {
    console.error('加载动态失败:', error)
  } finally {
    loading.value = false
  }
}

// 格式化时间
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

  return date.toLocaleDateString()
}

// 加载未读消息数
const loadUnreadCount = async () => {
  try {
    // 检查是否已登录
    const token = uni.getStorageSync('token')
    if (!token) {
      hasUnread.value = false
      return
    }

    const res = await getUnreadCount()
    hasUnread.value = res.count > 0
  } catch (error) {
    console.error('加载未读消息数失败:', error)
    hasUnread.value = false
  }
}

// 获取图片布局类名
const getImageClass = (count: number) => {
  if (count === 1) return 'single'
  if (count === 2) return 'double'
  return 'multiple'
}

// 话题切换
const handleTopicChange = (topicId: string) => {
  currentTopic.value = topicId
  loadPosts(true)
}

// 搜索
const handleSearch = () => {
  uni.navigateTo({
    url: '/pages/search/search',
    fail: (err) => {
      console.error('页面跳转失败:', err)
    }
  })
}

// 通知
const handleNotification = () => {
  uni.navigateTo({
    url: '/pages/notification/notification',
    fail: (err) => {
      console.error('页面跳转失败:', err)
    }
  })
}

// 点赞
const handleLike = async (post: any) => {
  try {
    if (post.isLiked) {
      await unlikePost(post.id)
      post.isLiked = false
      post.likes--
    } else {
      await likePost(post.id)
      post.isLiked = true
      post.likes++
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
  }
}

// 评论
const handleComment = (post: any) => {
  uni.navigateTo({
    url: `/pages/post-detail/post-detail?id=${post.id}`
  })
}

// 收藏
const handleCollect = async (post: any) => {
  try {
    if (post.isCollected) {
      await uncollectPost(post.id)
      post.isCollected = false
      post.collects--
      uni.showToast({
        title: '取消收藏',
        icon: 'success'
      ,
      duration: 2000
    })
    } else {
      await collectPost(post.id)
      post.isCollected = true
      post.collects++
      uni.showToast({
        title: '收藏成功',
        icon: 'success'
      ,
      duration: 2000
    })
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
  }
}

// 图片预览
const handleImagePreview = (images: string[], index: number) => {
  uni.previewImage({
    urls: images,
    current: index,
    fail: (err) => {
      console.error('图片预览失败:', err)
      uni.showToast({
        title: '图片加载失败',
        icon: 'none',
        duration: 2000
      })
    }
  })
}

// 发布动态
const handlePublish = () => {
  uni.navigateTo({
    url: '/pages/publish/publish',
    fail: (err) => {
      console.error('页面跳转失败:', err)
    }
  })
}

// 下拉刷新
const onRefresh = () => {
  loadPosts(true)
  loadUnreadCount()
}

// 上拉加载更多
const onLoadMore = () => {
  if (!loading.value && hasMore.value) {
    loadPosts()
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadPosts(true)
  loadUnreadCount()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f8f8f8;
  box-sizing: border-box;
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
  border-bottom: 1rpx solid #e5e5e5;
  z-index: 100;
}

/* 小程序特定样式 */
/* #ifdef MP */
.header {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
}
/* #endif */

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.title {
  font-size: 36rpx;
  font-weight: 500;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
}

.icon-btn {
  position: relative;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 32rpx;
}

.icon {
  font-size: 40rpx;
}

.badge-dot {
  position: absolute;
  top: -4rpx;
  right: -4rpx;
  width: 16rpx;
  height: 16rpx;
  background: #ff4d4f;
  border-radius: 50%;
  border: 4rpx solid #ffffff;
}

.topic-tabs {
  height: 104rpx;
  padding: 24rpx 32rpx;
  background: #ffffff;
  white-space: nowrap;
}

/* 小程序特定样式 */
/* #ifdef MP */
.topic-tabs {
  margin-top: 88rpx;
}
/* #endif */

.topic-tab {
  display: inline-block;
  height: 56rpx;
  line-height: 56rpx;
  padding: 0 32rpx;
  font-size: 28rpx;
  color: #666;
  background: #f5f5f5;
  border-radius: 28rpx;
  margin-right: 24rpx;
  transition: all 0.3s;
}

.topic-tab.active {
  color: #ffffff;
  background: #1890ff;
}

.post-list {
  height: calc(100vh - 192rpx);
  padding: 16rpx 0;
}

/* 小程序特定样式 */
/* #ifdef MP */
.post-list {
  height: calc(100vh - 280rpx);
}
/* #endif */

.card-post {
  margin: 16rpx 32rpx;
  padding: 32rpx;
  background: #ffffff;
  border-radius: 16rpx;
  box-sizing: border-box;
}

.card-post-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.card-post-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.card-post-user {
  flex: 1;
  min-width: 0;
}

.card-post-username {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-post-time {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.card-post-content {
  font-size: 30rpx;
  line-height: 1.6;
  color: #333;
  margin-bottom: 24rpx;
  word-break: break-all;
}

.card-post-images {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 24rpx;
}

.card-post-images.single .card-post-image {
  width: 100%;
  height: 400rpx;
  border-radius: 16rpx;
}

.card-post-images.double .card-post-image {
  width: calc(50% - 8rpx);
  height: 300rpx;
  border-radius: 16rpx;
  margin-right: 16rpx;
}

.card-post-images.double .card-post-image:last-child {
  margin-right: 0;
}

.card-post-images.multiple .card-post-image {
  width: calc(33.33% - 12rpx);
  height: 200rpx;
  border-radius: 16rpx;
  margin-right: 16rpx;
  margin-bottom: 16rpx;
}

.card-post-images.multiple .card-post-image:nth-child(3n) {
  margin-right: 0;
}

.card-post-actions {
  display: flex;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.card-post-action {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #666;
  margin-right: 48rpx;
  transition: all 0.3s;
}

.card-post-action text {
  margin-left: 8rpx;
}

.card-post-action.active {
  color: #ff4d4f;
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

/* H5 特定样式 */
/* #ifdef H5 */
.fab:hover {
  transform: scale(1.1);
}
/* #endif */

.fab .icon {
  font-size: 48rpx;
  color: #ffffff;
}

.loading-tip,
.empty-tip {
  text-align: center;
  padding: 40rpx;
  font-size: 28rpx;
  color: #999;
}

.empty-tip {
  padding: 120rpx 40rpx;
}
</style>
