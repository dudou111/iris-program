<template>
  <view class="user-profile-page">
    <view class="header">
      <view class="icon-btn" @tap="handleBack">
        <text>‹</text>
      </view>
      <view class="title">个人主页</view>
      <view class="icon-btn" @tap="handleMore">
        <text>⋯</text>
      </view>
    </view>

    <view class="user-card">
      <view class="user-header">
        <image :src="user.avatar" class="user-avatar" mode="aspectFill" />
        <view class="user-info">
          <view class="user-name">{{ user.username }}</view>
          <view class="user-id">ID: {{ user.id }}</view>
        </view>
      </view>
      <view class="user-bio">{{ user.bio }}</view>
      <view class="user-stats">
        <view class="stat-item">
          <view class="stat-value">{{ user.posts }}</view>
          <view class="stat-label">动态</view>
        </view>
        <view class="stat-item">
          <view class="stat-value">{{ user.followers }}</view>
          <view class="stat-label">粉丝</view>
        </view>
        <view class="stat-item">
          <view class="stat-value">{{ user.following }}</view>
          <view class="stat-label">关注</view>
        </view>
      </view>
      <view class="user-actions">
        <view class="btn-follow" :class="{ following: user.isFollowing }" @tap="handleFollow">
          {{ user.isFollowing ? '已关注' : '关注' }}
        </view>
        <view class="btn-message" @tap="handleMessage">
          💬 发消息
        </view>
      </view>
    </view>

    <view class="content-tabs">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="content-tab"
        :class="{ active: currentTab === tab.key }"
        @tap="currentTab = tab.key"
      >
        {{ tab.label }}
      </view>
    </view>

    <view v-if="currentTab === 'posts'" class="post-list">
      <view v-for="post in userPosts" :key="post.id" class="card-post" @tap="handlePostClick(post)">
        <view class="card-post-content">{{ post.content }}</view>
        <view v-if="post.images && post.images.length" class="card-post-images" :class="getImageClass(post.images.length)">
          <image
            v-for="(image, index) in post.images"
            :key="index"
            :src="image"
            class="card-post-image"
            mode="aspectFill"
          />
        </view>
        <view class="card-post-footer">
          <text class="post-time">{{ post.time }}</text>
          <view class="post-stats">
            <text>❤️ {{ post.likes }}</text>
            <text>💬 {{ post.comments }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="currentTab === 'collections'" class="collection-list">
      <view class="empty-state">
        <text class="empty-icon">⭐</text>
        <view class="empty-text">暂无收藏</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentTab = ref('posts')

const tabs = [
  { key: 'posts', label: '动态' },
  { key: 'collections', label: '收藏' }
]

const user = ref({
  id: '123456',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
  username: '张同学',
  bio: '计算机学院 | 热爱编程 | 喜欢分享',
  posts: 128,
  followers: 1234,
  following: 567,
  isFollowing: false
})

const userPosts = ref([
  {
    id: 1,
    content: '今天天气真好，图书馆学习一整天！',
    images: ['https://picsum.photos/300/300?random=1'],
    time: '2小时前',
    likes: 45,
    comments: 12
  },
  {
    id: 2,
    content: '分享一下最近学习的笔记，希望对大家有帮助～',
    images: [
      'https://picsum.photos/300/300?random=2',
      'https://picsum.photos/300/300?random=3'
    ],
    time: '1天前',
    likes: 89,
    comments: 23
  }
])

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
    itemList: ['举报', '拉黑'],
    success: (res) => {
      console.log('选择了：', res.tapIndex)
    }
  })
}

const handleFollow = () => {
  user.value.isFollowing = !user.value.isFollowing
  user.value.followers += user.value.isFollowing ? 1 : -1
  uni.showToast({
    title: user.value.isFollowing ? '关注成功' : '取消关注',
    icon: 'success'
  })
}

const handleMessage = () => {
  uni.navigateTo({ url: '/pages/chat/chat' })
}

const handlePostClick = (post: any) => {
  uni.navigateTo({ url: `/pages/post-detail/post-detail?id=${post.id}` })
}
</script>

<style scoped>
.user-profile-page {
  min-height: 100vh;
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

.user-card {
  background: #ffffff;
  padding: 20px 16px;
  margin-bottom: 8px;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 20px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.user-id {
  font-size: 13px;
  color: #999;
}

.user-bio {
  font-size: 14px;
  line-height: 1.5;
  color: #666;
  margin-bottom: 16px;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.user-actions {
  display: flex;
  gap: 12px;
}

.btn-follow,
.btn-message {
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 15px;
  border-radius: 8px;
}

.btn-follow {
  color: #ffffff;
  background: #1890ff;
}

.btn-follow.following {
  color: #666;
  background: #f5f5f5;
}

.btn-message {
  color: #333;
  background: #f5f5f5;
}

.content-tabs {
  display: flex;
  background: #ffffff;
  border-bottom: 1px solid #e5e5e5;
}

.content-tab {
  position: relative;
  flex: 1;
  padding: 12px 0;
  text-align: center;
  font-size: 15px;
  color: #666;
}

.content-tab.active {
  color: #1890ff;
  font-weight: 500;
}

.content-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 2px;
  background: #1890ff;
}

.post-list {
  padding: 8px 0;
}

.card-post {
  background: #ffffff;
  padding: 16px;
  margin-bottom: 8px;
}

.card-post-content {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 12px;
}

.card-post-images {
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
}

.card-post-images.single {
  grid-template-columns: 1fr;
}

.card-post-images.double {
  grid-template-columns: repeat(2, 1fr);
}

.card-post-images.multiple {
  grid-template-columns: repeat(3, 1fr);
}

.card-post-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
}

.card-post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.post-time {
  font-size: 12px;
  color: #999;
}

.post-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.collection-list {
  padding: 40px 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
}
</style>
