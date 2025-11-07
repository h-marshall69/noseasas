<!-- src/components/ui/AlertDialogContent.vue -->
<template>
  <Dialog
    :model-value="true"
    @update:model-value="$emit('close')"
    :overlay-class="'bg-black/80'"
    :content-class="computedClass"
    :close-on-overlay-click="false"
    :show-close-button="false"
  >
    <template #trigger></template>
    
    <!-- Slot por defecto para el contenido -->
    <slot />
  </Dialog>
</template>

<script setup>
import Dialog from './Dialog.vue'
import { cn } from '../utils'

defineProps({
  className: String
})

defineEmits(['close'])
</script>

<script>
// Script normal para mantener el mismo nombre del componente
export default {
  name: 'AlertDialogContent'
}
</script>