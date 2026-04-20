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

    <view class="circle-info">
      <image :src="circle.cover" class="circle-cover" mode="aspectFill" />
      <view class="circle-header">
        <view class="circle-name">{{ circle.name }}</view>
        <view class="circle-desc">{{ circle.description }}</view>
        <view class="circle-stats">
          <text class="stat-item">👥 {{ circle.members }} 成员</text>
          <text class="stat-item">📝 {{ circle.posts }} 动态</text>
        </view>
      </view>
      <view class="btn-join" :class="{ joined: circle.isJoined }" @tap="handleJoin">
        <text>{{ circle.isJoined ? '已加入' : '加入圈子' }}</text>
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
      <view v-for="post in circlePosts" :key="post.id" class="card-post" @tap="handlePostClick(post)">
        <view class="card-post-header">
          <image :src="post.avatar" class="card-post-avatar" mode="aspectFill" />
          <view class="card-post-user">
            <view class="card-post-username">{{ post.username }}</view>
            <view class="card-post-time">{{ post.time }}</view>
          </view>
        </view>
        <view class="card-post-content">{{ post.content }}</view>
        <view class="card-post-actions">
          <text class="action-item">❤️ {{ post.likes }}</text>
          <text class="action-item">💬 {{ post.comments }}</text>
        </view>
      </view>
    </view>

    <view v-if="currentTab === 'members'" class="member-list">
      <view v-for="member in circleMembers" :key="member.id" class="member-item">
        <image :src="member.avatar" class="member-avatar" mode="aspectFill" />
        <view class="member-info">
          <view class="member-name">{{ member.username }}</view>
          <view class="member-role">{{ member.role }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentTab = ref('posts')

const tabs = [
  { key: 'posts', label: '动态' },
  { key: 'members', label: '成员' }
]

const circle = ref({
  id: 1,
  name: '计算机学习小组',
  description: '一起学习编程，分享技术心得，共同进步',
  cover: 'https://picsum.photos/400/300?random=1',
  members: 1234,
  posts: 567,
  isJoined: false
})

const circlePosts = ref([
  {
    id: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User1',
    username: '张同学',
    time: '2小时前',
    content: '今天学习了Vue3的组合式API，感觉很强大！',
    likes: 45,
    comments: 12
  },
  {
    id: 2,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User2',
    username: '李同学',
    time: '5小时前',
    content: '分享一个很好用的算法可视化网站',
    likes: 23,
    comments: 6
  }
])

const circleMembers = ref([
  {
    id: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member1',
    username: '王同学',
    role: '圈主'
  },
  {
    id: 2,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member2',
    username: '刘同学',
    role: '管理员'
  }
])

const handleBack = () => {
  uni.navigateBack()
}

const handleShare = () => {
  uni.showToast({ title: '分享功能开发中', icon: 'none' ,
      duration: 2000
    })
}

const handleJoin = () => {
  circle.value.isJoined = !circle.value.isJoined
  circle.value.members += circle.value.isJoined ? 1 : -1
  uni.showToast({
    title: circle.value.isJoined ? '加入成功' : '已退出',
    icon: 'success'
  ,
      duration: 2000
    })
}

const handlePostClick = (post: any) => {
  uni.navigateTo({ url: `/pages/post-detail/post-detail?id=${post.id}` })
}
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

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
  line-height: 1.5;
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

.post-list {
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
  width: 80rpx;
  height: 80rpx;
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
  font-size: 24rpx;
  color: #999;
}

.card-post-content {
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
  margin-bottom: 24rpx;
}

.card-post-actions {
  display: flex;
  gap: 48rpx;
}

.action-item {
  font-size: 26rpx;
  color: #999;
}

.member-list {
  padding: 16rpx 32rpx;
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
</style>
