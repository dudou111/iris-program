<template>
  <view class="followers-page">
    <view class="header">
      <text class="title">我的粉丝</text>
    </view>

    <scroll-view class="user-list" scroll-y>
      <view v-for="user in followersList" :key="user.id" class="user-card">
        <image :src="user.avatar" class="user-avatar" mode="aspectFill" />
        <view class="user-info">
          <view class="user-name">{{ user.name }}</view>
          <view class="user-desc">{{ user.desc }}</view>
        </view>
        <view class="follow-btn">关注</view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const followersList = ref([
  { id: 1, name: '王同学', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wang', desc: '运动达人' },
  { id: 2, name: '陈同学', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chen', desc: '摄影爱好者' }
])
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.followers-page {
  min-height: 100vh;
  background: #f8f8f8;
}

.header {
  height: 88rpx;
  padding: 0 32rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  border-bottom: 2rpx solid #e5e5e5;
}

.title {
  font-size: 36rpx;
  font-weight: 500;
  color: #333;
}

.user-list {
  height: calc(100vh - 88rpx);
  padding: 24rpx;
}

.user-card {
  margin-bottom: 24rpx;
  padding: 32rpx;
  background: #ffffff;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  margin-right: 24rpx;
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

.user-desc {
  font-size: 26rpx;
  color: #999;
}

.follow-btn {
  padding: 12rpx 32rpx;
  font-size: 26rpx;
  color: #ffffff;
  background: #1890ff;
  border-radius: 8rpx;
}
</style>
