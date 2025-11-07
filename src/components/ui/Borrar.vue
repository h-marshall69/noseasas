<!-- src/components/ui/Button.vue -->

<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    type="button"
    @click="$emit('click', $event)"
  >
    <slot name="icon" v-if="$slots.icon"></slot>
    <slot v-else></slot>
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
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const buttonClasses = computed(() => [
  // Clases base
  'inline-flex items-center justify-center gap-2 font-medium',
  'rounded-lg border transition-colors duration-200',
  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current',
  // Cursor y disabled base
  'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
  // Variantes (condicionales para hover y disabled)
  {
    // Primary
    'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-gray-400': 
      props.variant === 'primary',
    // Secondary (outline)
    'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-500': 
      props.variant === 'secondary',
    // Success
    'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-gray-400': 
      props.variant === 'success',
    // Danger
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-gray-400': 
      props.variant === 'danger'
  },
  // Tamaños
  {
    'px-4 py-2 text-sm': props.size === 'small',
    'px-6 py-3 text-base': props.size === 'medium',
    'px-8 py-4 text-lg': props.size === 'large'
  },
  // Full width
  { 'w-full': props.fullWidth }
])
</script>

<style scoped>
/* Vacío: Todo ahora en Tailwind. Si necesitas overrides específicos, agrégalos aquí. */
</style>