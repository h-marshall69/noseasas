<!-- src/components/ui/DialogDescription.vue -->
<template>
  <p
    data-slot="alert-dialog-description"
    :class="cn('text-muted-foreground text-sm', props.className)"
    v-bind="$attrs"
  >
    <slot />
  </p>
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