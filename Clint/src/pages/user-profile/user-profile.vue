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

    <view v-if="loading" class="empty-state">
      <view class="empty-text">加载中...</view>
    </view>

    <template v-else>
      <view class="user-card">
        <view class="user-header">
          <image :src="user.avatar" class="user-avatar" mode="aspectFill" />
          <view class="user-info">
            <view class="user-name">{{ user.username }}</view>
          </view>
        </view>
        <view class="user-bio">{{ user.bio || '这个人很神秘，什么都没留下。' }}</view>
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
          <view
            v-if="!isSelfProfile"
            class="btn-follow"
            :class="{ following: user.isFollowing }"
            @tap="handleFollow"
          >
            {{ user.isFollowing ? '已关注' : '关注' }}
          </view>
          <view class="btn-message" @tap="handleMessage">
            💬 {{ isSelfProfile ? '我的消息' : '发消息' }}
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
        <view v-if="userPosts.length === 0" class="empty-state">
          <view class="empty-text">还没有发布动态</view>
        </view>
        <view v-for="post in userPosts" :key="post.id" class="card-post" @tap="handlePostClick(post.id)">
          <view class="card-post-content">{{ post.content }}</view>
          <view
            v-if="post.images.length"
            class="card-post-images"
            :class="getImageClass(post.images.length)"
          >
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
          <view class="empty-text">收藏列表将在下一阶段接入</view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getUserPosts, type Post } from '@/api/posts'
import { followUser, getCurrentUser, getUserDetail, type User, unfollowUser } from '@/api/users'
import { createDefaultAvatar, resolveMediaUrl, resolveMediaUrls } from '@/utils/media'

interface ProfileUser {
  id: string
  avatar: string
  username: string
  bio?: string
  posts: number
  followers: number
  following: number
  isFollowing: boolean
}

interface ProfilePost {
  id: string
  content: string
  images: string[]
  time: string
  likes: number
  comments: number
}

const currentTab = ref('posts')
const loading = ref(true)
const currentUserId = ref((uni.getStorageSync('userInfo')?.id || '') as string)
const routeUserId = ref('')

const tabs = [
  { key: 'posts', label: '动态' },
  { key: 'collections', label: '收藏' }
]

const user = ref<ProfileUser>({
  id: '',
  avatar: createDefaultAvatar('default'),
  username: '未知用户',
  bio: '',
  posts: 0,
  followers: 0,
  following: 0,
  isFollowing: false
})

const userPosts = ref<ProfilePost[]>([])

const isSelfProfile = computed(() => Boolean(user.value.id) && user.value.id === currentUserId.value)

const getProfileUserId = () => routeUserId.value || currentUserId.value

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

const mapUser = (detail: User): ProfileUser => ({
  id: detail.id,
  avatar: resolveMediaUrl(detail.avatar) || createDefaultAvatar(detail.nickname || detail.id),
  username: detail.nickname || '未知用户',
  bio: detail.bio,
  posts: detail.postsCount,
  followers: detail.followersCount,
  following: detail.followingCount,
  isFollowing: Boolean(detail.isFollowing)
})

const mapPost = (post: Post): ProfilePost => ({
  id: post.id,
  content: post.content,
  images: resolveMediaUrls(post.images),
  time: formatTime(post.createdAt),
  likes: post.likesCount,
  comments: post.commentsCount
})

const loadCurrentUser = async () => {
  if (currentUserId.value) return

  try {
    const me = await getCurrentUser()
    currentUserId.value = me.id
  } catch (error) {
    console.error('加载当前用户失败:', error)
  }
}

const loadProfile = async () => {
  const userId = getProfileUserId()
  if (!userId) {
    uni.showToast({ title: '用户不存在', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
    return
  }

  const [detail, posts] = await Promise.all([
    getUserDetail(userId),
    getUserPosts(userId, { page: 1, limit: 20 })
  ])

  user.value = mapUser(detail)
  userPosts.value = posts.data.map(mapPost)
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
    itemList: isSelfProfile.value ? ['分享主页'] : ['举报', '分享主页']
  })
}

const handleFollow = async () => {
  if (isSelfProfile.value || !user.value.id) return

  try {
    if (user.value.isFollowing) {
      const res = await unfollowUser(user.value.id)
      user.value.isFollowing = Boolean(res.following)
      user.value.followers = res.followersCount
      uni.showToast({ title: '取消关注', icon: 'success' })
    } else {
      const res = await followUser(user.value.id)
      user.value.isFollowing = Boolean(res.following)
      user.value.followers = res.followersCount
      uni.showToast({ title: '关注成功', icon: 'success' })
    }
  } catch (error) {
    console.error('关注操作失败:', error)
  }
}

const handleMessage = () => {
  if (!user.value.id) return

  if (isSelfProfile.value) {
    uni.navigateTo({
      url: '/pages/message/message',
      fail: (err) => {
        console.error('页面跳转失败:', err)
      }
    })
    return
  }

  const query = `id=${user.value.id}&nickname=${encodeURIComponent(user.value.username)}&avatar=${encodeURIComponent(user.value.avatar)}`

  uni.navigateTo({
    url: `/pages/chat/chat?${query}`,
    fail: (err) => {
      console.error('页面跳转失败:', err)
    }
  })
}

const handlePostClick = (postId: string) => {
  uni.navigateTo({ url: `/pages/post-detail/post-detail?id=${postId}` })
}

onLoad((options) => {
  routeUserId.value = typeof options?.id === 'string' ? options.id : ''
})

onMounted(async () => {
  loading.value = true
  try {
    await loadCurrentUser()
    await loadProfile()
  } catch (error) {
    console.error('加载用户主页失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.user-profile-page {
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

.user-card {
  background: #ffffff;
  padding: 40rpx 32rpx;
  margin-bottom: 16rpx;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.user-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 40rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.user-bio {
  font-size: 28rpx;
  line-height: 1.5;
  color: #666;
  margin-bottom: 32rpx;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  padding: 32rpx 0;
  border-top: 2rpx solid #f0f0f0;
  border-bottom: 2rpx solid #f0f0f0;
  margin-bottom: 32rpx;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 40rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
}

.user-actions {
  display: flex;
  gap: 24rpx;
}

.btn-follow,
.btn-message {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  font-size: 30rpx;
  border-radius: 16rpx;
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
  border-bottom: 2rpx solid #e5e5e5;
}

.content-tab {
  position: relative;
  flex: 1;
  padding: 24rpx 0;
  text-align: center;
  font-size: 30rpx;
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
  width: 80rpx;
  height: 4rpx;
  background: #1890ff;
}

.post-list {
  padding: 16rpx 0;
}

.card-post {
  background: #ffffff;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.card-post-content {
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
  margin-bottom: 24rpx;
}

.card-post-images {
  display: grid;
  gap: 16rpx;
  margin-bottom: 24rpx;
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
  border-radius: 16rpx;
}

.card-post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.post-time {
  font-size: 24rpx;
  color: #999;
}

.post-stats {
  display: flex;
  gap: 32rpx;
  font-size: 24rpx;
  color: #999;
}

.collection-list {
  padding: 80rpx 32rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  color: #999;
}

.empty-icon {
  font-size: 96rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
}
</style>
