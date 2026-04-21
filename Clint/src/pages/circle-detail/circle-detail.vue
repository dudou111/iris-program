<template>
  <view class="circle-detail-page">
    <view class="header">
      <view class="icon-btn" @tap="handleBack">
        <text>‹</text>
      </view>
      <view class="title">圈子详情</view>
      <view class="icon-btn" @tap="handleShare">
        <text>⋯</text>
      </view>
    </view>

    <view v-if="loading" class="empty-state">
      <view class="empty-text">加载中...</view>
    </view>

    <template v-else-if="circle">
      <view class="circle-info">
        <image :src="circle.cover" class="circle-cover" mode="aspectFill" />
        <view class="circle-header">
          <view class="circle-name">{{ circle.name }}</view>
          <view class="circle-desc">{{ circle.description }}</view>
          <view class="circle-stats">
            <text class="stat-item">👥 {{ circle.membersCount }} 成员</text>
            <text class="stat-item">📝 {{ circle.postsCount }} 动态</text>
          </view>
        </view>
        <view class="btn-join" :class="{ joined: isJoined }" @tap="handleJoin">
          <text>{{ isJoined ? '已加入' : '加入圈子' }}</text>
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

      <view v-if="currentTab === 'posts'" class="empty-state content-state">
        <view class="empty-text">圈子动态列表将在后续接口接入后展示</view>
      </view>

      <view v-else class="member-list">
        <view v-if="members.length === 0" class="empty-state content-state">
          <view class="empty-text">暂时还没有成员信息</view>
        </view>
        <view v-for="member in members" :key="member.id" class="member-item">
          <image :src="member.avatar" class="member-avatar" mode="aspectFill" />
          <view class="member-info">
            <view class="member-name">{{ member.username }}</view>
            <view class="member-role">{{ member.role }}</view>
          </view>
        </view>
      </view>
    </template>

    <view v-else class="empty-state">
      <view class="empty-text">圈子不存在</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  getCircleDetail,
  getCircleMembers,
  joinCircle,
  leaveCircle,
  type Circle
} from '@/api/circles'
import { createDefaultAvatar, resolveMediaUrl } from '@/utils/media'
import { getToken } from '@/utils/request'

interface CircleDetailState {
  id: string
  creatorId: string
  name: string
  description: string
  cover: string
  membersCount: number
  postsCount: number
}

interface CircleMemberItem {
  id: string
  avatar: string
  username: string
  role: string
}

const currentTab = ref('posts')
const loading = ref(true)
const isJoined = ref(false)
const circle = ref<CircleDetailState | null>(null)
const members = ref<CircleMemberItem[]>([])

const tabs = [
  { key: 'posts', label: '动态' },
  { key: 'members', label: '成员' }
]

const getCurrentUserId = () => (uni.getStorageSync('userInfo')?.id || '') as string

const getCircleId = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as { $page?: { options?: Record<string, string> } }
  return currentPage?.$page?.options?.id || ''
}

const mapCircle = (detail: Circle): CircleDetailState => ({
  id: detail.id,
  creatorId: detail.creatorId,
  name: detail.name,
  description: detail.description || '这个圈子还没有简介',
  cover: resolveMediaUrl(detail.cover) || 'https://picsum.photos/800/400?random=61',
  membersCount: detail.membersCount || 0,
  postsCount: detail.postsCount || 0
})

const mapMember = (member: any): CircleMemberItem => ({
  id: member.id,
  avatar: resolveMediaUrl(member.avatar) || createDefaultAvatar(member.nickname || member.id),
  username: member.nickname || member.username || '未知成员',
  role: member.id === circle.value?.creatorId ? '圈主' : '成员'
})

const requireLogin = () => {
  if (getToken()) {
    return true
  }

  uni.showToast({
    title: '请先登录',
    icon: 'none'
  })
  setTimeout(() => {
    uni.navigateTo({ url: '/pages/login/login' })
  }, 500)
  return false
}

const loadCircle = async () => {
  const id = getCircleId()
  if (!id) {
    circle.value = null
    return
  }

  const [detail, memberRes] = await Promise.all([
    getCircleDetail(id),
    getCircleMembers(id, { page: 1, limit: 20 })
  ])

  circle.value = mapCircle(detail)
  members.value = memberRes.data.map(mapMember)
  isJoined.value = members.value.some((member) => member.id === getCurrentUserId())
}

const handleBack = () => {
  uni.navigateBack()
}

const handleShare = () => {
  uni.showToast({
    title: '分享功能开发中',
    icon: 'none'
  })
}

const handleJoin = async () => {
  if (!circle.value || !requireLogin()) return

  try {
    if (isJoined.value) {
      await leaveCircle(circle.value.id)
      isJoined.value = false
      circle.value.membersCount = Math.max(0, circle.value.membersCount - 1)
      members.value = members.value.filter((member) => member.id !== getCurrentUserId())
      uni.showToast({ title: '已退出', icon: 'success' })
    } else {
      await joinCircle(circle.value.id)
      isJoined.value = true
      circle.value.membersCount += 1
      const currentUser = uni.getStorageSync('userInfo')
      if (currentUser?.id && !members.value.some((member) => member.id === currentUser.id)) {
        members.value.unshift({
          id: currentUser.id,
          avatar:
            resolveMediaUrl(currentUser.avatar) || createDefaultAvatar(currentUser.nickname || currentUser.id),
          username: currentUser.nickname || '我',
          role: currentUser.id === circle.value.creatorId ? '圈主' : '成员'
        })
      }
      uni.showToast({ title: '加入成功', icon: 'success' })
    }
  } catch (error) {
    console.error('圈子加入状态更新失败:', error)
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await loadCircle()
  } catch (error) {
    console.error('加载圈子详情失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.circle-detail-page {
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

.circle-info {
  background: #ffffff;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.circle-cover {
  width: 100%;
  height: 400rpx;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}

.circle-header {
  margin-bottom: 24rpx;
}

.circle-name {
  font-size: 40rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 16rpx;
}

.circle-desc {
  font-size: 28rpx;
  line-height: 1.6;
  color: #666;
  margin-bottom: 16rpx;
}

.circle-stats {
  display: flex;
  gap: 32rpx;
}

.stat-item {
  font-size: 26rpx;
  color: #999;
}

.btn-join {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 500;
  color: #ffffff;
  background: #1890ff;
  border-radius: 16rpx;
}

.btn-join.joined {
  color: #666;
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

.member-list {
  padding: 16rpx 32rpx 32rpx;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
}

.member-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  margin-right: 24rpx;
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.member-role {
  font-size: 24rpx;
  color: #999;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320rpx;
}

.content-state {
  padding: 40rpx 32rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>
