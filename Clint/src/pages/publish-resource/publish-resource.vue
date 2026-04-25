<template>
  <view class="publish-resource-page">
    <view class="header">
      <text class="cancel-btn" @tap="handleCancel">取消</text>
      <text class="title">发布资源</text>
      <text class="publish-btn" @tap="handlePublish">发布</text>
    </view>

    <view class="content">
      <view class="form-item">
        <text class="label">资源标题</text>
        <input
          class="input"
          placeholder="请输入资源标题"
          v-model="formData.title"
          maxlength="100"
        />
      </view>

      <view class="form-item">
        <text class="label">资源描述</text>
        <textarea
          class="textarea"
          placeholder="详细描述资源内容..."
          v-model="formData.description"
          maxlength="2000"
        />
      </view>

      <view class="form-item">
        <text class="label">资源图片</text>
        <view class="image-list">
          <view v-for="(image, index) in formData.images" :key="index" class="image-item">
            <image :src="image" class="image" mode="aspectFill" />
            <view class="delete-btn" @tap="deleteImage(index)">×</view>
          </view>
          <view v-if="formData.images.length < 9" class="add-image" @tap="chooseImage">
            <text class="add-icon">+</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="label">资源分类</text>
        <picker mode="selector" :range="categories" range-key="name" @change="onCategoryChange">
          <view class="picker">
            {{ selectedCategory.name }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">价格（可选）</text>
        <input
          class="input"
          type="digit"
          placeholder="免费可不填"
          v-model="formData.price"
        />
      </view>

      <view class="form-item">
        <text class="label">位置（可选）</text>
        <input
          class="input"
          placeholder="请输入位置信息"
          v-model="formData.location"
          maxlength="100"
        />
      </view>

      <view class="form-item">
        <text class="label">联系方式（可选）</text>
        <input
          class="input"
          placeholder="请输入联系方式"
          v-model="formData.contact"
          maxlength="50"
        />
      </view>

      <view class="form-item">
        <text class="label">标签（可选）</text>
        <view class="tags-input">
          <view v-for="(tag, index) in formData.tags" :key="index" class="tag">
            {{ tag }}
            <text class="tag-delete" @tap="deleteTag(index)">×</text>
          </view>
          <input
            v-if="formData.tags.length < 5"
            class="tag-input"
            placeholder="添加标签"
            v-model="newTag"
            @confirm="addTag"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { createResource } from '@/api/resources'
import { uploadPostImages } from '@/api/upload'

const formData = ref({
  title: '',
  description: '',
  images: [] as string[],
  category: 'secondhand',
  price: '',
  location: '',
  contact: '',
  tags: [] as string[]
})

const submitting = ref(false)
const newTag = ref('')

const categories = ref([
  { id: 'secondhand', name: '二手交易' },
  { id: 'study', name: '学习资料' },
  { id: 'lost', name: '失物招领' },
  { id: 'found', name: '拾物认领' },
  { id: 'other', name: '其他' }
])

const selectedCategory = ref(categories.value[0])

const handleCancel = () => {
  uni.navigateBack()
}

const handlePublish = async () => {
  if (!formData.value.title.trim() || submitting.value) {
    uni.showToast({
      title: '请输入资源标题',
      icon: 'none'
    })
    return
  }

  submitting.value = true

  try {
    const uploaded = formData.value.images.length ? await uploadPostImages(formData.value.images) : []

    await createResource({
      title: formData.value.title.trim(),
      description: formData.value.description.trim(),
      images: uploaded.map((item) => item.url),
      category: formData.value.category,
      price: formData.value.price ? parseFloat(formData.value.price) : undefined,
      location: formData.value.location.trim() || undefined,
      contact: formData.value.contact.trim() || undefined,
      tags: formData.value.tags.length > 0 ? formData.value.tags : undefined
    })

    uni.showToast({
      title: '发布成功',
      icon: 'success',
      duration: 2000
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 1200)
  } catch (error) {
    console.error('发布资源失败:', error)
    uni.showToast({
      title: '发布失败',
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
}

const chooseImage = () => {
  uni.chooseImage({
    count: 9 - formData.value.images.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      formData.value.images = [...formData.value.images, ...res.tempFilePaths]
    }
  })
}

const deleteImage = (index: number) => {
  formData.value.images.splice(index, 1)
}

const onCategoryChange = (e: any) => {
  selectedCategory.value = categories.value[e.detail.value]
  formData.value.category = selectedCategory.value.id
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && formData.value.tags.length < 5 && !formData.value.tags.includes(tag)) {
    formData.value.tags.push(tag)
    newTag.value = ''
  }
}

const deleteTag = (index: number) => {
  formData.value.tags.splice(index, 1)
}
</script>

<style scoped>
.publish-resource-page {
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

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
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

.tags-input {
  min-height: 88rpx;
  padding: 16rpx 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16rpx;
}

.tag {
  height: 56rpx;
  padding: 0 24rpx;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  font-size: 26rpx;
}

.tag-delete {
  margin-left: 8rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.tag-input {
  flex: 1;
  min-width: 200rpx;
  height: 56rpx;
  font-size: 28rpx;
}
</style>
