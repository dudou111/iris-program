<template>
  <view class="chat-page">
    <view class="header">
      <view class="icon-btn" @tap="handleBack">
        <text>‹</text>
      </view>
      <view class="chat-user">
        <image :src="chatUser.avatar" class="chat-user-avatar" mode="aspectFill" />
        <text class="chat-user-name">{{ chatUser.username }}</text>
      </view>
      <view class="icon-btn" @tap="handleMore">
        <text>⋯</text>
      </view>
    </view>

    <scroll-view class="message-list" scroll-y :scroll-into-view="scrollIntoView">
      <view v-for="message in messages" :key="message.id" :id="'msg-' + message.id" class="message-item" :class="{ self: message.isSelf }">
        <image v-if="!message.isSelf" :src="chatUser.avatar" class="message-avatar" mode="aspectFill" />
        <view class="message-content">
          <view class="message-bubble">{{ message.content }}</view>
          <view class="message-time">{{ message.time }}</view>
        </view>
        <image v-if="message.isSelf" :src="currentUser.avatar" class="message-avatar" mode="aspectFill" />
      </view>
    </scroll-view>

    <view class="input-bar">
      <view class="icon-btn" @tap="handleEmoji">
        <text>😊</text>
      </view>
      <input
        v-model="inputText"
        type="text"
        placeholder="说点什么..."
        class="message-input"
        confirm-type="send"
        @confirm="handleSend"
      /
            :adjust-position="true"
            :hold-keyboard="false"
            :cursor-spacing="50"
            placeholder-style="color: #999;"
          >
      <view class="icon-btn" @tap="handleImage">
        <text>🖼️</text>
      </view>
      <view class="btn-send" :class="{ disabled: !inputText.trim() }" @tap="handleSend">
        发送
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const inputText = ref('')
const scrollIntoView = ref('')

const currentUser = {
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Me',
  username: '我'
}

const chatUser = ref({
  id: 1,
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User1',
  username: '张同学'
})

const messages = ref([
  {
    id: 1,
    content: '你好，在吗？',
    time: '10:30',
    isSelf: false
  },
  {
    id: 2,
    content: '在的，有什么事吗？',
    time: '10:31',
    isSelf: true
  },
  {
    id: 3,
    content: '想问一下你上次分享的学习资料还有吗？',
    time: '10:32',
    isSelf: false
  },
  {
    id: 4,
    content: '有的，我待会发给你',
    time: '10:33',
    isSelf: true
  }
])

const handleBack = () => {
  uni.navigateBack()
}

const handleMore = () => {
  uni.showActionSheet({
    itemList: ['查看资料', '清空聊天记录'],
    success: (res) => {
      console.log('选择了：', res.tapIndex)
    }
  })
}

const handleEmoji = () => {
  uni.showToast({ title: '表情功能开发中', icon: 'none' ,
      duration: 2000
    })
}

const handleImage = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      console.log('选择了图片：', res.tempFilePaths)
    }
  })
}

const handleSend = () => {
  if (!inputText.value.trim()) return

  const newMessage = {
    id: messages.value.length + 1,
    content: inputText.value,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isSelf: true
  }

  messages.value.push(newMessage)
  inputText.value = ''

  // 滚动到底部
  setTimeout(() => {
    scrollIntoView.value = 'msg-' + newMessage.id
  }, 100)
}
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
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
  flex-shrink: 0;
}

.chat-user {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.chat-user-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
}

.chat-user-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
}

.icon-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #666;
  flex-shrink: 0;
}

.message-list {
  flex: 1;
  padding: 32rpx;
}

.message-item {
  display: flex;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.message-item.self {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
}

.message-item.self .message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-bubble {
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  line-height: 1.5;
  background: #ffffff;
  border-radius: 16rpx;
  word-wrap: break-word;
}

.message-item.self .message-bubble {
  background: #1890ff;
  color: #ffffff;
}

.message-time {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #999;
}

.input-bar {
  height: 120rpx;
  padding: 16rpx 32rpx;
  background: #ffffff;
  border-top: 2rpx solid #e5e5e5;
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-shrink: 0;
}

.message-input {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  background: #f5f5f5;
  border: none;
  border-radius: 36rpx;
}

.btn-send {
  padding: 0 32rpx;
  height: 72rpx;
  line-height: 72rpx;
  font-size: 28rpx;
  color: #ffffff;
  background: #1890ff;
  border-radius: 36rpx;
}

.btn-send.disabled {
  opacity: 0.5;
}
</style>
