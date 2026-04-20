<template>
  <view class="edit-profile-page">
    <view class="header">
      <view class="icon-btn" @tap="handleBack">
        <ChevronLeft :size="24" />
      </view>
      <view class="title">编辑资料</view>
      <view class="save-btn" @tap="handleSave">保存</view>
    </view>

    <view class="form-section">
      <view class="form-item avatar-item">
        <span class="item-label">头像</span>
        <view class="item-value">
          <image :src="form.avatar" alt="头像" class="avatar-preview" />
          <ChevronRight :size="16" />
        </view>
      </view>

      <view class="form-item">
        <span class="item-label">昵称</span>
        <input v-model="form.username" type="text" class="item-input" /
            :adjust-position="true"
            :hold-keyboard="false"
            :cursor-spacing="50"
            placeholder-style="color: #999;"
          >
      </view>

      <view class="form-item">
        <span class="item-label">个性签名</span>
        <input v-model="form.bio" type="text" class="item-input" placeholder="介绍一下自己吧" /
            :adjust-position="true"
            :hold-keyboard="false"
            :cursor-spacing="50"
            placeholder-style="color: #999;"
          >
      </view>

      <view class="form-item">
        <span class="item-label">学校</span>
        <input v-model="form.school" type="text" class="item-input" /
            :adjust-position="true"
            :hold-keyboard="false"
            :cursor-spacing="50"
            placeholder-style="color: #999;"
          >
      </view>

      <view class="form-item">
        <span class="item-label">院系</span>
        <input v-model="form.department" type="text" class="item-input" /
            :adjust-position="true"
            :hold-keyboard="false"
            :cursor-spacing="50"
            placeholder-style="color: #999;"
          >
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'


const form = ref({
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
  username: '用户昵称',
  bio: '这是一段个性签名',
  school: '某某大学',
  department: '计算机学院'
})

const handleBack = () => uni.navigateBack()
const handleSave = () => {
  console.log('保存资料', form.value)
  uni.navigateBack()
}
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.edit-profile-page {
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

.save-btn {
  font-size: var(--font-size-base);
  color: var(--color-primary);
  cursor: pointer;
}

.form-section {
  background: var(--color-bg-white);
  margin-top: var(--spacing-sm);
}

.form-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-lg) var(--page-padding);
  border-bottom: var(--border-width-thin) solid var(--color-border-base);
}

.form-item:last-child {
  border-bottom: none;
}

.item-label {
  width: 160rpx;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  flex-shrink: 0;
}

.item-value {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  
  cursor: pointer;
}

.avatar-preview {
  width: 120rpx;
  height: 120rpx;
  border-radius: var(--radius-round);
}

.item-input {
  flex: 1;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  text-align: right;
  border: none;
  outline: none;
  background: transparent;
}

.item-input::placeholder {
  color: var(--color-text-tertiary);
}
</style>
