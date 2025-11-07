<!-- src\components\ui\Button.vue -->

<template>
  <button
    :class="buttonClasses"
    @click="$emit('click')"
  >
    <slot name="icon"></slot>
    <slot></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  fullWidth: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const buttonClasses = computed(() => ({
  'custom-button': true,
  [`button-${props.variant}`]: true,
  [`button-${props.size}`]: true,
  'w-full': props.fullWidth
}))
</script>

<style scoped>
.custom-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.button-primary {
  background-color: #3b82f6;
  color: white;
}

.button-primary:hover {
  background-color: #2563eb;
}

.button-success {
  background-color: #10b981;
  color: white;
}

.button-success:hover {
  background-color: #059669;
}

.button-medium {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.button-large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}
</style>