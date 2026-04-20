<template>
  <view class="login-page">
    <!-- Logo区域 -->
    <view class="logo-section">
      <view class="logo">🌸</view>
      <view class="app-name">Iris Program</view>
      <view class="app-slogan">校园轻社交与资源共享平台</view>
    </view>

    <!-- 登录表单 -->
    <view class="login-form">
      <view class="form-item">
        <view class="input-wrapper">
          <User :size="20" class="input-icon" />
          <input
            v-model="loginForm.username"
            type="text"
            placeholder="请输入学号/手机号"
            class="form-input"
          /
            :adjust-position="true"
            :hold-keyboard="false"
            :cursor-spacing="50"
            placeholder-style="color: #999;"
          >
        </view>
      </view>

      <view class="form-item">
        <view class="input-wrapper">
          <Lock :size="20" class="input-icon" />
          <input
            v-model="loginForm.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码"
            class="form-input"
          /
            :adjust-position="true"
            :hold-keyboard="false"
            :cursor-spacing="50"
            placeholder-style="color: #999;"
          >
          <Eye
            v-if="!showPassword"
            :size="20"
            class="input-icon-right"
            @tap="showPassword = true"
          />
          <EyeOff
            v-else
            :size="20"
            class="input-icon-right"
            @tap="showPassword = false"
          />
        </view>
      </view>

      <view class="form-options">
        <label class="remember-me">
          <input v-model="rememberMe" type="checkbox" /
            :adjust-position="true"
            :hold-keyboard="false"
            :cursor-spacing="50"
            placeholder-style="color: #999;"
          >
          <span>记住密码</span>
        </label>
        <span class="forgot-password" @tap="handleForgotPassword">忘记密码？</span>
      </view>

      <button class="btn-login" @tap="handleLogin">登录</button>

      <view class="divider">
        <span>或</span>
      </view>

      <button class="btn-wechat" @tap="handleWechatLogin">
        <MessageCircle :size="20" />
        <span>微信快捷登录</span>
      </button>

      <view class="register-link">
        还没有账号？<span @tap="handleRegister">立即注册</span>
      </view>
    </view>

    <!-- 底部协议 -->
    <view class="agreement">
      <label>
        <input v-model="agreeTerms" type="checkbox" /
            :adjust-position="true"
            :hold-keyboard="false"
            :cursor-spacing="50"
            placeholder-style="color: #999;"
          >
        <span>我已阅读并同意</span>
      </label>
      <span class="link" @tap="handleShowTerms">《用户协议》</span>
      <span>和</span>
      <span class="link" @tap="handleShowPrivacy">《隐私政策》</span>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'


const loginForm = ref({
  username: '',
  password: ''
})

const showPassword = ref(false)
const rememberMe = ref(false)
const agreeTerms = ref(false)

const handleLogin = () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    alert('请输入学号和密码')
    return
  }

  if (!agreeTerms.value) {
    alert('请先阅读并同意用户协议和隐私政策')
    return
  }

  // 模拟登录
  localStorage.setItem('user_token', 'mock_token_' + Date.now())
  localStorage.setItem('user_info', JSON.stringify({
    id: 1,
    username: loginForm.value.username,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User1'
  }))

  // 跳转到首页或重定向页面
  const redirect = router.currentRoute.value.query.redirect as string
  router.replace(redirect || '/home')
}

const handleWechatLogin = () => {
  if (!agreeTerms.value) {
    alert('请先阅读并同意用户协议和隐私政策')
    return
  }

  console.log('微信登录')
  // 模拟微信登录
  handleLogin()
}

const handleRegister = () => {
  uni.navigateTo({ url: '/register')
}

const handleForgotPassword = () => {
  uni.navigateTo({ url: '/forgot-password')
}

const handleShowTerms = () => {
  console.log('显示用户协议')
}

const handleShowPrivacy = () => {
  console.log('显示隐私政策')
}
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.login-page {
  min-height: 100vh;
  padding: var(--spacing-xl) var(--page-padding);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.logo-section {
  text-align: center;
  margin-bottom: var(--spacing-xxl);
}

.logo {
  font-size: 160rpx;
  margin-bottom: var(--spacing-md);
}

.app-name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-white);
  margin-bottom: var(--spacing-xs);
}

.app-slogan {
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.8);
}

.login-form {
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: 0 16rpx 64rpx rgba(0, 0, 0, 0.1);
}

.form-item {
  margin-bottom: var(--spacing-lg);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  height: 96rpx;
  background: var(--color-bg-gray);
  border-radius: var(--radius-md);
  padding: 0 var(--spacing-md);
}

.input-icon {
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.form-input {
  flex: 1;
  height: 100%;
  margin-left: var(--spacing-sm);
  font-size: var(--font-size-base);
  background: transparent;
  border: none;
  outline: none;
}

.input-icon-right {
  color: var(--color-text-tertiary);
  cursor: pointer;
  flex-shrink: 0;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-sm);
}

.remember-me {
  display: flex;
  align-items: center;
  
  color: var(--color-text-secondary);
  cursor: pointer;
}

.forgot-password {
  color: var(--color-primary);
  cursor: pointer;
}

.btn-login,
.btn-wechat {
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.btn-login {
  background: var(--color-primary);
  color: var(--color-text-white);
  margin-bottom: var(--spacing-lg);
}

.btn-login:hover {
  opacity: 0.9;
}

.divider {
  position: relative;
  text-align: center;
  margin: var(--spacing-lg) 0;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 2rpx;
  background: var(--color-border-base);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.btn-wechat {
  background: #07c160;
  color: var(--color-text-white);
  margin-bottom: var(--spacing-md);
}

.btn-wechat:hover {
  opacity: 0.9;
}

.register-link {
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.register-link span {
  color: var(--color-primary);
  cursor: pointer;
}

.agreement {
  margin-top: var(--spacing-lg);
  text-align: center;
  font-size: var(--font-size-xs);
  color: rgba(255, 255, 255, 0.8);
}

.agreement label {
  display: inline-flex;
  align-items: center;
  
  cursor: pointer;
}

.agreement .link {
  color: var(--color-text-white);
  text-decoration: underline;
  cursor: pointer;
}
</style>
