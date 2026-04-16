<template>
  <view class="custom-tab-bar">
    <view
      v-for="(item, index) in tabList"
      :key="index"
      class="tab-item"
      @tap="switchTab(index)"
    >
      <view class="tab-icon">
        <text class="icon">{{ current === index ? item.selectedIcon : item.icon }}</text>
      </view>
      <text class="tab-text" :class="{ active: current === index }">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const current = ref(0)

const tabList = ref([
  {
    pagePath: '/pages/home/home',
    text: '首页',
    icon: '🏠',
    selectedIcon: '🏡'
  },
  {
    pagePath: '/pages/circles/circles',
    text: '圈子',
    icon: '👥',
    selectedIcon: '👨‍👩‍👧‍👦'
  },
  {
    pagePath: '/pages/activities/activities',
    text: '活动',
    icon: '🎯',
    selectedIcon: '🎪'
  },
  {
    pagePath: '/pages/resource/resource',
    text: '资源',
    icon: '📚',
    selectedIcon: '📖'
  },
  {
    pagePath: '/pages/profile/profile',
    text: '我的',
    icon: '👤',
    selectedIcon: '👨'
  }
])

onMounted(() => {
  // 获取当前页面路径
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const route = '/' + currentPage.route

  // 设置当前选中的tab
  const index = tabList.value.findIndex(item => item.pagePath === route)
  if (index !== -1) {
    current.value = index
  }
})

const switchTab = (index: number) => {
  const item = tabList.value[index]
  if (current.value === index) return

  uni.switchTab({
    url: item.pagePath
  })
  current.value = index
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
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.tab-icon {
  margin-bottom: 2px;
}

.icon {
  font-size: 24px;
  line-height: 1;
}

.tab-text {
  font-size: 10px;
  color: #7A7E83;
  line-height: 1;
}

.tab-text.active {
  color: #1890ff;
}
</style>
