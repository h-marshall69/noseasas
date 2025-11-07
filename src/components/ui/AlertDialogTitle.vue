<!-- src/components/ui/DialogTitle.vue -->
<template>
  <h2
    data-slot="alert-dialog-title"
    :class="cn('text-lg font-semibold', props.className)"
    v-bind="$attrs"
  >
    <slot />
  </h2>
</template>

<script setup>
import { cn } from '../utils'

defineProps({
  className: {
    type: String,
    default: ''
  }
})
</script>