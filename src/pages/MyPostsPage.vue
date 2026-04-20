<template>
  <view class="my-posts-page">
    <view class="header">
      <view class="icon-btn" @tap="handleBack">
        <ChevronLeft :size="24" />
      </view>
      <view class="title">我的发布</view>
      <view class="icon-btn"></view>
    </view>

    <view class="post-list">
      <view v-for="post in posts" :key="post.id" class="card-post" @tap="handlePostClick(post)">
        <view class="card-post-content">{{ post.content }}</view>
        <view class="card-post-footer">
          <span>{{ post.time }}</span>
          <view class="post-stats">
            <span><Heart :size="14" /> {{ post.likes }}</span>
            <span><MessageCircle :size="14" /> {{ post.comments }}</span>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'


const posts = ref([
  { id: 1, content: '今天天气真好，图书馆学习一整天！', time: '2小时前', likes: 45, comments: 12 },
  { id: 2, content: '分享学习笔记，希望对大家有帮助', time: '1天前', likes: 23, comments: 6 }
])

const handleBack = () => uni.navigateBack()
const handlePostClick = (post: any) => uni.navigateTo({ url: `/post/${post.id}`)
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.my-posts-page {
  min-height: 100vh;
  background: var(--color-bg-page);
}

.header {
  position: sticky;
  top: 0;
  height: 88rpx;
  padding: 0 var(--page-padding);
  background: var(--color-bg-white);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: var(--border-width-thin) solid var(--color-border-base);
  z-index: var(--z-index-sticky);
}

.title {
  flex: 1;
  text-align: center;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.icon-btn {
  width: 48rpx;
  height: 48rpx;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.post-list {
  padding: var(--spacing-sm) 0;
}

.card-post {
  background: var(--color-bg-white);
  padding: var(--spacing-lg) var(--page-padding);
  margin-bottom: var(--spacing-sm);
  cursor: pointer;
}

.card-post-content {
  font-size: var(--font-size-sm);
  line-height: 1.6;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
}

.card-post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.post-stats {
  display: flex;
  
}

.post-stats span {
  display: flex;
  align-items: center;
  
}
</style>
