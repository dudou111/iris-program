<template>
  <view class="following-page">
    <view class="header">
      <text class="title">我的关注</text>
    </view>

    <scroll-view class="user-list" scroll-y>
      <view v-for="user in followingList" :key="user.id" class="user-card">
        <image :src="user.avatar" class="user-avatar" mode="aspectFill" />
        <view class="user-info">
          <view class="user-name">{{ user.name }}</view>
          <view class="user-desc">{{ user.desc }}</view>
        </view>
        <view class="follow-btn">已关注</view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const followingList = ref([
  { id: 1, name: '张同学', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang', desc: '爱学习的小伙伴' },
  { id: 2, name: '李同学', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Li', desc: '美食爱好者' }
])
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.following-page {
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
  color: #666;
  background: #f5f5f5;
  border-radius: 8rpx;
}
</style>
