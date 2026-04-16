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
.my-collections-page {
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

.collection-list {
  height: calc(100vh - 44px);
  padding: 12px;
}

.collection-card {
  margin-bottom: 12px;
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
}

.collection-content {
  font-size: 15px;
  color: #333;
  margin-bottom: 8px;
}

.collection-time {
  font-size: 12px;
  color: #999;
}
</style>
