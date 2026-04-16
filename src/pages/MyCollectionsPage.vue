<template>
  <view class="my-collections-page">
    <view class="header">
      <view class="icon-btn" @tap="handleBack">
        <ChevronLeft :size="24" />
      </view>
      <view class="title">我的收藏</view>
      <view class="icon-btn"></view>
    </view>

    <view class="collection-list">
      <view v-for="item in collections" :key="item.id" class="collection-item" @tap="handleItemClick(item)">
        <image :src="item.cover" :alt="item.title" class="item-cover" />
        <view class="item-info">
          <view class="item-title">{{ item.title }}</view>
          <view class="item-time">{{ item.time }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'


const collections = ref([
  { id: 1, type: 'post', title: '精彩的动态内容...', cover: 'https://picsum.photos/100/100?random=1', time: '收藏于 2小时前' },
  { id: 2, type: 'resource', title: '学习资料合集', cover: 'https://picsum.photos/100/100?random=2', time: '收藏于 1天前' }
])

const handleBack = () => uni.navigateBack()
const handleItemClick = (item: any) => {
  if (item.type === 'post') {
    uni.navigateTo({ url: `/post/${item.id}`)
  } else {
    uni.navigateTo({ url: `/resource/${item.id}`)
  }
}
</script>

<style scoped>
.my-collections-page {
  min-height: 100vh;
  background: var(--color-bg-page);
}

.header {
  position: sticky;
  top: 0;
  height: 44px;
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
  width: 24px;
  height: 24px;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.collection-list {
  padding: var(--spacing-sm) var(--page-padding);
}

.collection-item {
  display: flex;
  
  padding: var(--spacing-md);
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
  cursor: pointer;
}

.item-cover {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  object-fit: cover;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-title {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.item-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}
</style>
