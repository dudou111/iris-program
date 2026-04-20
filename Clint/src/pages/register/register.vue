<template>
  <view class="register-page">
    <view class="register-container">
      <view class="logo">
        <image class="logo-image" src="/static/logo.png" mode="aspectFit" />
      </view>
      <view class="app-name">Iris Program</view>
      <view class="app-desc">欢迎注册</view>

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
            placeholder="请设置密码(6-20位)"
            type="text"
            :password="true"
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
            v-model="formData.confirmPassword"
            placeholder="请确认密码"
            type="text"
            :password="true"
            :adjust-position="true"
            :hold-keyboard="false"
            :cursor-spacing="50"
            :confirm-hold="false"
            confirm-type="done"
            placeholder-style="color: #999;"
            @confirm="handleRegister"
          />
        </view>
      </view>

      <view class="agreement">
        <checkbox-group @change="onAgreeChange">
          <label class="agreement-label">
            <checkbox value="agree" :checked="agreed" color="#667eea" />
            <text class="agreement-text">
              我已阅读并同意
              <text class="link" @tap.stop="handleShowAgreement">《用户协议》</text>
              和
              <text class="link" @tap.stop="handleShowPrivacy">《隐私政策》</text>
            </text>
          </label>
        </checkbox-group>
      </view>

      <view class="register-btn" @tap="handleRegister" :class="{ disabled: loading }">
        {{ loading ? '注册中...' : '注册' }}
      </view>

      <view class="login-link" @tap="handleGoLogin">已有账号？立即登录</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const formData = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const agreed = ref(false)

const onAgreeChange = (e: any) => {
  agreed.value = e.detail.value.includes('agree')
}

const validateForm = () => {
  if (!formData.username) {
    uni.showToast({
      title: '请输入账号',
      icon: 'none',
      duration: 2000
    })
    return false
  }

  if (formData.username.length < 3 || formData.username.length > 20) {
    uni.showToast({
      title: '账号长度为3-20位',
      icon: 'none',
      duration: 2000
    })
    return false
  }

  if (!formData.password) {
    uni.showToast({
      title: '请设置密码',
      icon: 'none',
      duration: 2000
    })
    return false
  }

  if (formData.password.length < 6 || formData.password.length > 20) {
    uni.showToast({
      title: '密码长度为6-20位',
      icon: 'none',
      duration: 2000
    })
    return false
  }

  if (!formData.confirmPassword) {
    uni.showToast({
      title: '请确认密码',
      icon: 'none',
      duration: 2000
    })
    return false
  }

  if (formData.password !== formData.confirmPassword) {
    uni.showToast({
      title: '两次密码输入不一致',
      icon: 'none',
      duration: 2000
    })
    return false
  }

  if (!agreed.value) {
    uni.showToast({
      title: '请阅读并同意用户协议和隐私政策',
      icon: 'none',
      duration: 2000
    })
    return false
  }

  return true
}

const handleRegister = async () => {
  if (!validateForm()) return

  if (loading.value) return

  loading.value = true

  try {
    // 模拟注册请求（开发阶段）
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 保存登录信息到本地存储
    uni.setStorageSync('token', 'mock-token-' + Date.now())
    uni.setStorageSync('userInfo', {
      username: formData.username,
      nickname: formData.username
    })

    uni.showToast({
      title: '注册成功',
      icon: 'success',
      duration: 1500
    })

    // 延迟跳转，让用户看到成功提示
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/home/home',
        fail: (err) => {
          console.error('跳转失败:', err)
          uni.redirectTo({
            url: '/pages/home/home'
          })
        }
      })
    }, 1500)
  } catch (error: any) {
    console.error('注册失败:', error)
    uni.showToast({
      title: error.message || '注册失败，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
    loading.value = false
  }
}

const handleGoLogin = () => {
  uni.navigateBack()
}

const handleShowAgreement = () => {
  uni.showToast({
    title: '用户协议',
    icon: 'none'
  })
}

const handleShowPrivacy = () => {
  uni.showToast({
    title: '隐私政策',
    icon: 'none'
  })
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
  box-sizing: border-box;
}

.register-container {
  width: 600rpx;
  padding: 80rpx 48rpx;
  background: #ffffff;
  border-radius: 32rpx;
  text-align: center;
  box-sizing: border-box;
}

/* 小程序特定样式 */
/* #ifdef MP */
.register-container {
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
  margin-bottom: 32rpx;
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

.code-group {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.code-input {
  flex: 1;
}

.code-btn {
  flex-shrink: 0;
  padding: 24rpx 32rpx;
  font-size: 28rpx;
  color: #667eea;
  background: #f5f5f5;
  border-radius: 16rpx;
  border: 1rpx solid #e0e0e0;
  white-space: nowrap;
  transition: opacity 0.3s;
}

.code-btn.disabled {
  color: #999;
  opacity: 0.6;
}

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

.agreement {
  margin-bottom: 48rpx;
  text-align: left;
  padding: 0 8rpx;
}

.agreement-label {
  display: flex;
  align-items: flex-start;
}

/* H5 特定样式 */
/* #ifdef H5 */
.agreement-label {
  gap: 16rpx;
}
/* #endif */

/* 小程序特定样式 */
/* #ifdef MP */
.agreement-label checkbox {
  margin-right: 16rpx;
  transform: scale(0.8);
}
/* #endif */

.agreement-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
  flex: 1;
}

.link {
  color: #667eea;
  text-decoration: underline;
}

.register-btn {
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

.register-btn.disabled {
  opacity: 0.6;
}

.login-link {
  font-size: 28rpx;
  color: #667eea;
}
</style>
