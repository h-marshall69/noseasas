<template>
  <div
    data-slot="alert-dialog-footer"
    :class="cn(
      'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
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