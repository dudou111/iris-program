<template>
  <view class="my-posts-page">
    <view class="header">
      <text class="title">我的发布</text>
    </view>

    <scroll-view class="post-list" scroll-y>
      <view v-for="post in posts" :key="post.id" class="post-card">
        <view class="post-content">{{ post.content }}</view>
        <view class="post-time">{{ post.time }}</view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const posts = ref([
  { id: 1, content: '今天天气真好，图书馆学习一整天！', time: '2小时前' },
  { id: 2, content: '分享一些学习资料', time: '1天前' },
  { id: 3, content: '周末组织篮球赛', time: '3天前' }
])
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.my-posts-page {
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

.post-list {
  height: calc(100vh - 88rpx);
  padding: 24rpx;
}

.post-card {
  margin-bottom: 24rpx;
  padding: 32rpx;
  background: #ffffff;
  border-radius: 16rpx;
}

.post-content {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.post-time {
  font-size: 24rpx;
  color: #999;
}
</style>
