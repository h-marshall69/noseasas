<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="$emit('update:modelValue', false)"
    >
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/50" />
      
      <!-- Content -->
      <div class="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div class="flex flex-col gap-4">
          <!-- Header -->
          <div v-if="$slots.header" class="flex flex-col gap-2">
            <slot name="header" />
          </div>
          
          <!-- Default header if no slot -->
          <div v-else class="flex flex-col gap-2">
            <h2 class="text-lg font-semibold">
              <slot name="title" />
            </h2>
            <p class="text-gray-600 text-sm">
              <slot name="description" />
            </p>
          </div>
          
          <!-- Content -->
          <div class="text-sm text-gray-700">
            <slot />
          </div>
          
          <!-- Footer -->
          <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: Boolean
});

defineEmits(['update:modelValue']);
</script>