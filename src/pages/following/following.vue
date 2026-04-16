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
.following-page {
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

.user-list {
  height: calc(100vh - 44px);
  padding: 12px;
}

.user-card {
  margin-bottom: 12px;
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.user-desc {
  font-size: 13px;
  color: #999;
}

.follow-btn {
  padding: 6px 16px;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>
