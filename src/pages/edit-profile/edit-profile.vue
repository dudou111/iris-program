<template>
  <view class="edit-profile-page">
    <view class="header">
      <text class="title">编辑资料</text>
    </view>

    <view class="form-list">
      <view class="form-item">
        <text class="form-label">头像</text>
        <image src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" class="avatar" mode="aspectFill" />
        <text class="form-arrow">›</text>
      </view>

      <view class="form-item">
        <text class="form-label">昵称</text>
        <input class="form-input" placeholder="请输入昵称" value="用户昵称" />
      </view>

      <view class="form-item">
        <text class="form-label">性别</text>
        <text class="form-value">男</text>
        <text class="form-arrow">›</text>
      </view>

      <view class="form-item">
        <text class="form-label">个性签名</text>
        <input class="form-input" placeholder="请输入个性签名" />
      </view>
    </view>

    <view class="save-btn" @tap="handleSave">保存</view>
  </view>
</template>

<script setup lang="ts">
const handleSave = () => {
  uni.showToast({
    title: '保存成功',
    icon: 'success'
  })
}
</script>

<style scoped>
.edit-profile-page {
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

.form-list {
  margin-top: 12px;
  background: #ffffff;
}

.form-item {
  padding: 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  width: 80px;
  font-size: 15px;
  color: #333;
}

.form-input {
  flex: 1;
  font-size: 15px;
  color: #333;
  text-align: right;
}

.form-value {
  flex: 1;
  font-size: 15px;
  color: #666;
  text-align: right;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-left: auto;
  margin-right: 8px;
}

.form-arrow {
  font-size: 24px;
  color: #ccc;
}

.save-btn {
  margin: 24px 16px;
  padding: 12px;
  font-size: 16px;
  color: #ffffff;
  background: #1890ff;
  border-radius: 8px;
  text-align: center;
}
</style>
