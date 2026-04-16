<template>
  <view class="activities-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="title">校园活动</view>
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

    <!-- 活动列表 -->
    <view class="activity-list">
      <view
        v-for="activity in filteredActivities"
        :key="activity.id"
        class="activity-card"
        @tap="handleActivityClick(activity)"
      >
        <image :src="activity.cover" :alt="activity.title" class="activity-cover" />
        <view class="activity-info">
          <view class="activity-title">{{ activity.title }}</view>
          <view class="activity-meta">
            <span class="meta-item">
              <Calendar :size="14" />
              {{ activity.date }}
            </span>
            <span class="meta-item">
              <MapPin :size="14" />
              {{ activity.location }}
            </span>
            <span class="meta-item">
              <Users :size="14" />
              {{ activity.participants }}/{{ activity.maxParticipants }}
            </span>
          </view>
          <view class="activity-status" :class="activity.status">
            {{ getStatusText(activity.status) }}
          </view>
        </view>
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
  { id: 'lecture', name: '讲座' },
  { id: 'competition', name: '比赛' },
  { id: 'party', name: '聚会' },
  { id: 'volunteer', name: '志愿' }
]

const activities = ref([
  {
    id: 1,
    title: '编程马拉松大赛',
    cover: 'https://picsum.photos/400/300?random=20',
    date: '2026-04-20 09:00',
    location: '图书馆',
    category: 'competition',
    participants: 45,
    maxParticipants: 100,
    status: 'ongoing'
  },
  {
    id: 2,
    title: '人工智能技术讲座',
    cover: 'https://picsum.photos/400/300?random=21',
    date: '2026-04-22 14:00',
    location: '教学楼A101',
    category: 'lecture',
    participants: 89,
    maxParticipants: 150,
    status: 'upcoming'
  },
  {
    id: 3,
    title: '毕业生欢送会',
    cover: 'https://picsum.photos/400/300?random=22',
    date: '2026-04-25 18:00',
    location: '学生活动中心',
    category: 'party',
    participants: 156,
    maxParticipants: 200,
    status: 'upcoming'
  },
  {
    id: 4,
    title: '图书馆志愿服务',
    cover: 'https://picsum.photos/400/300?random=23',
    date: '2026-04-18 10:00',
    location: '图书馆',
    category: 'volunteer',
    participants: 20,
    maxParticipants: 30,
    status: 'ended'
  }
])

const filteredActivities = computed(() => {
  if (currentCategory.value === 'all') {
    return activities.value
  }
  return activities.value.filter(activity => activity.category === currentCategory.value)
})

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    ongoing: '进行中',
    upcoming: '即将开始',
    ended: '已结束'
  }
  return statusMap[status] || ''
}

const handleSearch = () => {
  uni.navigateTo({ url: '/search?type=activities')
}

const handleActivityClick = (activity: any) => {
  uni.navigateTo({ url: `/activity/${activity.id}`)
}
</script>

<style scoped>
.activities-page {
  min-height: 100vh;
  padding-bottom: 50px;
  background: var(--color-bg-page);
}

.header {
  position: sticky;
  top: 0;
  height: 44px;
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
  width: 24px;
  height: 24px;
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
  height: 32px;
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: var(--color-bg-gray);
  border-radius: var(--radius-full);
  cursor: pointer;
}

.category-tab.active {
  color: var(--color-text-white);
  background: var(--color-primary);
}

.activity-list {
  padding: var(--spacing-sm) var(--page-padding);
}

.activity-card {
  display: flex;
  
  padding: var(--spacing-md);
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
  cursor: pointer;
}

.activity-cover {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-md);
  object-fit: cover;
  flex-shrink: 0;
}

.activity-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.activity-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.activity-meta {
  display: flex;
  flex-direction: column;
  
}

.meta-item {
  display: flex;
  align-items: center;
  
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.activity-status {
  align-self: flex-start;
  padding: 4px 12px;
  font-size: var(--font-size-xs);
  border-radius: var(--radius-full);
}

.activity-status.ongoing {
  color: #52c41a;
  background: #f6ffed;
}

.activity-status.upcoming {
  color: #1890ff;
  background: #e6f7ff;
}

.activity-status.ended {
  color: #999;
  background: #f5f5f5;
}
</style>
