<template>
  <view class="edit-profile-page">
    <view class="header">
      <text class="title">编辑资料</text>
    </view>

    <view class="form-list">
      <view class="form-item clickable" @tap="handleChooseAvatar">
        <text class="form-label">头像</text>
        <image :src="form.avatar || defaultAvatar" class="avatar" mode="aspectFill" />
        <text class="form-arrow">›</text>
      </view>

      <view class="form-item">
        <text class="form-label">昵称</text>
        <input
          v-model="form.nickname"
          class="form-input"
          placeholder="请输入昵称"
          maxlength="20"
          :adjust-position="true"
          :hold-keyboard="false"
          :cursor-spacing="50"
          placeholder-style="color: #999;"
        />
      </view>

      <view class="form-item textarea-item">
        <text class="form-label">个性签名</text>
        <textarea
          v-model="form.bio"
          class="form-textarea"
          placeholder="介绍一下自己吧"
          maxlength="200"
          auto-height
          placeholder-style="color: #999;"
        />
      </view>

      <view class="form-item">
        <text class="form-label">学校</text>
        <input v-model="form.school" class="form-input" placeholder="请输入学校" placeholder-style="color: #999;" />
      </view>

      <view class="form-item">
        <text class="form-label">学院</text>
        <input v-model="form.college" class="form-input" placeholder="请输入学院" placeholder-style="color: #999;" />
      </view>

      <view class="form-item">
        <text class="form-label">专业</text>
        <input v-model="form.major" class="form-input" placeholder="请输入专业" placeholder-style="color: #999;" />
      </view>

      <view class="form-item">
        <text class="form-label">年级</text>
        <input v-model="form.grade" class="form-input" placeholder="请输入年级" placeholder-style="color: #999;" />
      </view>
    </view>

    <view class="save-btn" :class="{ disabled: loading }" @tap="handleSave">
      {{ loading ? '保存中...' : '保存' }}
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { getCurrentUser, updateUser, type UpdateUserDto } from '@/api/users'
import { createDefaultAvatar, resolveMediaUrl, uploadImage } from '@/utils/media'
import { getToken } from '@/utils/request'

interface UploadResult {
  url: string
}

const loading = ref(false)
const form = reactive<Required<UpdateUserDto>>({
  nickname: '',
  avatar: '',
  bio: '',
  school: '',
  college: '',
  major: '',
  grade: ''
})

const defaultAvatar = computed(() => createDefaultAvatar(form.nickname || 'user'))

const requireLogin = () => {
  if (getToken()) {
    return true
  }

  uni.reLaunch({
    url: '/pages/login/login'
  })
  return false
}

const fillForm = async () => {
  if (!requireLogin()) return

  loading.value = true
  try {
    const user = await getCurrentUser()
    form.nickname = user.nickname || ''
    form.avatar = resolveMediaUrl(user.avatar) || ''
    form.bio = user.bio || ''
    form.school = user.school || ''
    form.college = user.college || ''
    form.major = user.major || ''
    form.grade = user.grade || ''
  } catch (error) {
    console.error('加载用户资料失败:', error)
    uni.showToast({
      title: '加载资料失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const handleChooseAvatar = async () => {
  if (!requireLogin() || loading.value) return

  try {
    const chooseResult = await uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })

    const filePath = chooseResult.tempFilePaths?.[0]
    if (!filePath) {
      return
    }

    loading.value = true
    const uploaded = (await uploadImage(filePath, '/upload/image')) as UploadResult
    form.avatar = resolveMediaUrl(uploaded.url) || form.avatar
    uni.showToast({
      title: '头像上传成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('上传头像失败:', error)
    uni.showToast({
      title: '上传头像失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const buildPayload = (): UpdateUserDto => ({
  nickname: form.nickname.trim(),
  avatar: form.avatar.trim(),
  bio: form.bio.trim(),
  school: form.school.trim(),
  college: form.college.trim(),
  major: form.major.trim(),
  grade: form.grade.trim()
})

const handleSave = async () => {
  if (!requireLogin() || loading.value) return

  if (!form.nickname.trim()) {
    uni.showToast({
      title: '昵称不能为空',
      icon: 'none'
    })
    return
  }

  loading.value = true
  try {
    const updatedUser = await updateUser(buildPayload())
    uni.setStorageSync('userInfo', updatedUser)
    uni.$emit('user:updated', updatedUser)
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 300)
  } catch (error) {
    console.error('保存资料失败:', error)
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

onMounted(fillForm)
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.edit-profile-page {
  min-height: 100vh;
  background: #f8f8f8;
}

.header {
  height: 88rpx;
  padding: 0 32rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  border-bottom: 2rpx solid #e5e5e5;
}

.title {
  font-size: 36rpx;
  font-weight: 500;
  color: #333;
}

.form-list {
  margin-top: 24rpx;
  background: #ffffff;
}

.form-item {
  padding: 32rpx;
  display: flex;
  align-items: center;
  border-bottom: 2rpx solid #f0f0f0;
}

.form-item.clickable {
  cursor: pointer;
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  width: 160rpx;
  font-size: 30rpx;
  color: #333;
}

.form-input {
  flex: 1;
  font-size: 30rpx;
  color: #333;
  text-align: right;
}

.textarea-item {
  align-items: flex-start;
}

.form-textarea {
  flex: 1;
  min-height: 144rpx;
  font-size: 30rpx;
  color: #333;
  text-align: left;
}

.form-value {
  flex: 1;
  font-size: 30rpx;
  color: #666;
  text-align: right;
}

.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  margin-left: auto;
  margin-right: 16rpx;
}

.form-arrow {
  font-size: 48rpx;
  color: #ccc;
}

.save-btn {
  margin: 48rpx 32rpx;
  padding: 24rpx;
  font-size: 32rpx;
  color: #ffffff;
  background: #1890ff;
  border-radius: 16rpx;
  text-align: center;
}

.save-btn.disabled {
  opacity: 0.6;
}
</style>
