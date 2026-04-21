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

    <template v-else-if="post">
      <view class="post-content">
        <view class="post-header">
          <image :src="post.avatar" class="post-avatar" mode="aspectFill" @tap="handleUserClick" />
          <view class="post-user" @tap="handleUserClick">
            <view class="post-username">{{ post.username }}</view>
            <view class="post-time">{{ post.time }}</view>
          </view>
          <view
            v-if="canFollowAuthor"
            class="btn-follow"
            :class="{ following: post.isFollowing }"
            @tap="handleFollow"
          >
            {{ post.isFollowing ? '已关注' : '关注' }}
          </view>
        </view>

        <view class="post-text">{{ post.content }}</view>

        <view
          v-if="post.images.length"
          class="post-images"
          :class="getImageClass(post.images.length)"
        >
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
          <view class="action-btn" @tap="focusCommentInput">
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
        <view class="section-title">评论 {{ post.comments }}</view>
        <view v-if="comments.length === 0" class="empty-comments">还没有评论，来抢沙发吧</view>
        <view v-for="comment in comments" :key="comment.id" class="comment-item">
          <image :src="comment.avatar" class="comment-avatar" mode="aspectFill" />
          <view class="comment-content">
            <view class="comment-header">
              <text class="comment-username">{{ comment.username }}</text>
              <text class="comment-time">{{ comment.time }}</text>
            </view>
            <view class="comment-text">
              <text v-if="comment.replyToUsername" class="comment-reply-prefix">
                回复 @{{ comment.replyToUsername }}：
              </text>
              <text>{{ comment.content }}</text>
            </view>
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

      <view class="comment-input-bar">
        <view v-if="replyTarget" class="reply-tip" @tap="clearReplyTarget">
          正在回复 {{ replyTarget.username }}，点此取消
        </view>
        <input
          v-model="commentText"
          class="comment-input"
          type="text"
          :placeholder="commentPlaceholder"
          :adjust-position="true"
          :hold-keyboard="false"
          :cursor-spacing="50"
          placeholder-style="color: #999;"
        />
        <view class="btn-send" :class="{ disabled: !commentText.trim() }" @tap="handleSendComment">
          发送
        </view>
      </view>
    </template>

    <view v-else class="error-container">
      <text>加载失败</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  collectPost,
  getPostDetail,
  likePost,
  type Post,
  uncollectPost,
  unlikePost
} from '@/api/posts'
import {
  createComment,
  getPostComments,
  likeComment,
  type Comment,
  unlikeComment
} from '@/api/comments'
import { followUser, unfollowUser } from '@/api/users'
import { createDefaultAvatar, resolveMediaUrl, resolveMediaUrls } from '@/utils/media'
import { getToken } from '@/utils/request'

interface DetailPost {
  id: string
  authorId: string
  avatar: string
  username: string
  time: string
  content: string
  images: string[]
  location?: string
  topic: string
  likes: number
  comments: number
  collects: number
  isLiked: boolean
  isCollected: boolean
  isFollowing: boolean
}

interface DetailComment {
  id: string
  authorId: string
  avatar: string
  username: string
  time: string
  content: string
  likes: number
  isLiked: boolean
  replyToUsername?: string
}

interface ReplyTarget {
  id: string
  authorId: string
  username: string
}

interface PostUpdatePayload {
  id: string
  likes?: number
  comments?: number
  collects?: number
  isLiked?: boolean
  isCollected?: boolean
  isCommented?: boolean
}

const post = ref<DetailPost | null>(null)
const comments = ref<DetailComment[]>([])
const commentText = ref('')
const replyTarget = ref<ReplyTarget | null>(null)
const loading = ref(true)

const getCurrentUserId = () => (uni.getStorageSync('userInfo')?.id || '') as string

const commentPlaceholder = computed(() =>
  replyTarget.value ? `回复 ${replyTarget.value.username}...` : '说点什么...'
)

const canFollowAuthor = computed(
  () => Boolean(post.value) && post.value!.authorId !== getCurrentUserId()
)

const requireLogin = () => {
  if (getToken()) {
    return true
  }

  uni.showToast({
    title: '请先登录',
    icon: 'none'
  })
  setTimeout(() => {
    uni.navigateTo({
      url: '/pages/login/login'
    })
  }, 500)
  return false
}

const getPostId = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as { $page?: { options?: Record<string, string> } }
  return currentPage?.$page?.options?.id || ''
}

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

const mapPost = (res: Post): DetailPost => ({
  id: res.id,
  authorId: res.author.id,
  avatar: resolveMediaUrl(res.author.avatar) || createDefaultAvatar(res.author.nickname || res.id),
  username: res.author.nickname || '未知用户',
  time: formatTime(res.createdAt),
  content: res.content,
  images: resolveMediaUrls(res.images),
  location: res.location,
  topic: res.category,
  likes: res.likesCount,
  comments: res.commentsCount,
  collects: res.collectionsCount,
  isLiked: Boolean(res.isLiked),
  isCollected: Boolean(res.isCollected),
  isFollowing: Boolean(res.author.isFollowing)
})

const mapComment = (item: Comment): DetailComment => ({
  id: item.id,
  authorId: item.author.id,
  avatar: resolveMediaUrl(item.author.avatar) || createDefaultAvatar(item.author.nickname || item.id),
  username: item.author.nickname || '未知用户',
  time: formatTime(item.createdAt),
  content: item.content,
  likes: item.likesCount,
  isLiked: Boolean(item.isLiked),
  replyToUsername: item.replyToUser?.nickname
})

const getImageClass = (count: number) => {
  if (count === 1) return 'single'
  if (count === 2) return 'double'
  return 'multiple'
}

const emitPostUpdated = (extra: Partial<PostUpdatePayload> = {}) => {
  if (!post.value) {
    return
  }

  uni.$emit('post:updated', {
    id: post.value.id,
    likes: post.value.likes,
    comments: post.value.comments,
    collects: post.value.collects,
    isLiked: post.value.isLiked,
    isCollected: post.value.isCollected,
    ...extra
  } satisfies PostUpdatePayload)
}

const loadPostDetail = async () => {
  const id = getPostId()
  if (!id) {
    uni.showToast({ title: '动态ID不存在', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
    return
  }

  const res = await getPostDetail(id)
  post.value = mapPost(res)
}

const loadComments = async () => {
  const id = getPostId()
  if (!id) {
    comments.value = []
    return
  }

  const res = await getPostComments(id, { page: 1, limit: 50 })
  comments.value = res.data.map(mapComment)
}

const initializePage = async () => {
  loading.value = true
  try {
    await Promise.all([loadPostDetail(), loadComments()])
  } catch (error) {
    console.error('加载动态详情失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  uni.navigateBack()
}

const handleMore = () => {
  uni.showActionSheet({
    itemList: ['举报', '复制内容'],
    success: (res) => {
      if (res.tapIndex === 1 && post.value) {
        uni.setClipboardData({ data: post.value.content })
      }
    }
  })
}

const handleUserClick = () => {
  if (!post.value) return

  uni.navigateTo({
    url: `/pages/user-profile/user-profile?id=${post.value.authorId}`
  })
}

const handleFollow = async () => {
  if (!post.value || !canFollowAuthor.value || !requireLogin()) return

  try {
    if (post.value.isFollowing) {
      const res = await unfollowUser(post.value.authorId)
      post.value.isFollowing = Boolean(res.following)
      uni.showToast({ title: '取消关注', icon: 'success' })
    } else {
      const res = await followUser(post.value.authorId)
      post.value.isFollowing = Boolean(res.following)
      uni.showToast({ title: '关注成功', icon: 'success' })
    }
  } catch (error) {
    console.error('关注操作失败:', error)
  }
}

const handleLike = async () => {
  if (!post.value || !requireLogin()) return

  try {
    if (post.value.isLiked) {
      const res = await unlikePost(post.value.id)
      post.value.isLiked = Boolean(res.liked)
      post.value.likes = res.likesCount
    } else {
      const res = await likePost(post.value.id)
      post.value.isLiked = Boolean(res.liked)
      post.value.likes = res.likesCount
    }
    emitPostUpdated()
  } catch (error) {
    console.error('点赞操作失败:', error)
  }
}

const handleCollect = async () => {
  if (!post.value || !requireLogin()) return

  try {
    if (post.value.isCollected) {
      const res = await uncollectPost(post.value.id)
      post.value.isCollected = Boolean(res.collected)
      post.value.collects = res.collectionsCount
      uni.showToast({ title: '取消收藏', icon: 'success' })
    } else {
      const res = await collectPost(post.value.id)
      post.value.isCollected = Boolean(res.collected)
      post.value.collects = res.collectionsCount
      uni.showToast({ title: '收藏成功', icon: 'success' })
    }
    emitPostUpdated()
  } catch (error) {
    console.error('收藏操作失败:', error)
  }
}

const handleShare = () => {
  uni.showToast({ title: '分享功能开发中', icon: 'none' })
}

const handleImagePreview = (images: string[], index: number) => {
  uni.previewImage({
    urls: images,
    current: index
  })
}

const handleCommentLike = async (comment: DetailComment) => {
  if (!requireLogin()) return

  try {
    if (comment.isLiked) {
      const res = await unlikeComment(comment.id)
      comment.isLiked = Boolean(res.liked)
      comment.likes = res.likesCount
    } else {
      const res = await likeComment(comment.id)
      comment.isLiked = Boolean(res.liked)
      comment.likes = res.likesCount
    }
  } catch (error) {
    console.error('评论点赞失败:', error)
  }
}

const handleReply = (comment: DetailComment) => {
  if (!requireLogin()) return

  replyTarget.value = {
    id: comment.id,
    authorId: comment.authorId,
    username: comment.username
  }
}

const clearReplyTarget = () => {
  replyTarget.value = null
}

const focusCommentInput = () => {
  if (!requireLogin()) return
  clearReplyTarget()
}

const handleSendComment = async () => {
  const content = commentText.value.trim()

  if (!content || !post.value || !requireLogin()) return

  try {
    await createComment({
      content,
      postId: post.value.id,
      parentId: replyTarget.value?.id,
      replyToUserId: replyTarget.value?.authorId
    })

    commentText.value = ''
    clearReplyTarget()
    await Promise.all([loadPostDetail(), loadComments()])
    emitPostUpdated({
      isCommented: true
    })
    uni.showToast({ title: '评论成功', icon: 'success' })
  } catch (error) {
    console.error('发送评论失败:', error)
  }
}

const handleExternalPostUpdated = (payload: PostUpdatePayload) => {
  if (!post.value || payload.id !== post.value.id) {
    return
  }

  if (payload.likes !== undefined) {
    post.value.likes = payload.likes
  }
  if (payload.comments !== undefined) {
    post.value.comments = payload.comments
  }
  if (payload.collects !== undefined) {
    post.value.collects = payload.collects
  }
  if (payload.isLiked !== undefined) {
    post.value.isLiked = payload.isLiked
  }
  if (payload.isCollected !== undefined) {
    post.value.isCollected = payload.isCollected
  }
}

onMounted(() => {
  initializePage()
  uni.$on('post:updated', handleExternalPostUpdated)
})

onUnmounted(() => {
  uni.$off('post:updated', handleExternalPostUpdated)
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

.comment-reply-prefix {
  color: #1890ff;
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
  min-height: 120rpx;
  padding: 16rpx 32rpx;
  background: #ffffff;
  border-top: 2rpx solid #e5e5e5;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24rpx;
  z-index: 100;
}

.reply-tip {
  width: 100%;
  font-size: 24rpx;
  color: #1890ff;
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

.empty-comments {
  padding: 40rpx 0;
  font-size: 26rpx;
  color: #999;
  text-align: center;
}
</style>
