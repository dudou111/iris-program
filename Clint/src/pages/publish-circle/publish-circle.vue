<template>
  <view class="publish-circle-page">
    <view class="header">
      <text class="cancel-btn" @tap="handleCancel">取消</text>
      <text class="title">创建圈子</text>
      <text class="publish-btn" @tap="handlePublish">创建</text>
    </view>

    <view class="content">
      <view class="form-item">
        <text class="label">圈子名称</text>
        <input
          class="input"
          placeholder="请输入圈子名称"
          v-model="formData.name"
          maxlength="50"
        />
      </view>

      <view class="form-item">
        <text class="label">圈子简介</text>
        <textarea
          class="textarea"
          placeholder="介绍一下这个圈子..."
          v-model="formData.description"
          maxlength="500"
        />
      </view>

      <view class="form-item">
        <text class="label">圈子封面</text>
        <view class="image-upload">
          <image v-if="formData.cover" :src="formData.cover" class="cover-image" mode="aspectFill" />
          <view v-else class="upload-btn" @tap="chooseCover">
            <text class="upload-icon">+</text>
            <text class="upload-text">上传封面</text>
          </view>
          <view v-if="formData.cover" class="delete-btn" @tap="deleteCover">×</view>
        </view>
      </view>

      <view class="form-item">
        <text class="label">圈子类型</text>
        <picker mode="selector" :range="types" range-key="name" @change="onTypeChange">
          <view class="picker">
            {{ selectedType.name }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">圈子分类</text>
        <picker mode="selector" :range="categories" range-key="name" @change="onCategoryChange">
          <view class="picker">
            {{ selectedCategory.name }}
          </view>
        </picker>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { createCircle } from '@/api/circles'
import { uploadImage } from '@/api/upload'

const formData = ref({
  name: '',
  description: '',
  cover: '',
  type: 'public',
  category: 'study'
})

const submitting = ref(false)

const types = ref([
  { id: 'public', name: '公开' },
  { id: 'private', name: '私密' }
])

const categories = ref([
  { id: 'study', name: '学习' },
  { id: 'sports', name: '运动' },
  { id: 'art', name: '艺术' },
  { id: 'tech', name: '科技' },
  { id: 'other', name: '其他' }
])

const selectedType = ref(types.value[0])
const selectedCategory = ref(categories.value[0])

const handleCancel = () => {
  uni.navigateBack()
}

const handlePublish = async () => {
  if (!formData.value.name.trim() || submitting.value) {
    uni.showToast({
      title: '请输入圈子名称',
      icon: 'none'
    })
    return
  }

  submitting.value = true

  try {
    let coverUrl = ''
    if (formData.value.cover) {
      const uploaded = await uploadImage(formData.value.cover)
      coverUrl = uploaded.url
    }

    await createCircle({
      name: formData.value.name.trim(),
      description: formData.value.description.trim(),
      cover: coverUrl,
      type: formData.value.type,
      category: formData.value.category
    })

    uni.showToast({
      title: '创建成功',
      icon: 'success',
      duration: 2000
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 1200)
  } catch (error) {
    console.error('创建圈子失败:', error)
    uni.showToast({
      title: '创建失败',
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
}

const chooseCover = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      formData.value.cover = res.tempFilePaths[0]
    }
  })
}

const deleteCover = () => {
  formData.value.cover = ''
}

const onTypeChange = (e: any) => {
  selectedType.value = types.value[e.detail.value]
  formData.value.type = selectedType.value.id
}

const onCategoryChange = (e: any) => {
  selectedCategory.value = categories.value[e.detail.value]
  formData.value.category = selectedCategory.value.id
}
</script>

<style scoped>
.publish-circle-page {
  min-height: 100vh;
  background: #f8f8f8;
}

.header {
  height: 88rpx;
  padding: 0 32rpx;
  background: #ffffff;
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

.form-item {
  margin-bottom: 48rpx;
}

.label {
  display: block;
  font-size: 30rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  font-size: 30rpx;
}

.textarea {
  width: 100%;
  min-height: 240rpx;
  padding: 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  font-size: 30rpx;
  line-height: 1.6;
}

.image-upload {
  position: relative;
  width: 100%;
  height: 360rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.upload-btn {
  width: 100%;
  height: 100%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #d9d9d9;
  border-radius: 16rpx;
}

.upload-icon {
  font-size: 64rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.upload-text {
  font-size: 28rpx;
  color: #999;
}

.delete-btn {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 56rpx;
  height: 56rpx;
  background: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
}

.picker {
  height: 88rpx;
  padding: 0 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  font-size: 30rpx;
  color: #333;
}
</style>
