<template>
  <view class="resource-page">
    <view class="header">
      <text class="title">学习资源</text>
    </view>

    <scroll-view class="resource-list" scroll-y>
      <view v-for="resource in resources" :key="resource.id" class="resource-card" @tap="goToResourceDetail(resource.id)">
        <view class="resource-icon">📚</view>
        <view class="resource-info">
          <view class="resource-name">{{ resource.name }}</view>
          <view class="resource-desc">{{ resource.description }}</view>
          <view class="resource-meta">
            <text>{{ resource.downloads }} 下载</text>
            <text>{{ resource.size }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 自定义 TabBar -->
    <custom-tab-bar />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CustomTabBar from '@/components/custom-tab-bar/custom-tab-bar.vue'

const resources = ref([
  {
    id: 1,
    name: '高等数学复习资料',
    description: '期末考试重点整理',
    downloads: 234,
    size: '2.5MB'
  },
  {
    id: 2,
    name: '英语四级词汇表',
    description: '核心词汇3000个',
    downloads: 567,
    size: '1.2MB'
  },
  {
    id: 3,
    name: '计算机网络课件',
    description: '完整PPT课件',
    downloads: 123,
    size: '5.8MB'
  }
])

const goToResourceDetail = (id: number) => {
  uni.navigateTo({
    url: `/pages/resource-detail/resource-detail?id=${id}`
  })
}
</script>

<style scoped>
.resource-page {
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

.resource-list {
  height: calc(100vh - 44px);
  padding: 12px;
}

.resource-card {
  margin-bottom: 12px;
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  display: flex;
  align-items: center;
}

.resource-icon {
  width: 48px;
  height: 48px;
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.resource-info {
  flex: 1;
}

.resource-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.resource-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.resource-meta {
  display: flex;
  
  font-size: 12px;
  color: #999;
}
</style>
