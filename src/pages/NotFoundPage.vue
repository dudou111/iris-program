<template>
  <view class="not-found-page">
    <view class="not-found-content">
      <view class="error-code">404</view>
      <view class="error-title">页面未找到</view>
      <view class="error-description">
        抱歉，您访问的页面不存在或已被删除
      </view>
      <view class="error-actions">
        <button class="btn-primary" @tap="handleGoHome">
          返回首页
        </button>
        <button class="btn-secondary" @tap="handleGoBack">
          返回上一页
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">


const handleGoHome = () => {
  uni.navigateTo({ url: '/home')
}

const handleGoBack = () => {
  uni.navigateBack()
}
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-page);
  padding: var(--page-padding);
}

.not-found-content {
  text-align: center;
  max-width: 800rpx;
}

.error-code {
  font-size: 240rpx;
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  line-height: 1;
  margin-bottom: var(--spacing-lg);
}

.error-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
}

.error-description {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-xl);
}

.error-actions {
  display: flex;
  flex-direction: column;
  
}

.btn-primary,
.btn-secondary {
  height: 88rpx;
  padding: 0 var(--spacing-xl);
  font-size: var(--font-size-base);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.btn-primary {
  color: var(--color-text-white);
  background: var(--color-primary);
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  color: var(--color-text-primary);
  background: var(--color-bg-white);
  border: var(--border-width-thin) solid var(--color-border-base);
}

.btn-secondary:hover {
  background: var(--color-bg-gray);
}
</style>
