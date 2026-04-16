<template>
  <view class="publish-page">
    <!-- 顶部栏 -->
    <view class="header">
      <view class="btn-text" @tap="handleCancel">取消</view>
      <view class="title">发布动态</view>
      <button class="btn-primary btn-small" :disabled="!canPublish || isPublishing" @tap="handlePublish">
        {{ isPublishing ? '发布中...' : '发布' }}
      </button>
    </view>

    <!-- 内容区 -->
    <view class="content">
      <!-- 文本输入 -->
      <view class="textarea-wrapper">
        <textarea
          v-model="content"
          class="textarea-base"
          placeholder="分享你的校园生活..."
          maxlength="500"
          @input="handleInput"
        ></textarea>
        <view class="char-count">{{ content.length }}/500</view>
      </view>

      <!-- 图片上传 -->
      <view class="image-upload">
        <view v-for="(image, index) in images" :key="index" class="image-item">
          <image :src="image.url" alt="上传图片" />
          <view class="image-delete" @tap="handleDeleteImage(index)">
            <X :size="16" />
          </view>
        </view>
        <view v-if="images.length < 9" class="image-add" @tap="handleAddImage">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            style="display: none"
            @change="handleFileChange"
          />
          <Plus :size="32" />
          <span class="image-add-text">{{ images.length }}/9</span>
        </view>
      </view>

      <!-- 话题选择 -->
      <view class="topic-section">
        <view class="section-title">选择话题</view>
        <view class="topic-chips">
          <view
            v-for="topic in availableTopics"
            :key="topic.id"
            class="topic-chip"
            :class="{ active: selectedTopic === topic.id }"
            @tap="handleSelectTopic(topic.id)"
          >
            {{ topic.name }}
          </view>
        </view>
      </view>

      <!-- 功能选项 -->
      <view class="options">
        <view class="option-item" @tap="handleAddLocation">
          <MapPin :size="20" />
          <span>添加位置</span>
          <span v-if="location" class="option-value">{{ location }}</span>
          <ChevronRight v-else :size="16" class="option-arrow" />
        </view>
        <view class="option-item" @tap="handleSetVisibility">
          <Users :size="20" />
          <span>可见范围</span>
          <span class="option-value">{{ visibilityText }}</span>
          <ChevronRight :size="16" class="option-arrow" />
        </view>
      </view>
    </view>

    <!-- 位置选择弹窗 -->
    <view v-if="showLocationModal" class="modal-overlay" @tap="showLocationModal = false">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <view class="modal-title">选择位置</view>
          <view class="modal-close" @tap="showLocationModal = false">
            <X :size="20" />
          </view>
        </view>
        <view class="modal-body">
          <view
            v-for="loc in locationOptions"
            :key="loc"
            class="location-item"
            :class="{ active: location === loc }"
            @tap="selectLocation(loc)"
          >
            <MapPin :size="16" />
            <span>{{ loc }}</span>
            <Check v-if="location === loc" :size="16" class="check-icon" />
          </view>
        </view>
      </view>
    </view>

    <!-- 可见范围选择弹窗 -->
    <view v-if="showVisibilityModal" class="modal-overlay" @tap="showVisibilityModal = false">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <view class="modal-title">选择可见范围</view>
          <view class="modal-close" @tap="showVisibilityModal = false">
            <X :size="20" />
          </view>
        </view>
        <view class="modal-body">
          <view
            v-for="option in visibilityOptions"
            :key="option.value"
            class="visibility-item"
            :class="{ active: visibility === option.value }"
            @tap="selectVisibility(option.value)"
          >
            <component :is="option.icon" :size="20" />
            <view class="visibility-info">
              <view class="visibility-label">{{ option.label }}</view>
              <view class="visibility-desc">{{ option.desc }}</view>
            </view>
            <Check v-if="visibility === option.value" :size="16" class="check-icon" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'


const content = ref('')
const images = ref<{ url: string; file?: File }[]>([])
const location = ref('')
const selectedTopic = ref('all')
const visibility = ref('public')
const isPublishing = ref(false)
const showLocationModal = ref(false)
const showVisibilityModal = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// 可用话题
const availableTopics = ref([
  { id: 'all', name: '全部' },
  { id: 'study', name: '学习' },
  { id: 'life', name: '生活' },
  { id: 'activity', name: '活动' },
  { id: 'confession', name: '表白墙' }
])

// 位置选项
const locationOptions = ref([
  '北京·清华大学',
  '北京·北京大学',
  '上海·复旦大学',
  '上海·交通大学',
  '广州·中山大学',
  '深圳·南方科技大学'
])

// 可见范围选项
const visibilityOptions = ref([
  {
    value: 'public',
    label: '公开',
    desc: '所有人可见',
    icon: Globe
  },
  {
    value: 'friends',
    label: '仅好友',
    desc: '仅关注的人可见',
    icon: UserCheck
  },
  {
    value: 'private',
    label: '仅自己',
    desc: '只有自己可见',
    icon: Lock
  }
])

const visibilityText = computed(() => {
  const option = visibilityOptions.value.find(opt => opt.value === visibility.value)
  return option?.label || '公开'
})

const canPublish = computed(() => {
  return content.value.trim().length > 0 || images.value.length > 0
})

const handleInput = () => {
  // 可以在这里添加实时字数统计等功能
}

const handleCancel = () => {
  if (canPublish.value) {
    if (confirm('确定要放弃编辑吗？')) {
      uni.navigateBack()
    }
  } else {
    uni.navigateBack()
  }
}

const handlePublish = async () => {
  if (!canPublish.value || isPublishing.value) return

  isPublishing.value = true

  try {
    // 模拟发布请求
    await new Promise(resolve => setTimeout(resolve, 1500))

    const postData = {
      content: content.value,
      images: images.value.map(img => img.url),
      location: location.value,
      topic: selectedTopic.value,
      visibility: visibility.value,
      timestamp: new Date().toISOString()
    }

    console.log('发布动态', postData)

    // 发布成功后跳转
    alert('发布成功！')
    uni.navigateTo({ url: '/home')
  } catch (error) {
    console.error('发布失败', error)
    alert('发布失败，请重试')
  } finally {
    isPublishing.value = false
  }
}

const handleAddImage = () => {
  fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (!files) return

  const remainingSlots = 9 - images.value.length
  const filesToAdd = Array.from(files).slice(0, remainingSlots)

  filesToAdd.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        images.value.push({
          url: e.target?.result as string,
          file: file
        })
      }
      reader.readAsDataURL(file)
    }
  })

  // 重置 input
  if (target) {
    target.value = ''
  }
}

const handleDeleteImage = (index: number) => {
  images.value.splice(index, 1)
}

const handleSelectTopic = (topicId: string) => {
  selectedTopic.value = topicId
}

const handleAddLocation = () => {
  showLocationModal.value = true
}

const selectLocation = (loc: string) => {
  location.value = loc
  showLocationModal.value = false
}

const handleSetVisibility = () => {
  showVisibilityModal.value = true
}

const selectVisibility = (value: string) => {
  visibility.value = value
  showVisibilityModal.value = false
}
</script>

<style scoped>
.publish-page {
  min-height: 100vh;
  background: var(--color-bg-white);
}

.header {
  height: 44px;
  padding: 0 var(--page-padding);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: var(--border-width-thin) solid var(--color-border-base);
}

.title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.content {
  padding: var(--spacing-md);
}

.textarea-wrapper {
  position: relative;
}

.textarea-base {
  width: 100%;
  min-height: 200px;
  padding: var(--spacing-md);
  border: none;
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  resize: none;
  outline: none;
}

.char-count {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.image-upload {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  
  margin-top: var(--spacing-md);
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-delete {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: var(--radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.image-delete:hover {
  background: rgba(0, 0, 0, 0.8);
}

.image-add {
  aspect-ratio: 1;
  border: 2px dashed var(--color-border-base);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.image-add:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.image-add-text {
  font-size: var(--font-size-xs);
}

.topic-section {
  margin-top: var(--spacing-xl);
}

.section-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
}

.topic-chips {
  display: flex;
  flex-wrap: wrap;
  
}

.topic-chip {
  height: 32px;
  padding: 0 var(--spacing-md);
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: var(--color-bg-gray);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.topic-chip.active {
  color: var(--color-text-white);
  background: var(--color-primary);
}

.options {
  margin-top: var(--spacing-xl);
  border-top: var(--border-width-thin) solid var(--color-border-base);
}

.option-item {
  display: flex;
  align-items: center;
  
  height: 50px;
  padding: 0 var(--spacing-md);
  border-bottom: var(--border-width-thin) solid var(--color-border-base);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
}

.option-item:active {
  background: var(--color-bg-gray);
}

.option-item svg {
  flex-shrink: 0;
  color: var(--color-text-secondary);
}

.option-item > span:first-of-type {
  flex: 1;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.option-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

.option-arrow {
  color: var(--color-text-tertiary);
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  width: 100%;
  max-height: 70vh;
  background: var(--color-bg-white);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 var(--page-padding);
  border-bottom: var(--border-width-thin) solid var(--color-border-base);
}

.modal-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background var(--duration-fast) var(--ease-out);
}

.modal-close:hover {
  background: var(--color-bg-gray);
}

.modal-body {
  max-height: calc(70vh - 50px);
  overflow-y: auto;
  padding: var(--spacing-sm) 0;
}

.location-item,
.visibility-item {
  display: flex;
  align-items: center;
  
  height: 50px;
  padding: 0 var(--page-padding);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
}

.location-item:hover,
.visibility-item:hover {
  background: var(--color-bg-gray);
}

.location-item.active,
.visibility-item.active {
  background: var(--color-bg-gray);
}

.location-item svg,
.visibility-item svg {
  flex-shrink: 0;
  color: var(--color-text-secondary);
}

.location-item > span {
  flex: 1;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.visibility-info {
  flex: 1;
}

.visibility-label {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.visibility-desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.check-icon {
  color: var(--color-primary);
}
</style>
