<template>
  <image
    :src="iconSrc"
    :style="iconStyle"
    mode="aspectFit"
    class="custom-icon"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  name: string
  size?: number
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  color: '#000000'
})

const iconSrc = computed(() => {
  return `/static/icons/${props.name}.svg`
})

const iconStyle = computed(() => {
  return {
    width: `${props.size}px`,
    height: `${props.size}px`,
    filter: props.color !== '#000000' ? `brightness(0) saturate(100%)` : 'none'
  }
})
</script>

<style scoped>
.custom-icon {
  display: inline-block;
  vertical-align: middle;
}
</style>
