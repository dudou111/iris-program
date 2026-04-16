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
    })
    return
  }

  uni.showToast({
    title: '发布成功',
    icon: 'success'
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
.publish-page {
  min-height: 100vh;
  background: #ffffff;
}

.header {
  height: 44px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e5e5;
}

.cancel-btn,
.publish-btn {
  font-size: 16px;
  color: #1890ff;
}

.title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.content {
  padding: 16px;
}

.textarea {
  width: 100%;
  min-height: 200px;
  font-size: 16px;
  line-height: 1.6;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  
  margin-top: 16px;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
}

.image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.delete-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: #ff4d4f;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.add-image {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon {
  font-size: 32px;
  color: #999;
}

.topic-selector {
  margin-top: 24px;
  display: flex;
  align-items: center;
}

.label {
  font-size: 15px;
  color: #666;
  margin-right: 8px;
}

.picker {
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 16px;
  font-size: 14px;
  color: #333;
}
</style>
