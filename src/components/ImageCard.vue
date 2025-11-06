<template>
  <div class="group overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-200 rounded-lg">
    <div class="p-0">
      <!-- Image container -->
      <div class="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        <img
          :src="image.imageUrl"
          :alt="image.name"
          class="w-full h-full object-cover"
        />
       
        <!-- Overlay on hover -->
        <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          <button
            @click="onView(image)"
            class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Eye class="h-4 w-4" />
          </button>
          <button
            @click="onEdit(image)"
            class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Edit class="h-4 w-4" />
          </button>
          <button
            @click="onDelete(image.id)"
            class="inline-flex h-9 w-9 items-center justify-center rounded-md bg-red-600 text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </div>
        <!-- Checkbox for selection -->
        <div class="absolute top-3 left-3">
          <input
            type="checkbox"
            :checked="isSelected"
            @change="onSelect(image.id)"
            class="h-4 w-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>
      <!-- Info section -->
      <div class="p-4">
        <h3 class="truncate mb-1 text-sm font-medium text-gray-900">{{ image.name }}</h3>
        <p class="text-sm text-gray-500 truncate">Matrícula: {{ image.studentId }}</p>
        <p class="text-sm text-gray-500 truncate">{{ image.course }} - {{ image.grade }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Edit, Trash2, Eye } from 'lucide-vue-next';

export interface ImageData {
  id: string;
  studentId: string;
  name: string;
  course: string;
  grade: string;
  imageUrl: string;
  uploadDate: string;
  size: string;
}

interface ImageCardProps {
  image: ImageData;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (image: ImageData) => void;
  onDelete: (id: string) => void;
  onView: (image: ImageData) => void;
}

defineProps<ImageCardProps>();
</script>