<template>
  <view class="resource-page">
    <!-- 顶部栏 -->
    <view class="header">
      <view class="title">资源广场</view>
      <view class="header-right">
        <view class="icon-btn" @tap="handleSearch">
          <Search :size="24" />
        </view>
        <view class="icon-btn" @tap="handleFilter">
          <SlidersHorizontal :size="24" />
        </view>
      </view>
    </view>

    <!-- 分类Tab -->
    <view class="category-tabs">
      <view
        v-for="category in categories"
        :key="category.id"
        class="category-tab"
        :class="{ active: currentCategory === category.id }"
        @tap="handleCategoryChange(category.id)"
      >
        {{ category.name }}
      </view>
    </view>

    <!-- 资源列表 -->
    <view class="resource-list">
      <view v-for="item in resources" :key="item.id" class="resource-card" @tap="handleItemClick(item.id)">
        <image :src="item.image" :alt="item.title" class="resource-image" />
        <view class="resource-info">
          <view class="resource-title">{{ item.title }}</view>
          <view class="resource-price" :class="{ free: item.price === 0 }">
            {{ item.price === 0 ? '免费' : `¥${item.price}` }}
          </view>
        </view>
      </view>
    </view>

    <!-- 底部导航 -->
    <TabBar />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TabBar from '@/components/TabBar.vue'


// 分类数据
const categories = ref([
  { id: 'secondhand', name: '二手' },
  { id: 'study', name: '学习' },
  { id: 'lost', name: '失物' },
  { id: 'other', name: '其他' }
])

const currentCategory = ref('secondhand')

// 资源数据
const resources = ref([
  {
    id: 1,
    image: 'https://sns-img-hw.xhscdn.com/1000g0081ruk2u2qf80605nqe6ekg8vtsffqnih0?imageView2/2/w/1600/format/webp',
    title: '高等数学教材（第七版）',
    price: 50
  },
  // {
  //   id: 2,
  //   image: 'https://picsum.photos/200/200?random=11',
  //   title: '大学物理实验器材',
  //   price: 300
  // },
  // {
  //   id: 3,
  //   image: 'https://picsum.photos/200/200?random=12',
  //   title: '计算机组成原理笔记',
  //   price: 0
  // },
  // {
  //   id: 4,
  //   image: 'https://picsum.photos/200/200?random=13',
  //   title: 'iPad Pro 2021款',
  //   price: 4500
  // },
  // {
  //   id: 5,
  //   image: 'https://picsum.photos/200/200?random=14',
  //   title: '英语四级资料包',
  //   price: 0
  // },
  {
    id: 6,
    image: 'https://img0.baidu.com/it/u=2829708033,1427731684&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
    title: '台灯 护眼灯',
    price: 80
  }
])

// 分类切换
const handleCategoryChange = (categoryId: string) => {
  currentCategory.value = categoryId
}

// 搜索
const handleSearch = () => {
  uni.navigateTo({ url: '/search')
}

// 筛选
const handleFilter = () => {
  console.log('打开筛选')
}

// 点击资源卡片
const handleItemClick = (id: number) => {
  uni.navigateTo({ url: `/resource/${id}`)
}
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.resource-page {
  min-height: 100vh;
  padding-bottom: 100rpx;
  background: var(--color-bg-page);
}

.header {
  position: sticky;
  top: 0;
  height: 88rpx;
  padding: 0 var(--page-padding);
  background: var(--color-bg-white);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: var(--border-width-thin) solid var(--color-border-base);
  z-index: var(--z-index-sticky);
}

.title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  
}

.icon-btn {
  width: 48rpx;
  height: 48rpx;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.category-tabs {
  display: flex;
  background: var(--color-bg-white);
  border-bottom: var(--border-width-thin) solid var(--color-border-base);
}

.category-tab {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  cursor: pointer;
  position: relative;
  transition: color var(--duration-fast) var(--ease-out);
}

.category-tab.active {
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

.category-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 48rpx;
  height: 6rpx;
  background: var(--color-primary);
  border-radius: var(--radius-full);
}

.resource-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  
  padding: var(--spacing-md) var(--page-padding);
}

.resource-card {
  background: var(--color-bg-white);
  border-radius: var(--radius-base);
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-out);
}

.resource-card:active {
  transform: scale(0.98);
}

.resource-image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.resource-info {
  padding: var(--spacing-sm);
}

.resource-title {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.resource-price {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-error);
}

.resource-price.free {
  color: var(--color-success);
}
</style>
