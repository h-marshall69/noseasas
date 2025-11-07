<!-- src/components/ui/DialogAction.vue -->
<template>
  <ButtonSimple
    :variant="variant"
    :size="size"
    :class="props.className"
    v-bind="props"
    @click="handleClick"
  >
    <slot />
  </ButtonSimple>
</template>

<script setup>
import ButtonSimple from './ButtonSimple.vue';

const props = defineProps({
  className: String,
  type: {
    type: String,
    default: 'button'
  },
  disabled: Boolean,
  variant: {
    type: String,
    default: 'default'
  },
  size: {
    type: String,
    default: 'default'
  }
});

const emit = defineEmits(['click']);

const handleClick = (e) => {
  emit('click', e);
};
</script>
