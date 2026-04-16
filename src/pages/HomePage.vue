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
          <Search :size="24" />
        </view>
        <view class="icon-btn" @tap="handleNotification">
          <Bell :size="24" />
          <span v-if="hasUnread" class="badge-dot"></span>
        </view>
      </view>
    </view>

    <!-- 话题分类栏 -->
    <view class="topic-tabs">
      <view
        v-for="topic in topics"
        :key="topic.id"
        class="topic-tab"
        :class="{ active: currentTopic === topic.id }"
        @tap="handleTopicChange(topic.id)"
      >
        {{ topic.name }}
      </view>
    </view>

    <!-- 发布按钮 -->
    <view class="fab" @tap="handlePublish">
      <Plus :size="24" />
    </view>

    <!-- 动态列表 -->
    <view class="post-list">
      <view v-for="post in posts" :key="post.id" class="card-post">
        <!-- 用户信息 -->
        <view class="card-post-header">
          <image :src="post.avatar" :alt="post.username" class="card-post-avatar" />
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
            @tap="handleImagePreview(post.images, index)"
          />
        </view>

        <!-- 互动栏 -->
        <view class="card-post-actions">
          <view class="card-post-action" :class="{ active: post.isLiked }" @tap="handleLike(post)">
            <Heart :size="16" :fill="post.isLiked ? 'currentColor' : 'none'" />
            <span>{{ post.likes }}</span>
          </view>
          <view class="card-post-action" @tap="handleComment(post)">
            <MessageCircle :size="16" />
            <span>{{ post.comments }}</span>
          </view>
          <view class="card-post-action" @tap="handleCollect(post)">
            <Star :size="16" />
            <span>{{ post.collects }}</span>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'


// 未读消息标识
const hasUnread = ref(true)

// 话题分类
const topics = ref([
  { id: 'all', name: '全部' },
  { id: 'study', name: '学习' },
  { id: 'life', name: '生活' },
  { id: 'activity', name: '活动' },
  { id: 'confession', name: '表白墙' }
])

const currentTopic = ref('all')

// 所有动态数据
const allPosts = ref([
  {
    id: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang',
    username: '张同学',
    time: '2小时前',
    content: '今天天气真好，图书馆学习一整天！分享一下我的学习笔记～',
    category: 'study', // 添加分类
    images: [
      'https://picsum.photos/300/300?random=1',
      'https://picsum.photos/300/300?random=2',
      'https://picsum.photos/300/300?random=3'
    ],
    likes: 45,
    comments: 12,
    collects: 8,
    isLiked: false
  },
  {
    id: 2,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Li',
    username: '李同学',
    time: '5小时前',
    content: '食堂新出的菜品真不错，推荐给大家！',
    category: 'life', // 添加分类
    images: ['https://picsum.photos/300/300?random=4'],
    likes: 23,
    comments: 6,
    collects: 3,
    isLiked: false
  },
  {
    id: 3,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wang',
    username: '王同学',
    time: '1天前',
    content: '周末组织了一场篮球赛，大家玩得很开心！期待下次活动～',
    category: 'activity', // 添加分类
    images: [],
    likes: 67,
    comments: 18,
    collects: 12,
    isLiked: true
  },
  {
    id: 4,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chen',
    username: '陈同学',
    time: '3小时前',
    content: '想对图书馆三楼那位穿白色卫衣的同学说：你的笑容真好看～',
    category: 'confession', // 添加分类
    images: [],
    likes: 89,
    comments: 34,
    collects: 15,
    isLiked: false
  },
  {
    id: 5,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liu',
    username: '刘同学',
    time: '6小时前',
    content: '分享一些高数学习资料，需要的同学可以私信我～',
    category: 'study', // 添加分类
    images: ['https://picsum.photos/300/300?random=5'],
    likes: 56,
    comments: 23,
    collects: 45,
    isLiked: false
  }
])

// 根据选中的标签筛选动态
const posts = computed(() => {
  if (currentTopic.value === 'all') {
    return allPosts.value
  }
  return allPosts.value.filter(post => post.category === currentTopic.value)
})

// 获取图片布局类名
const getImageClass = (count: number) => {
  if (count === 1) return 'single'
  if (count === 2) return 'double'
  return 'multiple'
}

// 话题切换
const handleTopicChange = (topicId: string) => {
  currentTopic.value = topicId
}

// 搜索
const handleSearch = () => {
  uni.navigateTo({ url: '/search')
}

// 通知
const handleNotification = () => {
  uni.navigateTo({ url: '/notification')
}

// 点赞
const handleLike = (post: any) => {
  post.isLiked = !post.isLiked
  post.likes += post.isLiked ? 1 : -1
}

// 评论
const handleComment = (post: any) => {
  uni.navigateTo({ url: `/post/${post.id}`)
}

// 收藏
const handleCollect = (post: any) => {
  console.log('收藏', post.id)
}

// 图片预览
const handleImagePreview = (images: string[], index: number) => {
  console.log('预览图片', images, index)
}

// 发布动态
const handlePublish = () => {
  uni.navigateTo({ url: '/publish')
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding-bottom: 50px;
  background: var(--color-bg-page);
}

.header {
  position: sticky;
  top: 0;
  height: 44px;
  padding: 0 var(--page-padding);
  background: var(--color-bg-white);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: var(--border-width-thin) solid var(--color-border-base);
  z-index: var(--z-index-sticky);
}

.header-left {
  display: flex;
  align-items: center;
  
}

.logo {
  font-size: 24px;
}

.title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  
}

.icon-btn {
  position: relative;
  width: 24px;
  height: 24px;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.badge-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: var(--color-badge);
  border-radius: var(--radius-round);
  border: 2px solid var(--color-bg-white);
}

.topic-tabs {
  display: flex;
  
  padding: var(--spacing-md) var(--page-padding);
  background: var(--color-bg-white);
  overflow-x: auto;
  white-space: nowrap;
}

.topic-tabs::-webkit-scrollbar {
  display: none;
}

.topic-tab {
  flex-shrink: 0;
  height: 28px;
  padding: 0 var(--spacing-md);
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: var(--color-bg-gray);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.topic-tab.active {
  color: var(--color-text-white);
  background: var(--color-primary);
}

.post-list {
  padding: var(--spacing-sm) 0;
}

.fab {
  position: fixed;
  right: var(--page-padding);
  bottom: 70px;
  width: 56px;
  height: 56px;
  background: var(--color-primary);
  border-radius: var(--radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-white);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: var(--z-index-fixed);
  transition: all var(--duration-fast) var(--ease-out);
}

.fab:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.fab:active {
  transform: scale(0.95);
}
</style>
