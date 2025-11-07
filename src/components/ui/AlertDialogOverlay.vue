<template>
  <div
    data-slot="alert-dialog-overlay"
    :class="cn(
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
      props.className
    )"
    v-bind="props"
  >
    <slot />
  </div>
</template>

<script setup>
import { cn } from '../utils';

const props = defineProps({
  className: String
});
</script>