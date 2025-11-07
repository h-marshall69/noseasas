<!-- src/components/AdminPanel.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Bar -->
    <Navbar
      :search-term="searchTerm"
      @update:search-term="searchTerm = $event"
      @upload-click="handleUploadClick"
    />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div class="flex items-center gap-4">
          <h1 class="text-2xl font-bold tracking-tight text-gray-900">Fotos de Carnet</h1>
          <span class="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {{ filteredImages.length }} {{ filteredImages.length === 1 ? 'foto' : 'fotos' }}
          </span>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex gap-2 flex-wrap">
          <button
            v-if="filteredImages.length > 0"
            @click="handleSelectAll"
            class="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <span class="text-sm">📋</span>
            {{ selectedIds.size === filteredImages.length ? 'Deseleccionar todo' : 'Seleccionar todo' }}
          </button>
          
          <button
            v-if="selectedIds.size > 0"
            @click="isBatchDeleteOpen = true"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors"
          >
            <span class="text-sm">🗑️</span>
            Eliminar ({{ selectedIds.size }})
          </button>
        </div>
      </div>

      <!-- Gallery Grid -->
      <div v-if="filteredImages.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ImageCard
          v-for="image in filteredImages"
          :key="image.id"
          :image="image"
          :is-selected="selectedIds.has(image.id)"
          :on-select="handleSelectImage"
          :on-edit="handleEdit"
          :on-delete="handleDelete"
          :on-view="handleView"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <span class="text-3xl">🎓</span>
        </div>
        <h3 class="mb-2 text-lg font-medium text-gray-900">No se encontraron fotos</h3>
        <p class="text-gray-500 mb-6 max-w-sm mx-auto">
          {{ searchTerm 
            ? 'Intenta con otro término de búsqueda' 
            : 'Comienza registrando la primera foto de carnet' }}
        </p>
        <button 
          v-if="!searchTerm" 
          @click="handleUploadClick"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Registrar foto
        </button>
      </div>
    </main>

    <!-- Modals -->
    <CreateEditModal
      :is-open="isCreateEditOpen"
      :edit-image="editingImage"
      @close="isCreateEditOpen = false"
      @save="handleSave"
    />

    <DetailModal
      :is-open="isDetailOpen"
      :image="viewingImage"
      @close="isDetailOpen = false"
      @edit="handleEditFromDetail"
      @delete="handleDeleteFromDetail"
    />

    <!-- Single delete confirmation -->
    <div v-if="deleteConfirmId" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-2">¿Eliminar registro?</h3>
        <p class="text-gray-600 mb-6">
          Esta acción no se puede deshacer. El registro será eliminado permanentemente.
        </p>
        <div class="flex justify-end gap-3">
          <button 
            @click="deleteConfirmId = null"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            @click="confirmDelete"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Batch delete confirmation -->
    <div v-if="isBatchDeleteOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-2">¿Eliminar {{ selectedIds.size }} registros?</h3>
        <p class="text-gray-600 mb-6">
          Esta acción no se puede deshacer. Los registros seleccionados serán eliminados permanentemente.
        </p>
        <div class="flex justify-end gap-3">
          <button 
            @click="isBatchDeleteOpen = false"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            @click="deleteSelectedImages"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Navbar from './Navbar.vue'
import ImageCard from './ImageCard.vue'
import CreateEditModal from './CreateEditModal.vue'
import DetailModal from './DetailModal.vue'

const props = defineProps({
  images: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits([
  'createImage',
  'updateImage',
  'deleteImage',
  'deleteMultiple'
])

// State
const searchTerm = ref('')
const selectedIds = ref(new Set())
const isCreateEditOpen = ref(false)
const isDetailOpen = ref(false)
const editingImage = ref(null)
const viewingImage = ref(null)
const deleteConfirmId = ref(null)
const isBatchDeleteOpen = ref(false)

// Computed
const filteredImages = computed(() => {
  if (!props.images || !Array.isArray(props.images)) return []
  
  const term = searchTerm.value.toLowerCase().trim()
  if (!term) return props.images

  return props.images.filter(img => 
    img.name?.toLowerCase().includes(term) ||
    img.studentId?.toString().toLowerCase().includes(term) ||
    img.course?.toLowerCase().includes(term)
  )
})

// Methods
const deleteSelectedImages = () => {
  emit('deleteMultiple', Array.from(selectedIds.value))
  selectedIds.value.clear()
  isBatchDeleteOpen.value = false
}

const confirmDelete = () => {
  if (deleteConfirmId.value) {
    emit('deleteImage', deleteConfirmId.value)
    deleteConfirmId.value = null
  }
}

// Event Handlers
const handleUploadClick = () => {
  editingImage.value = null
  isCreateEditOpen.value = true
}

const handleEdit = (image) => {
  editingImage.value = image
  isCreateEditOpen.value = true
  isDetailOpen.value = false
}

const handleEditFromDetail = (image) => {
  editingImage.value = image
  isCreateEditOpen.value = true
  isDetailOpen.value = false
}

const handleDeleteFromDetail = (id) => {
  deleteConfirmId.value = id
  isDetailOpen.value = false
}

const handleSave = (data) => {
  if (editingImage.value) {
    emit('updateImage', editingImage.value.id, data)
  } else {
    emit('createImage', data)
  }
  isCreateEditOpen.value = false
}

const handleDelete = (id) => {
  deleteConfirmId.value = id
}

const handleView = (image) => {
  viewingImage.value = image
  isDetailOpen.value = true
}

const handleSelectImage = (id) => {
  const newSet = new Set(selectedIds.value)
  if (newSet.has(id)) {
    newSet.delete(id)
  } else {
    newSet.add(id)
  }
  selectedIds.value = newSet
}

const handleSelectAll = () => {
  if (selectedIds.value.size === filteredImages.value.length) {
    selectedIds.value.clear()
  } else {
    selectedIds.value = new Set(filteredImages.value.map(img => img.id))
  }
}

// Watch
watch(searchTerm, () => {
  selectedIds.value.clear()
})
</script>