<!-- src\components\AdminPanel.vue -->

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Bar -->
    <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <nav class="px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex-1 max-w-md mx-auto">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar por nombre, ID o curso..."
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border transition-colors duration-200"
            />
          </div>
          <button
            @click="handleUploadClick"
            class="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Subir foto
          </button>
        </div>
      </nav>
    </header>

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
            class="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg class="w-4 h-4" :class="{ 'text-blue-600': selectedIds.size === filteredImages.length }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            {{ selectedIds.size === filteredImages.length ? 'Deseleccionar todo' : 'Seleccionar todo' }}
          </button>
          
          <button
            v-if="selectedIds.size > 0"
            @click="deleteSelectedImages"
            class="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Eliminar ({{ selectedIds.size }})
          </button>
        </div>
      </div>

      <!-- Gallery Grid -->
      <div v-if="filteredImages.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <article
          v-for="image in filteredImages"
          :key="image.id"
          class="relative bg-white rounded-lg shadow-md overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-lg"
          :class="{ 'border-blue-500 ring-2 ring-blue-500': selectedIds.has(image.id) }"
        >
          <!-- Selection Checkbox -->
          <input
            type="checkbox"
            :checked="selectedIds.has(image.id)"
            @change="handleSelectImage(image.id)"
            class="absolute top-3 left-3 z-10 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
          />
          
          <!-- Image Preview -->
          <figure class="relative">
            <img
              :src="image.url || '/placeholder.jpg'"
              :alt="`Foto de carnet de ${image.name}`"
              class="w-full h-48 object-cover cursor-pointer transition-transform duration-200 hover:scale-105"
              @click="handleView(image)"
              @error="handleImageError"
            />
          </figure>
          
          <!-- Card Content -->
          <div class="p-4">
            <h3 class="font-semibold text-gray-900 text-sm truncate">{{ image.name }}</h3>
            <p class="text-xs text-gray-600 mt-1">{{ image.studentId }} - {{ image.course }}</p>
            
            <div class="flex gap-2 mt-3">
              <button
                @click="handleEdit(image)"
                class="flex-1 inline-flex items-center justify-center gap-1 text-xs bg-blue-100 text-blue-800 py-2 px-2 rounded hover:bg-blue-200 transition-colors duration-200"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Editar
              </button>
              <button
                @click="handleDelete(image.id)"
                class="flex-1 inline-flex items-center justify-center gap-1 text-xs bg-red-100 text-red-800 py-2 px-2 rounded hover:bg-red-200 transition-colors duration-200"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
        <h3 class="mb-2 text-lg font-medium text-gray-900">No se encontraron fotos</h3>
        <p class="text-gray-500 mb-6 max-w-sm mx-auto">
          {{ searchTerm 
            ? 'No hay resultados para tu búsqueda. Intenta con otros términos.' 
            : 'Comienza registrando la primera foto de carnet' }}
        </p>
        <button 
          v-if="!searchTerm" 
          @click="handleUploadClick"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 h-10 px-4 py-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Registrar primera foto
        </button>
      </div>
    </main>

    <!-- Create/Edit Modal -->
    <div 
      v-if="isCreateEditOpen" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="isCreateEditOpen = false"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-auto shadow-xl">
        <h2 class="text-xl font-bold text-gray-900 mb-4">
          {{ editingImage ? 'Editar Foto' : 'Crear Nueva Foto' }}
        </h2>
        <form @submit.prevent="handleSave">
          <div class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                required
                class="w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div>
              <label for="studentId" class="block text-sm font-medium text-gray-700 mb-1">
                ID Estudiante
              </label>
              <input
                id="studentId"
                v-model="formData.studentId"
                type="text"
                required
                class="w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                placeholder="Ej: A123456"
              />
            </div>
            <div>
              <label for="course" class="block text-sm font-medium text-gray-700 mb-1">
                Curso
              </label>
              <input
                id="course"
                v-model="formData.course"
                type="text"
                required
                class="w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                placeholder="Ej: Matemáticas 101"
              />
            </div>
            <div>
              <label for="url" class="block text-sm font-medium text-gray-700 mb-1">
                URL de la Imagen
              </label>
              <input
                id="url"
                v-model="formData.url"
                type="url"
                required
                class="w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                placeholder="https://ejemplo.com/foto.jpg"
              />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              type="button"
              @click="isCreateEditOpen = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {{ editingImage ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Detail Modal -->
    <div 
      v-if="isDetailOpen" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="isDetailOpen = false"
    >
      <div class="bg-white rounded-lg max-w-2xl w-full mx-auto shadow-xl max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-xl font-bold text-gray-900">Detalles de la Foto</h2>
            <button 
              @click="isDetailOpen = false" 
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <figure class="mb-4">
            <img 
              :src="viewingImage.url" 
              :alt="`Foto de carnet de ${viewingImage.name}`"
              class="w-full h-64 object-cover rounded-lg shadow-sm"
              @error="handleImageError"
            />
          </figure>
          
          <div class="space-y-3 text-sm">
            <div>
              <strong class="text-gray-700">Nombre:</strong>
              <p class="text-gray-900 mt-1">{{ viewingImage.name }}</p>
            </div>
            <div>
              <strong class="text-gray-700">ID Estudiante:</strong>
              <p class="text-gray-900 mt-1">{{ viewingImage.studentId }}</p>
            </div>
            <div>
              <strong class="text-gray-700">Curso:</strong>
              <p class="text-gray-900 mt-1">{{ viewingImage.course }}</p>
            </div>
          </div>
          
          <div class="flex gap-2 mt-6 flex-wrap">
            <button
              @click="handleEdit(viewingImage)"
              class="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1 text-sm bg-blue-100 text-blue-800 py-2 px-4 rounded hover:bg-blue-200 transition-colors duration-200"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Editar
            </button>
            <button
              @click="handleDelete(viewingImage.id)"
              class="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1 text-sm bg-red-100 text-red-800 py-2 px-4 rounded hover:bg-red-200 transition-colors duration-200"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Eliminar
            </button>
            <button
              @click="isDetailOpen = false"
              class="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1 text-sm bg-gray-100 text-gray-800 py-2 px-4 rounded hover:bg-gray-200 transition-colors duration-200"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue';

const props = defineProps({
  images: {
    type: Array,
    required: true,
    default: () => []
  }
});

const emit = defineEmits([
  'createImage',
  'updateImage',
  'deleteImage',
  'deleteMultiple'
]);

// State
const searchTerm = ref('');
const selectedIds = ref(new Set());
const isCreateEditOpen = ref(false);
const isDetailOpen = ref(false);
const editingImage = ref(null);
const viewingImage = ref(null);

const formData = reactive({
  name: '',
  studentId: '',
  course: '',
  url: ''
});

// Computed
const filteredImages = computed(() => {
  if (!props.images || !Array.isArray(props.images)) return [];
  
  const term = searchTerm.value.toLowerCase().trim();
  if (!term) return props.images;

  return props.images.filter(img => 
    img.name?.toLowerCase().includes(term) ||
    img.studentId?.toString().toLowerCase().includes(term) ||
    img.course?.toLowerCase().includes(term)
  );
});

// Methods
const handleImageError = (event) => {
  event.target.src = '/placeholder.jpg';
};

const deleteSelectedImages = () => {
  if (selectedIds.value.size === 0) return;
  
  const count = selectedIds.value.size;
  if (confirm(`¿Estás seguro de que quieres eliminar ${count} ${count === 1 ? 'registro' : 'registros'}? Esta acción no se puede deshacer.`)) {
    emit('deleteMultiple', Array.from(selectedIds.value));
    selectedIds.value.clear();
  }
};

const resetForm = () => {
  formData.name = '';
  formData.studentId = '';
  formData.course = '';
  formData.url = '';
};

// Event Handlers
const handleUploadClick = () => {
  editingImage.value = null;
  resetForm();
  isCreateEditOpen.value = true;
};

const handleEdit = (image) => {
  editingImage.value = image;
  formData.name = image.name || '';
  formData.studentId = image.studentId || '';
  formData.course = image.course || '';
  formData.url = image.url || '';
  isCreateEditOpen.value = true;
  isDetailOpen.value = false;
};

const handleSave = () => {
  if (!formData.name.trim() || !formData.studentId.trim() || !formData.course.trim() || !formData.url.trim()) {
    alert('Por favor, completa todos los campos obligatorios.');
    return;
  }

  if (editingImage.value) {
    emit('updateImage', editingImage.value.id, { ...formData });
  } else {
    emit('createImage', { ...formData });
  }
  isCreateEditOpen.value = false;
  resetForm();
};

const handleDelete = (id) => {
  if (confirm('¿Estás seguro de que quieres eliminar este registro? Esta acción no se puede deshacer.')) {
    emit('deleteImage', id);
  }
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
    selectedIds.value.clear();
  } else {
    selectedIds.value = new Set(filteredImages.value.map(img => img.id));
  }
};

// Watch for search term changes to clear selections
watch(searchTerm, () => {
  selectedIds.value.clear();
});
</script>

<style scoped>
/* Custom styles can be added here if needed */
/* Tailwind CSS classes are used for most styling */
</style>