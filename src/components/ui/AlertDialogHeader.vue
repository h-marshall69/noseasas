<template>
  <div
    data-slot="alert-dialog-header"
    :class="cn('flex flex-col gap-2 text-center sm:text-left', props.className)"
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