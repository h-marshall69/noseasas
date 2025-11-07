<template>
  <div :class="contentClasses">
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  padding: {
    type: String,
    default: 'normal'
  },
  textAlign: {
    type: String,
    default: 'left'
  }
})

const contentClasses = computed(() => ({
  'card-content': true,
  [`padding-${props.padding}`]: true,
  [`text-${props.textAlign}`]: true
}))
</script>

<style scoped>
.card-content.padding-normal {
  padding: 2rem;
}

.card-content.padding-large {
  padding: 3rem;
}

.card-content.text-center {
  text-align: center;
}

.card-content.text-left {
  text-align: left;
}
</style>