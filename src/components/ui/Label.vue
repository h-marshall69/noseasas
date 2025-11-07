<!-- src/components/ui/Label.vue -->
<template>
  <label
    data-slot="label"
    :class="cn(
      'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
      className
    )"
    v-bind="$attrs"
  >
    <slot />
  </label>
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