<template>
  <view class="login-page">
    <view class="login-container">
      <view class="logo">🌸</view>
      <view class="app-name">Iris Program</view>
      <view class="app-desc">校园社交平台</view>

      <view class="form">
        <view class="input-group">
          <input class="input" placeholder="请输入手机号" type="number" />
        </view>
        <view class="input-group">
          <input class="input" placeholder="请输入密码" type="password" />
        </view>
      </view>

      <view class="login-btn" @tap="handleLogin">登录</view>
      <view class="register-link">还没有账号？立即注册</view>
    </view>
  </view>
</template>

<script setup lang="ts">
const handleLogin = () => {
  uni.showToast({
    title: '登录成功',
    icon: 'success'
  })
  setTimeout(() => {
    uni.switchTab({
      url: '/pages/home/home'
    })
  }, 1500)
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  width: 80%;
  padding: 40px 24px;
  background: #ffffff;
  border-radius: 16px;
  text-align: center;
}

.logo {
  font-size: 64px;
  margin-bottom: 16px;
}

.app-name {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.app-desc {
  font-size: 14px;
  color: #999;
  margin-bottom: 32px;
}

.form {
  margin-bottom: 24px;
}

.input-group {
  margin-bottom: 16px;
}

.input {
  width: 100%;
  padding: 12px 16px;
  font-size: 15px;
  background: #f5f5f5;
  border-radius: 8px;
  box-sizing: border-box;
}

.login-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  margin-bottom: 16px;
}

.register-link {
  font-size: 14px;
  color: #667eea;
}
</style>
