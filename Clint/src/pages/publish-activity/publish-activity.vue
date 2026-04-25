<template>
  <view class="publish-activity-page">
    <view class="header">
      <text class="cancel-btn" @tap="handleCancel">取消</text>
      <text class="title">发布活动</text>
      <text class="publish-btn" @tap="handlePublish">发布</text>
    </view>

    <view class="content">
      <view class="form-item">
        <text class="label">活动标题</text>
        <input
          class="input"
          placeholder="请输入活动标题"
          v-model="formData.title"
          maxlength="100"
        />
      </view>

      <view class="form-item">
        <text class="label">活动描述</text>
        <textarea
          class="textarea"
          placeholder="详细描述活动内容..."
          v-model="formData.description"
          maxlength="2000"
        />
      </view>

      <view class="form-item">
        <text class="label">活动图片</text>
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
        <text class="label">活动分类</text>
        <picker mode="selector" :range="categories" range-key="name" @change="onCategoryChange">
          <view class="picker">
            {{ selectedCategory.name }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">活动地点</text>
        <input
          class="input"
          placeholder="请输入活动地点"
          v-model="formData.location"
          maxlength="100"
        />
      </view>

      <view class="form-item">
        <text class="label">开始时间</text>
        <picker mode="multiSelector" :range="dateTimeRange" @change="onStartTimeChange" @columnchange="onStartColumnChange">
          <view class="picker">
            {{ formData.startTime || '请选择开始时间' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">结束时间</text>
        <picker mode="multiSelector" :range="dateTimeRange" @change="onEndTimeChange" @columnchange="onEndColumnChange">
          <view class="picker">
            {{ formData.endTime || '请选择结束时间' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">最大参与人数（可选）</text>
        <input
          class="input"
          type="number"
          placeholder="不限制人数可不填"
          v-model="formData.maxParticipants"
        />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { createActivity } from '@/api/activities'
import { uploadPostImages } from '@/api/upload'

const formData = ref({
  title: '',
  description: '',
  images: [] as string[],
  category: 'lecture',
  location: '',
  startTime: '',
  endTime: '',
  maxParticipants: ''
})

const submitting = ref(false)

const categories = ref([
  { id: 'lecture', name: '讲座' },
  { id: 'competition', name: '比赛' },
  { id: 'party', name: '聚会' },
  { id: 'sports', name: '运动' },
  { id: 'other', name: '其他' }
])

const selectedCategory = ref(categories.value[0])

// 生成日期时间选择器数据
const generateDateTimeRange = () => {
  const dates: string[] = []
  const hours: string[] = []
  const minutes: string[] = []

  // 生成未来30天的日期
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    dates.push(`${date.getMonth() + 1}月${date.getDate()}日`)
  }

  // 生成小时
  for (let i = 0; i < 24; i++) {
    hours.push(`${i.toString().padStart(2, '0')}时`)
  }

  // 生成分钟
  for (let i = 0; i < 60; i += 5) {
    minutes.push(`${i.toString().padStart(2, '0')}分`)
  }

  return [dates, hours, minutes]
}

const dateTimeRange = ref(generateDateTimeRange())
const startTimeIndex = ref([0, 0, 0])
const endTimeIndex = ref([0, 0, 0])

const handleCancel = () => {
  uni.navigateBack()
}

const handlePublish = async () => {
  if (!formData.value.title.trim() || submitting.value) {
    uni.showToast({
      title: '请输入活动标题',
      icon: 'none'
    })
    return
  }

  if (!formData.value.location.trim()) {
    uni.showToast({
      title: '请输入活动地点',
      icon: 'none'
    })
    return
  }

  if (!formData.value.startTime || !formData.value.endTime) {
    uni.showToast({
      title: '请选择活动时间',
      icon: 'none'
    })
    return
  }

  submitting.value = true

  try {
    const uploaded = formData.value.images.length ? await uploadPostImages(formData.value.images) : []

    const startDate = parseDateTime(formData.value.startTime)
    const endDate = parseDateTime(formData.value.endTime)

    console.log('发布活动数据:', {
      startTime: startDate,
      endTime: endDate,
      startTimeRaw: formData.value.startTime,
      endTimeRaw: formData.value.endTime
    })

    await createActivity({
      title: formData.value.title.trim(),
      description: formData.value.description.trim(),
      images: uploaded.map((item) => item.url),
      category: formData.value.category,
      location: formData.value.location.trim(),
      startTime: startDate,
      endTime: endDate,
      maxParticipants: formData.value.maxParticipants ? parseInt(formData.value.maxParticipants) : undefined
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
    console.error('发布活动失败:', error)
    uni.showToast({
      title: '发布失败',
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
}

const parseDateTime = (timeStr: string) => {
  const match = timeStr.match(/(\d+)月(\d+)日 (\d+)时(\d+)分/)
  if (!match) return new Date().toISOString()

  const now = new Date()
  const year = now.getFullYear()
  const month = parseInt(match[1]) - 1
  const day = parseInt(match[2])
  const hour = parseInt(match[3])
  const minute = parseInt(match[4])

  const date = new Date(year, month, day, hour, minute)
  return date.toISOString()
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

const onStartTimeChange = (e: any) => {
  const val = e.detail.value
  startTimeIndex.value = val
  const dateStr = dateTimeRange.value[0][val[0]]
  const hourStr = dateTimeRange.value[1][val[1]]
  const minuteStr = dateTimeRange.value[2][val[2]]
  formData.value.startTime = `${dateStr} ${hourStr}${minuteStr}`
}

const onEndTimeChange = (e: any) => {
  const val = e.detail.value
  endTimeIndex.value = val
  const dateStr = dateTimeRange.value[0][val[0]]
  const hourStr = dateTimeRange.value[1][val[1]]
  const minuteStr = dateTimeRange.value[2][val[2]]
  formData.value.endTime = `${dateStr} ${hourStr}${minuteStr}`
}

const onStartColumnChange = (e: any) => {
  // 处理列变化
}

const onEndColumnChange = (e: any) => {
  // 处理列变化
}
</script>

<style scoped>
.publish-activity-page {
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
</style>
