<template>
  <view class="profile-page">
    <view class="profile-header">
      <image src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" class="avatar" mode="aspectFill" />
      <view class="user-info">
        <view class="username">用户昵称</view>
        <view class="user-id">ID: 123456</view>
      </view>
    </view>

    <view class="stats">
      <view class="stat-item" @tap="goToFollowing">
        <view class="stat-value">128</view>
        <view class="stat-label">关注</view>
      </view>
      <view class="stat-item" @tap="goToFollowers">
        <view class="stat-value">256</view>
        <view class="stat-label">粉丝</view>
      </view>
      <view class="stat-item" @tap="goToMyPosts">
        <view class="stat-value">45</view>
        <view class="stat-label">动态</view>
      </view>
    </view>

    <view class="menu-list">
      <view class="menu-item" @tap="goToMyPosts">
        <text class="menu-icon">📝</text>
        <text class="menu-text">我的发布</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goToMyCollections">
        <text class="menu-icon">⭐</text>
        <text class="menu-text">我的收藏</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goToEditProfile">
        <text class="menu-icon">✏️</text>
        <text class="menu-text">编辑资料</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goToSettings">
        <text class="menu-icon">⚙️</text>
        <text class="menu-text">设置</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 自定义 TabBar -->
    <custom-tab-bar />
  </view>
</template>

<script setup lang="ts">
import CustomTabBar from '@/components/custom-tab-bar/custom-tab-bar.vue'

const goToFollowing = () => {
  uni.navigateTo({ url: '/pages/following/following' })
}

const goToFollowers = () => {
  uni.navigateTo({ url: '/pages/followers/followers' })
}

const goToMyPosts = () => {
  uni.navigateTo({ url: '/pages/my-posts/my-posts' })
}

const goToMyCollections = () => {
  uni.navigateTo({ url: '/pages/my-collections/my-collections' })
}

const goToEditProfile = () => {
  uni.navigateTo({ url: '/pages/edit-profile/edit-profile' })
}

const goToSettings = () => {
  uni.navigateTo({ url: '/pages/settings/settings' })
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f8f8f8;
}

.profile-header {
  padding: 24px 16px;
  background: #ffffff;
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin-right: 16px;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.user-id {
  font-size: 14px;
  color: #999;
}

.stats {
  padding: 16px;
  background: #ffffff;
  display: flex;
  justify-content: space-around;
  margin-bottom: 12px;
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
  font-size: 14px;
  color: #666;
}

.menu-list {
  background: #ffffff;
}

.menu-item {
  padding: 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 20px;
  margin-right: 12px;
}

.menu-text {
  flex: 1;
  font-size: 15px;
  color: #333;
}

.menu-arrow {
  font-size: 24px;
  color: #ccc;
}
</style>
