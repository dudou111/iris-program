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

const searchQuery = ref('')
const currentTab = ref('posts')

const resultTabs = [
  { key: 'posts', label: '动态' },
  { key: 'users', label: '用户' },
  { key: 'resources', label: '资源' }
]

const searchHistory = ref([
  '图书馆',
  '学习笔记',
  '篮球赛'
])

const hotSearches = ref([
  '校园活动',
  '考试资料',
  '二手交易',
  '失物招领',
  '表白墙'
])

const searchResults = ref({
  posts: [
    {
      id: 1,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang',
      username: '张同学',
      time: '2小时前',
      content: '今天天气真好，图书馆学习一整天！'
    },
    {
      id: 2,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Li',
      username: '李同学',
      time: '5小时前',
      content: '食堂新出的菜品真不错，推荐给大家！'
    }
  ],
  users: [
    {
      id: 1,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User1',
      username: '王同学',
      bio: '计算机学院 | 热爱编程'
    },
    {
      id: 2,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User2',
      username: '刘同学',
      bio: '设计学院 | UI/UX设计师'
    }
  ],
  resources: [
    {
      id: 1,
      cover: 'https://picsum.photos/100/100?random=1',
      title: '高等数学复习资料',
      category: '学习资料',
      downloads: 128
    },
    {
      id: 2,
      cover: 'https://picsum.photos/100/100?random=2',
      title: 'Python入门教程',
      category: '编程',
      downloads: 256
    }
  ]
})

const handleBack = () => {
  uni.navigateBack()
}

const handleSearch = () => {
  console.log('搜索:', searchQuery.value)
}

const handleSearchSubmit = () => {
  if (searchQuery.value.trim()) {
    if (!searchHistory.value.includes(searchQuery.value)) {
      searchHistory.value.unshift(searchQuery.value)
      if (searchHistory.value.length > 10) {
        searchHistory.value.pop()
      }
    }
  }
}

const handleClear = () => {
  searchQuery.value = ''
}

const handleClearHistory = () => {
  searchHistory.value = []
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
.search-page {
  min-height: 100vh;
  background: #f8f8f8;
}

.search-bar {
  position: sticky;
  top: 0;
  height: 56px;
  padding: 0 16px;
  background: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #e5e5e5;
  z-index: 100;
}

.icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #666;
  flex-shrink: 0;
}

.search-input-wrapper {
  flex: 1;
  height: 36px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  background: #f5f5f5;
  border-radius: 18px;
}

.search-icon {
  font-size: 16px;
  color: #999;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  height: 100%;
  font-size: 14px;
  background: transparent;
  border: none;
}

.clear-icon {
  font-size: 14px;
  color: #999;
  flex-shrink: 0;
}

.search-history,
.hot-search {
  padding: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.clear-btn {
  font-size: 13px;
  color: #999;
}

.history-tags,
.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-tag,
.hot-tag {
  padding: 6px 12px;
  font-size: 13px;
  color: #666;
  background: #ffffff;
  border-radius: 16px;
}

.hot-tag {
  color: #1890ff;
}

.search-results {
  padding-top: 8px;
}

.result-tabs {
  display: flex;
  gap: 24px;
  padding: 0 16px;
  background: #ffffff;
  border-bottom: 1px solid #e5e5e5;
}

.result-tab {
  position: relative;
  padding: 12px 0;
  font-size: 15px;
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
  height: 2px;
  background: #1890ff;
}

.result-list {
  padding: 8px 0;
}

.card-post {
  background: #ffffff;
  padding: 16px;
  margin-bottom: 8px;
}

.card-post-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.card-post-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 12px;
}

.card-post-user {
  flex: 1;
}

.card-post-username {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.card-post-time {
  font-size: 11px;
  color: #999;
}

.card-post-content {
  font-size: 14px;
  line-height: 1.5;
  color: #666;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #ffffff;
  margin-bottom: 8px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.user-bio {
  font-size: 13px;
  color: #999;
}

.btn-follow {
  padding: 6px 16px;
  font-size: 13px;
  color: #ffffff;
  background: #1890ff;
  border-radius: 16px;
}

.resource-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #ffffff;
  margin-bottom: 8px;
}

.resource-cover {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  flex-shrink: 0;
}

.resource-info {
  flex: 1;
}

.resource-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.resource-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}
</style>
