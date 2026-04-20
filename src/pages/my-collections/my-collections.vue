<template>
  <view class="my-collections-page">
    <view class="header">
      <text class="title">我的收藏</text>
    </view>

    <scroll-view class="collection-list" scroll-y>
      <view v-for="item in collections" :key="item.id" class="collection-card">
        <view class="collection-content">{{ item.content }}</view>
        <view class="collection-time">{{ item.time }}</view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const collections = ref([
  { id: 1, content: '高等数学复习资料', time: '收藏于 2天前' },
  { id: 2, content: '英语四级词汇表', time: '收藏于 5天前' }
])
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.my-collections-page {
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

.collection-list {
  height: calc(100vh - 88rpx);
  padding: 24rpx;
}

.collection-card {
  margin-bottom: 24rpx;
  padding: 32rpx;
  background: #ffffff;
  border-radius: 16rpx;
}

.collection-content {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.collection-time {
  font-size: 24rpx;
  color: #999;
}
</style>
