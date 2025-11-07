<!-- src\components\ui\Dialog.vue -->

<template>
  <!-- Trigger -->
  <div v-if="$slots.trigger" @click="openDialog">
    <slot name="trigger" />
  </div>

  <!-- Dialog -->
  <Teleport to="body" v-if="modelValue">
    <!-- Overlay -->
    <div
      :class="cn(
        'fixed inset-0 z-50 bg-black/50 animate-in fade-in-0',
        overlayClass
      )"
      @click="handleOverlayClick"
    />

    <!-- Content -->
    <div
      :class="cn(
        'fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 rounded-lg',
        contentClass
      )"
    >
      <!-- Close Button -->
      <button
        v-if="showCloseButton"
        @click="closeDialog"
        class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <XIcon class="h-4 w-4" />
        <span class="sr-only">Close</span>
      </button>

      <!-- Header -->
      <div v-if="$slots.header" class="flex flex-col space-y-2 text-center sm:text-left">
        <slot name="header" />
      </div>

      <!-- Default Header -->
      <div v-else-if="$slots.title || $slots.description" class="flex flex-col space-y-2 text-center sm:text-left">
        <h2 v-if="$slots.title" class="text-lg font-semibold">
          <slot name="title" />
        </h2>
        <p v-if="$slots.description" class="text-sm text-muted-foreground">
          <slot name="description" />
        </p>
      </div>

      <!-- Content -->
      <div class="my-4">
        <slot />
      </div>

      <!-- Footer -->
      <div v-if="$slots.footer" class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <slot name="footer" />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { cn } from '../utils';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  closeOnOverlayClick: {
    type: Boolean,
    default: true
  },
  showCloseButton: {
    type: Boolean,
    default: true
  },
  overlayClass: {
    type: String,
    default: ''
  },
  contentClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'open', 'close']);

const openDialog = () => {
  emit('update:modelValue', true);
  emit('open');
};

const closeDialog = () => {
  emit('update:modelValue', false);
  emit('close');
};

const handleOverlayClick = () => {
  if (props.closeOnOverlayClick) {
    closeDialog();
  }
};
</script>