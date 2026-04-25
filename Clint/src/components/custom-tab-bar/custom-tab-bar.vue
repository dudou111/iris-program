<template>
  <view class="custom-tab-bar">
    <view
      v-for="(item, index) in tabList"
      :key="index"
      class="tab-item"
      :class="{ 'tab-item-active': current === index }"
      @tap="switchTab(index)"
    >
      <view class="tab-icon" :class="{ 'tab-icon-active': current === index }">
        <Icon :name="item.icon" :size="24" :color="current === index ? '#1890ff' : '#7A7E83'" />
      </view>
      <text class="tab-text" :class="{ active: current === index }">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import Icon from '@/components/icon/icon.vue'

const current = ref(0)

const tabList = ref([
  {
    pagePath: '/pages/home/home',
    text: '首页',
    icon: 'home'
  },
  {
    pagePath: '/pages/circles/circles',
    text: '圈子',
    icon: 'users'
  },
  {
    pagePath: '/pages/activities/activities',
    text: '活动',
    icon: 'calendar'
  },
  {
    pagePath: '/pages/resource/resource',
    text: '资源',
    icon: 'book'
  },
  {
    pagePath: '/pages/profile/profile',
    text: '我的',
    icon: 'user'
  }
])

const updateCurrentTab = () => {
  // 获取当前页面路径
  const pages = getCurrentPages()
  if (pages.length === 0) return

  const currentPage = pages[pages.length - 1]
  const route = '/' + currentPage.route

  // 设置当前选中的tab
  const index = tabList.value.findIndex(item => item.pagePath === route)
  if (index !== -1) {
    current.value = index
  }
}

onMounted(() => {
  updateCurrentTab()
})

onShow(() => {
  updateCurrentTab()
})

// 添加切换锁，防止快速连续点击导致页面混淆
const switching = ref(false)

const switchTab = (index: number) => {
  const item = tabList.value[index]

  // 如果是当前页面或正在切换中，直接返回
  if (current.value === index || switching.value) return

  switching.value = true
  current.value = index

  uni.switchTab({
    url: item.pagePath,
    success: () => {
      // 切换成功后解锁
      setTimeout(() => {
        switching.value = false
      }, 300)
    },
    fail: () => {
      // 切换失败也要解锁，并恢复之前的选中状态
      switching.value = false
      updateCurrentTab()
    }
  })
}
</script>

<style scoped>
.custom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #ffffff;
  border-top: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 1000;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
  transition: all 0.3s ease;
}

.tab-item-active {
  transform: translateY(-2px);
}

.tab-icon {
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.tab-icon-active {
  transform: scale(1.1);
}

.tab-text {
  font-size: 10px;
  color: #7A7E83;
  line-height: 1;
  transition: all 0.3s ease;
  font-weight: 400;
}

.tab-text.active {
  color: #1890ff;
  font-weight: 600;
  font-size: 11px;
}

/* 添加选中指示器 */
.tab-item-active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: #1890ff;
  border-radius: 0 0 3px 3px;
}
</style>
