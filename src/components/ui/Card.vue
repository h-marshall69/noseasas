<template>
  <div 
    class="custom-card"
    :class="cardClasses"
    @click="$emit('click')"
  >
    <div class="card-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  hoverEffect: {
    type: Boolean,
    default: true
  },
  borderOnHover: {
    type: String,
    default: null
  }
})

defineEmits(['click'])

const cardClasses = computed(() => ({
  'hover-effect': props.hoverEffect,
  'cursor-pointer': props.hoverEffect,
  [`hover-border-${props.borderOnHover}`]: props.borderOnHover
}))
</script>

<style scoped>
.custom-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.hover-effect:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transform: translateY(-4px);
}

.hover-border-blue:hover {
  border-color: #3b82f6;
}

.hover-border-green:hover {
  border-color: #10b981;
}

.card-content {
  padding: 2rem;
}
</style>