<template>
  <div>
    <Navbar
      :searchTerm="searchTerm"
      @upload-click="handleUploadClick"
      @search-change="setSearchTerm"
    />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <h1>Fotos de Carnet</h1>
          <span class="text-sm text-gray-500">
            {{ filteredImages.length }} {{ filteredImages.length === 1 ? 'foto' : 'fotos' }}
          </span>
        </div>
        
        <div class="flex gap-2">
          <button
            v-if="filteredImages.length > 0"
            class="btn btn-outline gap-2"
            @click="handleSelectAll"
          >
            <CheckSquare class="h-4 w-4" />
            {{ selectedIds.size === filteredImages.length ? 'Deseleccionar todo' : 'Seleccionar todo' }}
          </button>
          
          <button
            v-if="selectedIds.size > 0"
            class="btn btn-destructive gap-2"
            @click="isBatchDeleteOpen = true"
          >
            <Trash2 class="h-4 w-4" />
            Eliminar ({{ selectedIds.size }})
          </button>
        </div>
      </div>

      <!-- Gallery grid -->
      <div v-if="filteredImages.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ImageCard
          v-for="image in filteredImages"
          :key="image.id"
          :image="image"
          :isSelected="selectedIds.has(image.id)"
          @select="handleSelectImage"
          @edit="handleEdit"
          @delete="handleDelete"
          @view="handleView"
        />
      </div>

      <div v-else class="text-center py-16">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <span class="text-3xl">🎓</span>
        </div>
        <h3 class="mb-2">No se encontraron fotos</h3>
        <p class="text-gray-500 mb-6">
          {{ searchTerm 
            ? 'Intenta con otro término de búsqueda' 
            : 'Comienza registrando la primera foto de carnet' }}
        </p>
        <button v-if="!searchTerm" class="btn" @click="handleUploadClick">
          Registrar foto
        </button>
      </div>
    </main>

    <!-- Modals -->
    <CreateEditModal
      :isOpen="isCreateEditOpen"
      :editImage="editingImage"
      @close="isCreateEditOpen = false"
      @save="handleSave"
    />

    <DetailModal
      :isOpen="isDetailOpen"
      :image="viewingImage"
      @close="isDetailOpen = false"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <!-- Delete confirmation -->
    <AlertDialog
      :open="!!deleteConfirmId"
      @update:open="(open) => !open && (deleteConfirmId = null)"
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El registro será eliminado permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            class="bg-red-600 hover:bg-red-700"
            @click="confirmDelete"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Batch delete confirmation -->
    <AlertDialog
      :open="isBatchDeleteOpen"
      @update:open="isBatchDeleteOpen = $event"
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar {{ selectedIds.size }} registros?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Los registros seleccionados serán eliminados permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            class="bg-red-600 hover:bg-red-700"
            @click="deleteSelectedImages"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Navbar from './Navbar.vue';
import ImageCard from './ImageCard.vue';
import CreateEditModal from './CreateEditModal.vue';
import DetailModal from './DetailModal.vue';
import { Trash2, CheckSquare } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

const props = defineProps({
  images: {
    type: Array,
    required: true
  }
});

const emit = defineEmits([
  'createImage',
  'updateImage',
  'deleteImage',
  'deleteMultiple'
]);

const searchTerm = ref('');
const selectedIds = ref(new Set());
const isCreateEditOpen = ref(false);
const isDetailOpen = ref(false);
const editingImage = ref(null);
const viewingImage = ref(null);
const deleteConfirmId = ref(null);
const isBatchDeleteOpen = ref(false);

// Filter images based on search
const filteredImages = computed(() => {
  return props.images.filter(img => 
    img.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    img.studentId.includes(searchTerm.value) ||
    img.course.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const deleteSelectedImages = () => {
  emit('deleteMultiple', Array.from(selectedIds.value));
  toast.success(`${selectedIds.value.size} registros eliminados`);
  selectedIds.value = new Set();
  isBatchDeleteOpen.value = false;
};

// Handlers
const handleUploadClick = () => {
  editingImage.value = null;
  isCreateEditOpen.value = true;
};

const handleEdit = (image) => {
  editingImage.value = image;
  isCreateEditOpen.value = true;
  isDetailOpen.value = false;
};

const handleSave = (data) => {
  if (editingImage.value) {
    emit('updateImage', editingImage.value.id, data);
  } else {
    emit('createImage', data);
  }
};

const handleDelete = (id) => {
  deleteConfirmId.value = id;
};

const handleView = (image) => {
  viewingImage.value = image;
  isDetailOpen.value = true;
};

const handleSelectImage = (id) => {
  const newSet = new Set(selectedIds.value);
  if (newSet.has(id)) {
    newSet.delete(id);
  } else {
    newSet.add(id);
  }
  selectedIds.value = newSet;
};

const handleSelectAll = () => {
  if (selectedIds.value.size === filteredImages.value.length) {
    selectedIds.value = new Set();
  } else {
    selectedIds.value = new Set(filteredImages.value.map(img => img.id));
  }
};

const setSearchTerm = (value) => {
  searchTerm.value = value;
};

const confirmDelete = () => {
  if (deleteConfirmId.value) {
    emit('deleteImage', deleteConfirmId.value);
    toast.success('Registro eliminado');
  }
  deleteConfirmId.value = null;
};
</script>

<style scoped>
/* Añade estilos personalizados si es necesario */
.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors;
}

.btn-outline {
  @apply border border-gray-300 hover:bg-gray-50;
}

.btn-destructive {
  @apply bg-red-600 text-white hover:bg-red-700;
}

.gap-2 {
  @apply space-x-2;
}
</style>