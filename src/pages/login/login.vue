<template>
  <view class="login-page">
    <view class="login-container">
      <view class="logo">
        <image class="logo-image" src="/static/logo.png" mode="aspectFit" />
      </view>
      <view class="app-name">Iris Program</view>
      <view class="app-desc">校园社交平台</view>

      <view class="form">
        <view class="input-group">
          <input
            class="input"
            v-model="formData.username"
            placeholder="请输入账号"
            type="text"
            maxlength="20"
            :adjust-position="true"
            :hold-keyboard="false"
            :cursor-spacing="50"
            :confirm-hold="false"
            confirm-type="next"
            placeholder-style="color: #999;"
          />
        </view>
        <view class="input-group">
          <input
            class="input"
            v-model="formData.password"
            placeholder="请输入密码"
            type="text"
            :password="true"
            :adjust-position="true"
            :hold-keyboard="false"
            :cursor-spacing="50"
            :confirm-hold="false"
            confirm-type="done"
            placeholder-style="color: #999;"
            @confirm="handleLogin"
          />
        </view>
      </view>

      <view class="login-btn" @tap="handleLogin" :class="{ disabled: loading }">
        {{ loading ? '登录中...' : '登录' }}
      </view>
      <view class="register-link" @tap="handleRegister">还没有账号？立即注册</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { login } from '@/api/auth'
import { setToken } from '@/utils/request'

const formData = reactive({
  username: '',
  password: ''
})

const loading = ref(false)

const validateForm = () => {
  if (!formData.username) {
    uni.showToast({
      title: '请输入账号',
      icon: 'none',
      duration: 2000
    })
    return false
  }

  if (formData.username.length < 3) {
    uni.showToast({
      title: '账号长度不能少于3位',
      icon: 'none',
      duration: 2000
    })
    return false
  }

  if (!formData.password) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none',
      duration: 2000
    })
    return false
  }

  if (formData.password.length < 6) {
    uni.showToast({
      title: '密码长度不能少于6位',
      icon: 'none',
      duration: 2000
    })
    return false
  }

  return true
}

const handleLogin = async () => {
  if (!validateForm()) return

  if (loading.value) return

  loading.value = true

  try {
    const res = await login({
      username: formData.username,
      password: formData.password
    })

    // 保存token
    setToken(res.access_token)

    // 保存用户信息
    uni.setStorageSync('userInfo', res.user)

    uni.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1500
    })

    // 延迟跳转，让用户看到成功提示
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/home/home',
        fail: (err) => {
          console.error('跳转失败:', err)
          // 如果switchTab失败，尝试使用redirectTo
          uni.redirectTo({
            url: '/pages/home/home'
          })
        }
      })
    }, 1500)
  } catch (error: any) {
    console.error('登录失败:', error)
    uni.showToast({
      title: error.message || '登录失败，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
    loading.value = false
  }
}

const handleRegister = () => {
  uni.navigateTo({
    url: '/pages/register/register',
    fail: (err) => {
      console.error('页面跳转失败:', err)
    }
  })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.login-container {
  width: 600rpx;
  padding: 80rpx 48rpx;
  background: #ffffff;
  border-radius: 32rpx;
  text-align: center;
  box-sizing: border-box;
}

/* 小程序特定样式 */
/* #ifdef MP */
.login-container {
  width: 86%;
}
/* #endif */

.logo {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32rpx;
}

.logo-image {
  width: 160rpx;
  height: 160rpx;
}

.app-name {
  font-size: 48rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.app-desc {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 64rpx;
}

.form {
  margin-bottom: 48rpx;
}

.input-group {
  margin-bottom: 32rpx;
  position: relative;
  z-index: 1;
}

/* H5 特定样式 */
/* #ifdef H5 */
.input-group {
  -webkit-user-select: text;
  user-select: text;
  pointer-events: auto;
}
/* #endif */

/* 小程序特定样式 */
/* #ifdef MP */
.input-group {
  margin-bottom: 24rpx;
}
/* #endif */

.input {
  width: 100%;
  height: 88rpx;
  padding: 24rpx 32rpx;
  font-size: 30rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  box-sizing: border-box;
  border: 1rpx solid #e0e0e0;
  position: relative;
  z-index: 1;
  transition: all 0.3s;
}

/* H5 特定样式 */
/* #ifdef H5 */
.input {
  display: block;
  line-height: 1.4;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;
  user-select: text;
  pointer-events: auto;
  touch-action: manipulation;
}
/* #endif */

/* 小程序特定样式 */
/* #ifdef MP */
.input {
  line-height: 88rpx;
}
/* #endif */

.input:focus {
  border-color: #667eea;
  background: #ffffff;
}

.login-btn {
  width: 100%;
  padding: 28rpx;
  font-size: 32rpx;
  font-weight: 500;
  color: #ffffff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  margin-bottom: 32rpx;
  transition: opacity 0.3s;
  border: none;
}

.login-btn.disabled {
  opacity: 0.6;
}

.register-link {
  font-size: 28rpx;
  color: #667eea;
}
</style>
