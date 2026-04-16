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

    <view class="post-content">
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

    <view class="comment-input-bar">
      <input
        v-model="commentText"
        type="text"
        placeholder="说点什么..."
        class="comment-input"
        @focus="handleInputFocus"
      />
      <view class="btn-send" :class="{ disabled: !commentText.trim() }" @tap="handleSendComment">
        发送
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const post = ref({
  id: 1,
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang',
  username: '张同学',
  time: '2小时前',
  content: '今天天气真好，图书馆学习一整天！分享一下我的学习笔记～',
  images: [
    'https://picsum.photos/400/400?random=1',
    'https://picsum.photos/400/400?random=2',
    'https://picsum.photos/400/400?random=3'
  ],
  location: '图书馆',
  topic: '学习',
  likes: 45,
  comments: 12,
  collects: 8,
  isLiked: false,
  isCollected: false,
  isFollowing: false
})

const comments = ref([
  {
    id: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Li',
    username: '李同学',
    time: '1小时前',
    content: '笔记做得真好，可以分享一下吗？',
    likes: 5,
    isLiked: false
  },
  {
    id: 2,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wang',
    username: '王同学',
    time: '30分钟前',
    content: '一起学习，加油！',
    likes: 3,
    isLiked: false
  }
])

const commentText = ref('')

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
  uni.showToast({ title: '跳转用户主页', icon: 'none' })
}

const handleFollow = () => {
  post.value.isFollowing = !post.value.isFollowing
  uni.showToast({
    title: post.value.isFollowing ? '关注成功' : '取消关注',
    icon: 'success'
  })
}

const handleLike = () => {
  post.value.isLiked = !post.value.isLiked
  post.value.likes += post.value.isLiked ? 1 : -1
}

const handleCollect = () => {
  post.value.isCollected = !post.value.isCollected
  post.value.collects += post.value.isCollected ? 1 : -1
  uni.showToast({
    title: post.value.isCollected ? '收藏成功' : '取消收藏',
    icon: 'success'
  })
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
  post.value.comments++
  commentText.value = ''

  uni.showToast({ title: '评论成功', icon: 'success' })
}
</script>

<style scoped>
.post-detail-page {
  min-height: 100vh;
  padding-bottom: 60px;
  background: #f8f8f8;
}

.header {
  position: sticky;
  top: 0;
  height: 44px;
  padding: 0 16px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e5e5;
  z-index: 100;
}

.title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #666;
}

.post-content {
  background: #ffffff;
  padding: 16px;
  margin-bottom: 8px;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.post-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.post-user {
  flex: 1;
}

.post-username {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.post-time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.btn-follow {
  padding: 4px 16px;
  font-size: 13px;
  color: #ffffff;
  background: #1890ff;
  border-radius: 12px;
}

.btn-follow.following {
  color: #666;
  background: #f5f5f5;
}

.post-text {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 12px;
}

.post-images {
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
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
  border-radius: 8px;
}

.post-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tag {
  padding: 4px 8px;
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  border-radius: 4px;
}

.post-stats {
  display: flex;
  gap: 16px;
  padding: 12px 0;
  font-size: 13px;
  color: #666;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.post-actions {
  display: flex;
  justify-content: space-around;
  padding-top: 12px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.action-btn.active {
  color: #1890ff;
}

.comments-section {
  background: #ffffff;
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-username {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-text {
  font-size: 14px;
  line-height: 1.5;
  color: #666;
  margin-bottom: 8px;
}

.comment-actions {
  display: flex;
  gap: 16px;
}

.comment-action {
  font-size: 12px;
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
  height: 60px;
  padding: 8px 16px;
  background: #ffffff;
  border-top: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 100;
}

.comment-input {
  flex: 1;
  height: 36px;
  padding: 0 12px;
  font-size: 14px;
  background: #f5f5f5;
  border: none;
  border-radius: 18px;
}

.btn-send {
  padding: 0 16px;
  height: 36px;
  line-height: 36px;
  font-size: 14px;
  color: #ffffff;
  background: #1890ff;
  border-radius: 18px;
}

.btn-send.disabled {
  opacity: 0.5;
}
</style>
