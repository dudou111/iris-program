<template>
  <view class="post-detail-page">
    <view class="header">
      <view class="icon-btn" @tap="handleBack">
        <text>‹</text>
      </view>
      <view class="title">动态详情</view>
      <view class="icon-btn" @tap="handleMore">
        <text>⋯</text>
      </view>
    </view>

    <view v-if="loading" class="loading-container">
      <text>加载中...</text>
    </view>

    <view v-else-if="post" class="post-content">
      <view class="post-header">
        <image :src="post.avatar" class="post-avatar" mode="aspectFill" @tap="handleUserClick" />
        <view class="post-user">
          <view class="post-username">{{ post.username }}</view>
          <view class="post-time">{{ post.time }}</view>
        </view>
        <view class="btn-follow" :class="{ following: post.isFollowing }" @tap="handleFollow">
          {{ post.isFollowing ? '已关注' : '关注' }}
        </view>
      </view>

      <view class="post-text">{{ post.content }}</view>

      <view v-if="post.images && post.images.length" class="post-images" :class="getImageClass(post.images.length)">
        <image
          v-for="(image, index) in post.images"
          :key="index"
          :src="image"
          class="post-image"
          mode="aspectFill"
          @tap="handleImagePreview(post.images, index)"
        />
      </view>

      <view class="post-tags">
        <view v-if="post.location" class="tag">
          <text>📍 {{ post.location }}</text>
        </view>
        <view v-if="post.topic" class="tag">
          <text># {{ post.topic }}</text>
        </view>
      </view>

      <view class="post-stats">
        <text>{{ post.likes }} 点赞</text>
        <text>{{ post.comments }} 评论</text>
        <text>{{ post.collects }} 收藏</text>
      </view>

      <view class="post-actions">
        <view class="action-btn" :class="{ active: post.isLiked }" @tap="handleLike">
          <text>{{ post.isLiked ? '❤️' : '🤍' }}</text>
          <text>点赞</text>
        </view>
        <view class="action-btn">
          <text>💬</text>
          <text>评论</text>
        </view>
        <view class="action-btn" :class="{ active: post.isCollected }" @tap="handleCollect">
          <text>{{ post.isCollected ? '⭐' : '☆' }}</text>
          <text>收藏</text>
        </view>
        <view class="action-btn" @tap="handleShare">
          <text>↗️</text>
          <text>分享</text>
        </view>
      </view>
    </view>

    <view class="comments-section">
      <view class="section-title">评论 {{ comments.length }}</view>
      <view v-for="comment in comments" :key="comment.id" class="comment-item">
        <image :src="comment.avatar" class="comment-avatar" mode="aspectFill" />
        <view class="comment-content">
          <view class="comment-header">
            <text class="comment-username">{{ comment.username }}</text>
            <text class="comment-time">{{ comment.time }}</text>
          </view>
          <view class="comment-text">{{ comment.content }}</view>
          <view class="comment-actions">
            <view class="comment-action" :class="{ active: comment.isLiked }" @tap="handleCommentLike(comment)">
              <text>{{ comment.isLiked ? '❤️' : '🤍' }} {{ comment.likes }}</text>
            </view>
            <view class="comment-action" @tap="handleReply(comment)">
              <text>💬 回复</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="error-container">
      <text>加载失败</text>
    </view>

    <view v-if="post" class="comment-input-bar">
      <input
        v-model="commentText"
        type="text"
        placeholder="说点什么..."
        class="comment-input"
        @focus="handleInputFocus"
      /
            :adjust-position="true"
            :hold-keyboard="false"
            :cursor-spacing="50"
            placeholder-style="color: #999;"
          >
      <view class="btn-send" :class="{ disabled: !commentText.trim() }" @tap="handleSendComment">
        发送
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPostDetail, likePost, unlikePost, collectPost, uncollectPost } from '@/api/posts'

const post = ref<any>(null)
const comments = ref<any[]>([])
const commentText = ref('')
const loading = ref(true)

// 获取动态ID
const getPostId = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  return (currentPage as any).$page.options.id || ''
}

// 加载动态详情
const loadPostDetail = async () => {
  loading.value = true
  try {
    const id = getPostId()
    if (!id) {
      uni.showToast({ title: '动态ID不存在', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 1500)
      return
    }

    const res = await getPostDetail(id)
    post.value = {
      id: res.id,
      avatar: res.author?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
      username: res.author?.nickname || '未知用户',
      time: formatTime(res.createdAt),
      content: res.content,
      images: res.images || [],
      location: res.location,
      topic: res.category,
      likes: res.likesCount,
      comments: res.commentsCount,
      collects: res.collectionsCount,
      isLiked: false,
      isCollected: false,
      isFollowing: false
    }
  } catch (error) {
    console.error('加载动态详情失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
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

  return date.toLocaleDateString('zh-CN')
}

const getImageClass = (count: number) => {
  if (count === 1) return 'single'
  if (count === 2) return 'double'
  return 'multiple'
}

const handleBack = () => {
  uni.navigateBack()
}

const handleMore = () => {
  uni.showActionSheet({
    itemList: ['举报', '删除'],
    success: (res) => {
      console.log('选择了：', res.tapIndex)
    }
  })
}

const handleUserClick = () => {
  uni.showToast({ title: '跳转用户主页', icon: 'none', duration: 2000 })
}

const handleFollow = () => {
  if (!post.value) return
  post.value.isFollowing = !post.value.isFollowing
  uni.showToast({
    title: post.value.isFollowing ? '关注成功' : '取消关注',
    icon: 'success',
    duration: 2000
  })
}

const handleLike = async () => {
  if (!post.value) return

  try {
    if (post.value.isLiked) {
      await unlikePost(post.value.id)
      post.value.isLiked = false
      post.value.likes--
    } else {
      await likePost(post.value.id)
      post.value.isLiked = true
      post.value.likes++
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
  }
}

const handleCollect = async () => {
  if (!post.value) return

  try {
    if (post.value.isCollected) {
      await uncollectPost(post.value.id)
      post.value.isCollected = false
      post.value.collects--
      uni.showToast({ title: '取消收藏', icon: 'success', duration: 2000 })
    } else {
      await collectPost(post.value.id)
      post.value.isCollected = true
      post.value.collects++
      uni.showToast({ title: '收藏成功', icon: 'success', duration: 2000 })
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
  }
}

const handleShare = () => {
  uni.showToast({ title: '分享功能开发中', icon: 'none', duration: 2000 })
}

const handleImagePreview = (images: string[], index: number) => {
  uni.previewImage({
    urls: images,
    current: index
  })
}

const handleCommentLike = (comment: any) => {
  comment.isLiked = !comment.isLiked
  comment.likes += comment.isLiked ? 1 : -1
}

const handleReply = (comment: any) => {
  commentText.value = `@${comment.username} `
}

const handleInputFocus = () => {
  console.log('输入框获得焦点')
}

const handleSendComment = () => {
  if (!commentText.value.trim()) return

  const newComment = {
    id: comments.value.length + 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Me',
    username: '我',
    time: '刚刚',
    content: commentText.value,
    likes: 0,
    isLiked: false
  }

  comments.value.unshift(newComment)
  if (post.value) {
    post.value.comments++
  }
  commentText.value = ''

  uni.showToast({ title: '评论成功', icon: 'success', duration: 2000 })
}

onMounted(() => {
  loadPostDetail()
})
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.post-detail-page {
  min-height: 100vh;
  padding-bottom: 120rpx;
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
  justify-content: space-between;
  border-bottom: 2rpx solid #e5e5e5;
  z-index: 100;
}

.title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: 500;
  color: #333;
}

.icon-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: #666;
}

.post-content {
  background: #ffffff;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.post-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 24rpx;
}

.post-user {
  flex: 1;
}

.post-username {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
}

.post-time {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.btn-follow {
  padding: 8rpx 32rpx;
  font-size: 26rpx;
  color: #ffffff;
  background: #1890ff;
  border-radius: 24rpx;
}

.btn-follow.following {
  color: #666;
  background: #f5f5f5;
}

.post-text {
  font-size: 30rpx;
  line-height: 1.6;
  color: #333;
  margin-bottom: 24rpx;
}

.post-images {
  display: grid;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.post-images.single {
  grid-template-columns: 1fr;
}

.post-images.double {
  grid-template-columns: repeat(2, 1fr);
}

.post-images.multiple {
  grid-template-columns: repeat(3, 1fr);
}

.post-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16rpx;
}

.post-tags {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.tag {
  padding: 8rpx 16rpx;
  font-size: 24rpx;
  color: #666;
  background: #f5f5f5;
  border-radius: 8rpx;
}

.post-stats {
  display: flex;
  gap: 32rpx;
  padding: 24rpx 0;
  font-size: 26rpx;
  color: #666;
  border-top: 2rpx solid #f0f0f0;
  border-bottom: 2rpx solid #f0f0f0;
}

.post-actions {
  display: flex;
  justify-content: space-around;
  padding-top: 24rpx;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: #666;
}

.action-btn.active {
  color: #1890ff;
}

.comments-section {
  background: #ffffff;
  padding: 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 24rpx;
}

.comment-item {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.comment-username {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.comment-time {
  font-size: 24rpx;
  color: #999;
}

.comment-text {
  font-size: 28rpx;
  line-height: 1.5;
  color: #666;
  margin-bottom: 16rpx;
}

.comment-actions {
  display: flex;
  gap: 32rpx;
}

.comment-action {
  font-size: 24rpx;
  color: #999;
}

.comment-action.active {
  color: #1890ff;
}

.comment-input-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  padding: 16rpx 32rpx;
  background: #ffffff;
  border-top: 2rpx solid #e5e5e5;
  display: flex;
  align-items: center;
  gap: 24rpx;
  z-index: 100;
}

.comment-input {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  background: #f5f5f5;
  border: none;
  border-radius: 36rpx;
}

.btn-send {
  padding: 0 32rpx;
  height: 72rpx;
  line-height: 72rpx;
  font-size: 28rpx;
  color: #ffffff;
  background: #1890ff;
  border-radius: 36rpx;
}

.btn-send.disabled {
  opacity: 0.5;
}

.loading-container,
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400rpx;
  font-size: 28rpx;
  color: #999;
}
</style>
