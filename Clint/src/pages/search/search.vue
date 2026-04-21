<template>
  <view class="search-page">
    <view class="search-bar">
      <view class="icon-btn" @tap="handleBack">
        <text>‹</text>
      </view>
      <view class="search-input-wrapper">
        <text class="search-icon">🔍</text>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索动态、资源、用户..."
          class="search-input"
          @input="handleSearch"
          confirm-type="search"
          @confirm="handleSearchSubmit"
          :adjust-position="true"
          :hold-keyboard="false"
          :cursor-spacing="50"
          placeholder-style="color: #999;"
        />
        <text v-if="searchQuery" class="clear-icon" @tap="handleClear">✕</text>
      </view>
    </view>

    <view v-if="!searchQuery && searchHistory.length" class="search-history">
      <view class="section-header">
        <text class="section-title">搜索历史</text>
        <text class="clear-btn" @tap="handleClearHistory">清空</text>
      </view>
      <view class="history-tags">
        <view
          v-for="(item, index) in searchHistory"
          :key="index"
          class="history-tag"
          @tap="handleHistoryClick(item)"
        >
          <text>🕐 {{ item }}</text>
        </view>
      </view>
    </view>

    <view v-if="!searchQuery" class="hot-search">
      <view class="section-header">
        <text class="section-title">热门搜索</text>
      </view>
      <view class="hot-tags">
        <view
          v-for="(item, index) in hotSearches"
          :key="index"
          class="hot-tag"
          @tap="handleHotClick(item)"
        >
          <text>🔥 {{ item }}</text>
        </view>
      </view>
    </view>

    <view v-if="searchQuery" class="search-results">
      <view class="result-tabs">
        <view
          v-for="tab in resultTabs"
          :key="tab.key"
          class="result-tab"
          :class="{ active: currentTab === tab.key }"
          @tap="currentTab = tab.key"
        >
          {{ tab.label }}
        </view>
      </view>

      <view v-if="currentTab === 'posts'" class="result-list">
        <view v-for="post in searchResults.posts" :key="post.id" class="card-post" @tap="handlePostClick(post)">
          <view class="card-post-header">
            <image :src="post.avatar" class="card-post-avatar" mode="aspectFill" />
            <view class="card-post-user">
              <view class="card-post-username">{{ post.username }}</view>
              <view class="card-post-time">{{ post.time }}</view>
            </view>
          </view>
          <view class="card-post-content">{{ post.content }}</view>
        </view>
      </view>

      <view v-if="currentTab === 'users'" class="result-list">
        <view v-for="user in searchResults.users" :key="user.id" class="user-item" @tap="handleUserClick(user)">
          <image :src="user.avatar" class="user-avatar" mode="aspectFill" />
          <view class="user-info">
            <view class="user-name">{{ user.username }}</view>
            <view class="user-bio">{{ user.bio }}</view>
          </view>
          <view class="btn-follow">关注</view>
        </view>
      </view>

      <view v-if="currentTab === 'resources'" class="result-list">
        <view v-for="resource in searchResults.resources" :key="resource.id" class="resource-item" @tap="handleResourceClick(resource)">
          <image :src="resource.cover" class="resource-cover" mode="aspectFill" />
          <view class="resource-info">
            <view class="resource-title">{{ resource.title }}</view>
            <view class="resource-meta">
              <text>{{ resource.category }}</text>
              <text>{{ resource.downloads }} 下载</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { searchAll } from '@/api/search'
import { createDefaultAvatar, resolveMediaUrl } from '@/utils/media'

interface SearchPostItem {
  id: string
  avatar: string
  username: string
  time: string
  content: string
}

interface SearchUserItem {
  id: string
  avatar: string
  username: string
  bio: string
}

interface SearchResourceItem {
  id: string
  cover: string
  title: string
  category: string
  downloads: number
}

const searchQuery = ref('')
const currentTab = ref('posts')
const searchTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const historyStorageKey = 'search-history'

const resultTabs = [
  { key: 'posts', label: '动态' },
  { key: 'users', label: '用户' },
  { key: 'resources', label: '资源' }
]

const searchHistory = ref<string[]>(uni.getStorageSync(historyStorageKey) || [])

const hotSearches = ref([
  '校园活动',
  '考试资料',
  '二手交易',
  '失物招领',
  '表白墙'
])

const searchResults = ref({
  posts: [] as SearchPostItem[],
  users: [] as SearchUserItem[],
  resources: [] as SearchResourceItem[]
})

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

const persistHistory = () => {
  uni.setStorageSync(historyStorageKey, searchHistory.value)
}

const recordSearch = (keyword: string) => {
  const trimmed = keyword.trim()
  if (!trimmed) return

  searchHistory.value = [
    trimmed,
    ...searchHistory.value.filter((item) => item !== trimmed)
  ].slice(0, 10)
  persistHistory()
}

const executeSearch = async () => {
  const keyword = searchQuery.value.trim()

  if (!keyword) {
    searchResults.value = {
      posts: [],
      users: [],
      resources: []
    }
    return
  }

  try {
    const response = await searchAll(keyword)
    searchResults.value = {
      posts: response.posts.data.map((post) => ({
        id: post.id,
        avatar: resolveMediaUrl(post.author?.avatar) || createDefaultAvatar(post.author?.nickname || post.id),
        username: post.author?.nickname || '未知用户',
        time: formatTime(post.createdAt),
        content: post.content
      })),
      users: response.users.data.map((user) => ({
        id: user.id,
        avatar: resolveMediaUrl(user.avatar) || createDefaultAvatar(user.nickname || user.id),
        username: user.nickname,
        bio: user.bio || `${user.school || ''} ${user.college || ''}`.trim()
      })),
      resources: response.resources.data.map((resource) => ({
        id: resource.id,
        cover: resolveMediaUrl(resource.images?.[0]) || 'https://picsum.photos/100/100?random=1',
        title: resource.title,
        category: resource.category,
        downloads: resource.collectionsCount
      }))
    }
  } catch (error) {
    console.error('搜索失败:', error)
  }
}

const handleBack = () => {
  uni.navigateBack()
}

const handleSearch = () => {
  if (searchTimer.value) {
    clearTimeout(searchTimer.value)
  }

  searchTimer.value = setTimeout(() => {
    executeSearch()
  }, 250)
}

const handleSearchSubmit = () => {
  if (searchQuery.value.trim()) {
    recordSearch(searchQuery.value)
    executeSearch()
  }
}

const handleClear = () => {
  searchQuery.value = ''
  searchResults.value = {
    posts: [],
    users: [],
    resources: []
  }
}

const handleClearHistory = () => {
  searchHistory.value = []
  persistHistory()
}

const handleHistoryClick = (item: string) => {
  searchQuery.value = item
  handleSearchSubmit()
}

const handleHotClick = (item: string) => {
  searchQuery.value = item
  handleSearchSubmit()
}

const handlePostClick = (post: any) => {
  uni.navigateTo({ url: `/pages/post-detail/post-detail?id=${post.id}` })
}

const handleUserClick = (user: any) => {
  uni.navigateTo({ url: `/pages/user-profile/user-profile?id=${user.id}` })
}

const handleResourceClick = (resource: any) => {
  uni.navigateTo({ url: `/pages/resource-detail/resource-detail?id=${resource.id}` })
}
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.search-page {
  min-height: 100vh;
  background: #f8f8f8;
}

.search-bar {
  position: sticky;
  top: 0;
  height: 112rpx;
  padding: 0 32rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  gap: 16rpx;
  border-bottom: 2rpx solid #e5e5e5;
  z-index: 100;
}

.icon-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: #666;
  flex-shrink: 0;
}

.search-input-wrapper {
  flex: 1;
  height: 72rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 0 24rpx;
  background: #f5f5f5;
  border-radius: 36rpx;
}

.search-icon {
  font-size: 32rpx;
  color: #999;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  height: 100%;
  font-size: 28rpx;
  background: transparent;
  border: none;
}

.clear-icon {
  font-size: 28rpx;
  color: #999;
  flex-shrink: 0;
}

.search-history,
.hot-search {
  padding: 32rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
}

.clear-btn {
  font-size: 26rpx;
  color: #999;
}

.history-tags,
.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.history-tag,
.hot-tag {
  padding: 12rpx 24rpx;
  font-size: 26rpx;
  color: #666;
  background: #ffffff;
  border-radius: 32rpx;
}

.hot-tag {
  color: #1890ff;
}

.search-results {
  padding-top: 16rpx;
}

.result-tabs {
  display: flex;
  gap: 48rpx;
  padding: 0 32rpx;
  background: #ffffff;
  border-bottom: 2rpx solid #e5e5e5;
}

.result-tab {
  position: relative;
  padding: 24rpx 0;
  font-size: 30rpx;
  color: #666;
}

.result-tab.active {
  color: #1890ff;
  font-weight: 500;
}

.result-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: #1890ff;
}

.result-list {
  padding: 16rpx 0;
}

.card-post {
  background: #ffffff;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.card-post-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.card-post-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  margin-right: 24rpx;
}

.card-post-user {
  flex: 1;
}

.card-post-username {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.card-post-time {
  font-size: 22rpx;
  color: #999;
}

.card-post-content {
  font-size: 28rpx;
  line-height: 1.5;
  color: #666;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 32rpx;
  background: #ffffff;
  margin-bottom: 16rpx;
}

.user-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.user-bio {
  font-size: 26rpx;
  color: #999;
}

.btn-follow {
  padding: 12rpx 32rpx;
  font-size: 26rpx;
  color: #ffffff;
  background: #1890ff;
  border-radius: 32rpx;
}

.resource-item {
  display: flex;
  gap: 24rpx;
  padding: 32rpx;
  background: #ffffff;
  margin-bottom: 16rpx;
}

.resource-cover {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
}

.resource-info {
  flex: 1;
}

.resource-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 16rpx;
}

.resource-meta {
  display: flex;
  gap: 32rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
