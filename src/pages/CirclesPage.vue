<template>
  <view class="circles-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="title">校园圈子</view>
      <view class="icon-btn" @tap="handleSearch">
        <Search :size="24" />
      </view>
    </view>

    <!-- 分类标签 -->
    <view class="category-tabs">
      <view
        v-for="category in categories"
        :key="category.id"
        class="category-tab"
        :class="{ active: currentCategory === category.id }"
        @tap="currentCategory = category.id"
      >
        {{ category.name }}
      </view>
    </view>

    <!-- 圈子列表 -->
    <view class="circle-list">
      <view
        v-for="circle in filteredCircles"
        :key="circle.id"
        class="circle-card"
        @tap="handleCircleClick(circle)"
      >
        <image :src="circle.cover" :alt="circle.name" class="circle-cover" />
        <view class="circle-info">
          <view class="circle-name">{{ circle.name }}</view>
          <view class="circle-desc">{{ circle.description }}</view>
          <view class="circle-meta">
            <span class="meta-item">
              <Users :size="14" />
              {{ circle.members }} 成员
            </span>
            <span class="meta-item">
              <FileText :size="14" />
              {{ circle.posts }} 动态
            </span>
          </view>
        </view>
        <button
          class="btn-join"
          :class="{ joined: circle.isJoined }"
          @tap.stop="handleJoin(circle)"
        >
          {{ circle.isJoined ? '已加入' : '加入' }}
        </button>
      </view>
    </view>

    <!-- 底部导航 -->
    <TabBar />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TabBar from '@/components/TabBar.vue'


const currentCategory = ref('all')

const categories = [
  { id: 'all', name: '全部' },
  { id: 'study', name: '学习' },
  { id: 'sports', name: '运动' },
  { id: 'art', name: '艺术' },
  { id: 'tech', name: '科技' },
  { id: 'life', name: '生活' }
]

const circles = ref([
  {
    id: 1,
    name: '计算机学习小组',
    description: '一起学习编程，分享技术心得',
    cover: 'https://picsum.photos/400/300?random=1',
    category: 'study',
    members: 1234,
    posts: 567,
    isJoined: false
  },
  {
    id: 2,
    name: '篮球爱好者',
    description: '热爱篮球，一起打球交友',
    cover: 'https://picsum.photos/400/300?random=2',
    category: 'sports',
    members: 856,
    posts: 423,
    isJoined: true
  },
  {
    id: 3,
    name: '摄影社',
    description: '用镜头记录校园美好瞬间',
    cover: 'https://picsum.photos/400/300?random=3',
    category: 'art',
    members: 642,
    posts: 892,
    isJoined: false
  },
  {
    id: 4,
    name: '考研互助',
    description: '考研路上，我们一起努力',
    cover: 'https://picsum.photos/400/300?random=4',
    category: 'study',
    members: 2341,
    posts: 1234,
    isJoined: true
  },
  {
    id: 5,
    name: '美食探店',
    description: '发现校园周边美食',
    cover: 'https://picsum.photos/400/300?random=5',
    category: 'life',
    members: 1567,
    posts: 789,
    isJoined: false
  },
  {
    id: 6,
    name: '吉他社',
    description: '音乐爱好者的聚集地',
    cover: 'https://picsum.photos/400/300?random=6',
    category: 'art',
    members: 432,
    posts: 234,
    isJoined: false
  }
])

const filteredCircles = computed(() => {
  if (currentCategory.value === 'all') {
    return circles.value
  }
  return circles.value.filter(circle => circle.category === currentCategory.value)
})

const handleSearch = () => {
  uni.navigateTo({ url: '/search?type=circles')
}

const handleCircleClick = (circle: any) => {
  uni.navigateTo({ url: `/circle/${circle.id}`)
}

const handleJoin = (circle: any) => {
  circle.isJoined = !circle.isJoined
  circle.members += circle.isJoined ? 1 : -1
}
</script>

<style scoped>
/* 已优化为跨平台样式，使用rpx单位 */
/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */

.circles-page {
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
  flex: 1;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.icon-btn {
  width: 48rpx;
  height: 48rpx;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.category-tabs {
  display: flex;
  
  padding: var(--spacing-md) var(--page-padding);
  background: var(--color-bg-white);
  overflow-x: auto;
  white-space: nowrap;
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.category-tab {
  flex-shrink: 0;
  height: 64rpx;
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: var(--color-bg-gray);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.category-tab.active {
  color: var(--color-text-white);
  background: var(--color-primary);
}

.circle-list {
  padding: var(--spacing-sm) var(--page-padding);
}

.circle-card {
  display: flex;
  
  padding: var(--spacing-md);
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.circle-card:hover {
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.circle-cover {
  width: 200rpx;
  height: 200rpx;
  border-radius: var(--radius-md);
  object-fit: cover;
  flex-shrink: 0;
}

.circle-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.circle-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: 8rpx;
}

.circle-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: var(--spacing-xs);
}

.circle-meta {
  display: flex;
  
}

.meta-item {
  display: flex;
  align-items: center;
  
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.btn-join {
  align-self: center;
  padding: 12rpx 40rpx;
  font-size: var(--font-size-sm);
  color: var(--color-text-white);
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  flex-shrink: 0;
}

.btn-join.joined {
  color: var(--color-text-secondary);
  background: var(--color-bg-gray);
}
</style>
