<template>
  <view class="followers-page">
    <view class="header">
      <view class="icon-btn" @tap="handleBack">
        <text>‹</text>
      </view>
      <text class="title">我的粉丝</text>
      <view class="icon-btn"></view>
    </view>

    <scroll-view class="user-list" scroll-y @scrolltolower="handleLoadMore">
      <view v-for="user in followersList" :key="user.id" class="user-card" @tap="goToUserProfile(user.id)">
        <image :src="user.avatar" class="user-avatar" mode="aspectFill" />
        <view class="user-info">
          <view class="user-name">{{ user.name }}</view>
          <view class="user-desc">{{ user.desc }}</view>
        </view>
        <view class="follow-btn" :class="{ following: user.isFollowing }" @tap.stop="handleToggleFollow(user)">
          {{ user.isFollowing ? '已关注' : '回关' }}
        </view>
      </view>

      <view v-if="loading" class="status-text">加载中...</view>
      <view v-else-if="!hasMore && followersList.length > 0" class="status-text">没有更多粉丝了</view>
      <view v-else-if="followersList.length === 0" class="empty-state">
        <view class="empty-title">还没有粉丝</view>
        <view class="empty-desc">当其他同学关注你之后，他们会出现在这里。</view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { followUser, getCurrentUser, getFollowers, unfollowUser, type User } from '@/api/users'
import { createDefaultAvatar, resolveMediaUrl } from '@/utils/media'

interface FollowerUserItem {
  id: string
  name: string
  avatar: string
  desc: string
  isFollowing: boolean
}

const followersList = ref<FollowerUserItem[]>([])
const currentUserId = ref('')
const loading = ref(false)
const page = ref(1)
const limit = ref(20)
const hasMore = ref(true)

const buildUserDesc = (user: User) => {
  return (
    user.bio ||
    [user.school, user.college, user.major, user.grade].filter(Boolean).join(' · ') ||
    '这个人很神秘，什么都没留下。'
  )
}

const mapUser = (user: User): FollowerUserItem => ({
  id: user.id,
  name: user.nickname || '未命名用户',
  avatar: resolveMediaUrl(user.avatar) || createDefaultAvatar(user.nickname || user.id),
  desc: buildUserDesc(user),
  isFollowing: Boolean(user.isFollowing)
})

const ensureCurrentUser = async () => {
  if (currentUserId.value) {
    return
  }

  const user = await getCurrentUser()
  currentUserId.value = user.id
}

const loadFollowers = async (refresh = false) => {
  if (loading.value) return

  await ensureCurrentUser()

  if (refresh) {
    page.value = 1
    hasMore.value = true
    followersList.value = []
  }

  if (!hasMore.value) return

  loading.value = true

  try {
    const res = await getFollowers(currentUserId.value, {
      page: page.value,
      limit: limit.value
    })
    const items = res.data.map(mapUser)

    if (refresh) {
      followersList.value = items
    } else {
      followersList.value = [...followersList.value, ...items]
    }

    hasMore.value = page.value < res.totalPages
    page.value += 1
  } catch (error) {
    console.error('加载粉丝列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  uni.navigateBack()
}

const goToUserProfile = (id: string) => {
  uni.navigateTo({
    url: `/pages/user-profile/user-profile?id=${id}`
  })
}

const handleToggleFollow = async (user: FollowerUserItem) => {
  try {
    if (user.isFollowing) {
      await unfollowUser(user.id)
      user.isFollowing = false
      uni.showToast({
        title: '已取消关注',
        icon: 'success'
      })
    } else {
      await followUser(user.id)
      user.isFollowing = true
      uni.showToast({
        title: '已回关',
        icon: 'success'
      })
    }

    uni.$emit('user:updated')
  } catch (error) {
    console.error('关注操作失败:', error)
  }
}

const handleLoadMore = () => {
  if (!loading.value && hasMore.value) {
    loadFollowers()
  }
}

onShow(() => {
  loadFollowers(true)
})
</script>

<style scoped>
.followers-page {
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

.user-list {
  height: calc(100vh - 88rpx);
  padding: 24rpx;
  box-sizing: border-box;
}

.user-card {
  margin-bottom: 24rpx;
  padding: 32rpx;
  width: 100%;
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.user-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.user-desc {
  font-size: 26rpx;
  color: #999;
  line-height: 1.5;
}

.follow-btn {
  padding: 12rpx 32rpx;
  font-size: 26rpx;
  color: #ffffff;
  background: #1890ff;
  border-radius: 8rpx;
}

.follow-btn.following {
  color: #666;
  background: #f5f5f5;
}

.status-text {
  text-align: center;
  padding: 32rpx 0;
  font-size: 26rpx;
  color: #999;
}

.empty-state {
  padding: 160rpx 32rpx;
  text-align: center;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.empty-desc {
  margin-top: 16rpx;
  font-size: 26rpx;
  line-height: 1.6;
  color: #999;
}
</style>
