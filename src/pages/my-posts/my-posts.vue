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
.my-posts-page {
  min-height: 100vh;
  background: #f8f8f8;
}

.header {
  height: 44px;
  padding: 0 16px;
  background: #ffffff;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e5e5e5;
}

.title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.post-list {
  height: calc(100vh - 44px);
  padding: 12px;
}

.post-card {
  margin-bottom: 12px;
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
}

.post-content {
  font-size: 15px;
  color: #333;
  margin-bottom: 8px;
}

.post-time {
  font-size: 12px;
  color: #999;
}
</style>
