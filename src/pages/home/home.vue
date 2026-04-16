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
          <text class="icon">🔍</text>
        </view>
        <view class="icon-btn" @tap="handleNotification">
          <text class="icon">🔔</text>
          <view v-if="hasUnread" class="badge-dot"></view>
        </view>
      </view>
    </view>

    <!-- 话题分类栏 -->
    <scroll-view class="topic-tabs" scroll-x>
      <view
        v-for="topic in topics"
        :key="topic.id"
        class="topic-tab"
        :class="{ active: currentTopic === topic.id }"
        @tap="handleTopicChange(topic.id)"
      >
        {{ topic.name }}
      </view>
    </scroll-view>

    <!-- 发布按钮 -->
    <view class="fab" @tap="handlePublish">
      <text class="icon">➕</text>
    </view>

    <!-- 动态列表 -->
    <scroll-view class="post-list" scroll-y>
      <view v-for="post in posts" :key="post.id" class="card-post">
        <!-- 用户信息 -->
        <view class="card-post-header">
          <image :src="post.avatar" class="card-post-avatar" mode="aspectFill" />
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
            mode="aspectFill"
            @tap="handleImagePreview(post.images, index)"
          />
        </view>

        <!-- 互动栏 -->
        <view class="card-post-actions">
          <view class="card-post-action" :class="{ active: post.isLiked }" @tap="handleLike(post)">
            <text class="icon">{{ post.isLiked ? '❤️' : '🤍' }}</text>
            <text>{{ post.likes }}</text>
          </view>
          <view class="card-post-action" @tap="handleComment(post)">
            <text class="icon">💬</text>
            <text>{{ post.comments }}</text>
          </view>
          <view class="card-post-action" @tap="handleCollect(post)">
            <text class="icon">⭐</text>
            <text>{{ post.collects }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 自定义 TabBar -->
    <custom-tab-bar />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CustomTabBar from '@/components/custom-tab-bar/custom-tab-bar.vue'

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
    category: 'study',
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
    category: 'life',
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
    category: 'activity',
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
    category: 'confession',
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
    category: 'study',
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
  uni.navigateTo({
    url: '/pages/search/search'
  })
}

// 通知
const handleNotification = () => {
  uni.navigateTo({
    url: '/pages/notification/notification'
  })
}

// 点赞
const handleLike = (post: any) => {
  post.isLiked = !post.isLiked
  post.likes += post.isLiked ? 1 : -1
}

// 评论
const handleComment = (post: any) => {
  uni.navigateTo({
    url: `/pages/post-detail/post-detail?id=${post.id}`
  })
}

// 收藏
const handleCollect = (post: any) => {
  uni.showToast({
    title: '收藏成功',
    icon: 'success'
  })
}

// 图片预览
const handleImagePreview = (images: string[], index: number) => {
  uni.previewImage({
    urls: images,
    current: index
  })
}

// 发布动态
const handlePublish = () => {
  uni.navigateTo({
    url: '/pages/publish/publish'
  })
}
</script>

<style scoped>
.home-page {
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

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  font-size: 24px;
  margin-right: 8px;
}

.title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
}

.icon-btn {
  position: relative;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 16px;
}

.icon {
  font-size: 20px;
}

.badge-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: #ff4d4f;
  border-radius: 50%;
  border: 2px solid #ffffff;
}

.topic-tabs {
  height: 52px;
  padding: 12px 16px;
  background: #ffffff;
  white-space: nowrap;
}

.topic-tab {
  display: inline-block;
  height: 28px;
  line-height: 28px;
  padding: 0 16px;
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  border-radius: 14px;
  margin-right: 12px;
}

.topic-tab.active {
  color: #ffffff;
  background: #1890ff;
}

.post-list {
  height: calc(100vh - 96px);
  padding: 8px 0;
}

.card-post {
  margin: 8px 16px;
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
}

.card-post-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.card-post-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.card-post-user {
  flex: 1;
}

.card-post-username {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.card-post-time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.card-post-content {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 12px;
}

.card-post-images {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.card-post-images.single .card-post-image {
  width: 100%;
  height: 200px;
  border-radius: 8px;
}

.card-post-images.double .card-post-image {
  width: calc(50% - 4px);
  height: 150px;
  border-radius: 8px;
  margin-right: 8px;
}

.card-post-images.double .card-post-image:last-child {
  margin-right: 0;
}

.card-post-images.multiple .card-post-image {
  width: calc(33.33% - 6px);
  height: 100px;
  border-radius: 8px;
  margin-right: 8px;
  margin-bottom: 8px;
}

.card-post-images.multiple .card-post-image:nth-child(3n) {
  margin-right: 0;
}

.card-post-actions {
  display: flex;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.card-post-action {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
  margin-right: 24px;
}

.card-post-action text {
  margin-left: 4px;
}

.card-post-action.active {
  color: #ff4d4f;
}

.fab {
  position: fixed;
  right: 16px;
  bottom: 80px;
  width: 56px;
  height: 56px;
  background: #1890ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.fab .icon {
  font-size: 24px;
  color: #ffffff;
}
</style>
