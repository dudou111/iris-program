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
        <input class="form-input" placeholder="请输入昵称" value="用户昵称" /
            :adjust-position="true"
            :hold-keyboard="false"
            :cursor-spacing="50"
            placeholder-style="color: #999;"
          >
      </view>

      <view class="form-item">
        <text class="form-label">性别</text>
        <text class="form-value">男</text>
        <text class="form-arrow">›</text>
      </view>

      <view class="form-item">
        <text class="form-label">个性签名</text>
        <input class="form-input" placeholder="请输入个性签名" /
            :adjust-position="true"
            :hold-keyboard="false"
            :cursor-spacing="50"
            placeholder-style="color: #999;"
          >
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
  ,
      duration: 2000
    })
}
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
</style>
