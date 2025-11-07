<!-- src/components/ImageCard.vue -->
<template>
  <div class="group overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-200 rounded-lg bg-white">
    <div class="p-0">
      <!-- Image container -->
      <div class="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        <!-- Imagen desde internet -->
        <img
          v-if="image.imageUrl"
          :src="image.imageUrl"
          :alt="image.name"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
          <div class="text-center p-4">
            <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
              <span class="text-2xl">👤</span>
            </div>
            <p class="text-xs text-gray-500 font-medium">Foto de Carnet</p>
            <p class="text-xs text-gray-400 mt-1">{{ image.name }}</p>
          </div>
        </div>
       
        <!-- Overlay on hover -->
        <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          <button
            @click="onView(image)"
            class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            title="Ver"
          >
            <span class="text-sm">👁️</span>
          </button>
          <button
            @click="onEdit(image)"
            class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            title="Editar"
          >
            <span class="text-sm">✏️</span>
          </button>
          <button
            @click="onDelete(image.id)"
            class="inline-flex h-9 w-9 items-center justify-center rounded-md bg-red-600 text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            title="Eliminar"
          >
            <span class="text-sm">🗑️</span>
          </button>
        </div>
        
        <!-- Checkbox for selection -->
        <div class="absolute top-3 left-3">
          <input
            type="checkbox"
            :checked="isSelected"
            @change="onSelect(image.id)"
            class="h-4 w-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500 bg-white shadow-sm"
          />
        </div>
      </div>
      
      <!-- Info section -->
      <div class="p-4">
        <h3 class="truncate mb-1 text-sm font-medium text-gray-900">{{ image.name }}</h3>
        <p class="text-sm text-gray-500 truncate">Matrícula: {{ image.studentId }}</p>
        <p class="text-sm text-gray-500 truncate">{{ image.course }} - {{ image.grade }}</p>
        <div class="mt-2 flex justify-between items-center text-xs text-gray-400">
          <span>{{ formatDate(image.uploadDate) }}</span>
          <span>{{ image.size }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  image: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      studentId: '',
      name: '',
      course: '',
      grade: '',
      imageUrl: '',
      uploadDate: '',
      size: ''
    })
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  onSelect: {
    type: Function,
    required: true
  },
  onEdit: {
    type: Function,
    required: true
  },
  onDelete: {
    type: Function,
    required: true
  },
  onView: {
    type: Function,
    required: true
  }
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES')
}
</script>