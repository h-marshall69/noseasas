<!-- src/components/ui/Button.vue -->
<template>
  <ButtonSimple
    :variant="variant"
    :size="size"
    :class="className"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <slot />
  </ButtonSimple>
</template>

<script setup>
import ButtonSimple from './ButtonSimple.vue';

defineProps({
  variant: {
    type: String,
    default: 'default'
  },
  size: {
    type: String,
    default: 'default'
  },
  className: String
});

defineEmits(['click']);
</script>
