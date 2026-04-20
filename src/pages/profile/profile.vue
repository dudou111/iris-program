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
        <Icon name="file-text" :size="20" color="#666" class="menu-icon" />
        <text class="menu-text">我的发布</text>
        <Icon name="chevron-right" :size="20" color="#ccc" />
      </view>
      <view class="menu-item" @tap="goToMyCollections">
        <Icon name="star" :size="20" color="#666" class="menu-icon" />
        <text class="menu-text">我的收藏</text>
        <Icon name="chevron-right" :size="20" color="#ccc" />
      </view>
      <view class="menu-item" @tap="goToEditProfile">
        <Icon name="edit" :size="20" color="#666" class="menu-icon" />
        <text class="menu-text">编辑资料</text>
        <Icon name="chevron-right" :size="20" color="#ccc" />
      </view>
      <view class="menu-item" @tap="goToSettings">
        <Icon name="settings" :size="20" color="#666" class="menu-icon" />
        <text class="menu-text">设置</text>
        <Icon name="chevron-right" :size="20" color="#ccc" />
      </view>
    </view>

    <!-- 自定义 TabBar -->
    <custom-tab-bar />
  </view>
</template>

<script setup lang="ts">
import CustomTabBar from '@/components/custom-tab-bar/custom-tab-bar.vue'
import Icon from '@/components/icon/icon.vue'

const goToFollowing = () => {
  uni.navigateTo({
    url: '/pages/following/following',
    fail: (err) => {
      console.error('页面跳转失败:', err)
    }
  })
}

const goToFollowers = () => {
  uni.navigateTo({
    url: '/pages/followers/followers',
    fail: (err) => {
      console.error('页面跳转失败:', err)
    }
  })
}

const goToMyPosts = () => {
  uni.navigateTo({
    url: '/pages/my-posts/my-posts',
    fail: (err) => {
      console.error('页面跳转失败:', err)
    }
  })
}

const goToMyCollections = () => {
  uni.navigateTo({
    url: '/pages/my-collections/my-collections',
    fail: (err) => {
      console.error('页面跳转失败:', err)
    }
  })
}

const goToEditProfile = () => {
  uni.navigateTo({
    url: '/pages/edit-profile/edit-profile',
    fail: (err) => {
      console.error('页面跳转失败:', err)
    }
  })
}

const goToSettings = () => {
  uni.navigateTo({
    url: '/pages/settings/settings',
    fail: (err) => {
      console.error('页面跳转失败:', err)
    }
  })
}
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.profile-page {
  min-height: 100vh;
  background: #f8f8f8;
}

.profile-header {
  padding: 48rpx 32rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.avatar {
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  margin-right: 32rpx;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 36rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.user-id {
  font-size: 28rpx;
  color: #999;
}

.stats {
  padding: 32rpx;
  background: #ffffff;
  display: flex;
  justify-content: space-around;
  margin-bottom: 24rpx;
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
  font-size: 28rpx;
  color: #666;
}

.menu-list {
  background: #ffffff;
}

.menu-item {
  padding: 32rpx;
  display: flex;
  align-items: center;
  border-bottom: 2rpx solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  margin-right: 24rpx;
  display: flex;
  align-items: center;
}

.menu-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}
</style>
