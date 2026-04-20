<template>
  <view class="publish-page">
    <view class="header">
      <text class="cancel-btn" @tap="handleCancel">取消</text>
      <text class="title">发布动态</text>
      <text class="publish-btn" @tap="handlePublish">发布</text>
    </view>

    <view class="content">
      <textarea
        class="textarea"
        placeholder="分享你的校园生活..."
        v-model="content"
        maxlength="500"
      />

      <view class="image-list">
        <view v-for="(image, index) in images" :key="index" class="image-item">
          <image :src="image" class="image" mode="aspectFill" />
          <view class="delete-btn" @tap="deleteImage(index)">×</view>
        </view>
        <view v-if="images.length < 9" class="add-image" @tap="chooseImage">
          <text class="add-icon">+</text>
        </view>
      </view>

      <view class="topic-selector">
        <text class="label">选择话题：</text>
        <picker mode="selector" :range="topics" range-key="name" @change="onTopicChange">
          <view class="picker">
            {{ selectedTopic.name }}
          </view>
        </picker>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const content = ref('')
const images = ref<string[]>([])

const topics = ref([
  { id: 'study', name: '学习' },
  { id: 'life', name: '生活' },
  { id: 'activity', name: '活动' },
  { id: 'confession', name: '表白墙' }
])

const selectedTopic = ref(topics.value[0])

const handleCancel = () => {
  uni.navigateBack()
}

const handlePublish = () => {
  if (!content.value.trim()) {
    uni.showToast({
      title: '请输入内容',
      icon: 'none'
    ,
      duration: 2000
    })
    return
  }

  uni.showToast({
    title: '发布成功',
    icon: 'success'
  ,
      duration: 2000
    })

  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}

const chooseImage = () => {
  uni.chooseImage({
    count: 9 - images.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      images.value = [...images.value, ...res.tempFilePaths]
    }
  })
}

const deleteImage = (index: number) => {
  images.value.splice(index, 1)
}

const onTopicChange = (e: any) => {
  selectedTopic.value = topics.value[e.detail.value]
}
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.publish-page {
  min-height: 100vh;
  background: #ffffff;
}

.header {
  height: 88rpx;
  padding: 0 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2rpx solid #e5e5e5;
}

.cancel-btn,
.publish-btn {
  font-size: 32rpx;
  color: #1890ff;
}

.title {
  font-size: 36rpx;
  font-weight: 500;
  color: #333;
}

.content {
  padding: 32rpx;
}

.textarea {
  width: 100%;
  min-height: 400rpx;
  font-size: 32rpx;
  line-height: 1.6;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  
  margin-top: 32rpx;
}

.image-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
}

.image {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
}

.delete-btn {
  position: absolute;
  top: -16rpx;
  right: -16rpx;
  width: 48rpx;
  height: 48rpx;
  background: #ff4d4f;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.add-image {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #d9d9d9;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon {
  font-size: 64rpx;
  color: #999;
}

.topic-selector {
  margin-top: 48rpx;
  display: flex;
  align-items: center;
}

.label {
  font-size: 30rpx;
  color: #666;
  margin-right: 16rpx;
}

.picker {
  padding: 16rpx 32rpx;
  background: #f5f5f5;
  border-radius: 32rpx;
  font-size: 28rpx;
  color: #333;
}
</style>
