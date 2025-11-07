<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
    <!-- Header -->
    <header class="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span class="text-white text-xl">🎓</span>
          </div>
          <div>
            <h1 class="text-xl">Portal del Estudiante</h1>
            <p class="text-sm text-gray-500">Consulta el estado de tu foto de carnet</p>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Search Section -->
      <div class="card mb-8 shadow-lg">
        <div class="card-content p-8">
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <SearchIcon />
            </div>
            <h2 class="mb-2">Buscar mi foto de carnet</h2>
            <p class="text-sm text-gray-500">
              Ingresa tu número de matrícula para consultar el estado de tu foto
            </p>
          </div>

          <div class="space-y-4 max-w-md mx-auto">
            <div>
              <label for="studentId" class="label">Número de Matrícula</label>
              <input
                id="studentId"
                v-model="studentId"
                @keypress.enter="handleSearch"
                placeholder="Ej: 2025001234"
                class="input mt-2"
              />
            </div>
            <button @click="handleSearch" class="button w-full gap-2 size-lg">
              <SearchIcon />
              Buscar
            </button>
          </div>
        </div>
      </div>

      <!-- Results Section -->
      <div v-if="hasSearched" class="card shadow-lg">
        <div class="card-content p-8">
          <div v-if="searchedStudent" class="space-y-6">
            <!-- Status Header -->
            <div class="text-center pb-6 border-b">
              <h3 class="mb-4">Estado de tu foto de carnet</h3>
              <span class="badge text-base px-4 py-2 gap-2 bg-green-600">
                <CheckCircle2Icon />
                Foto registrada
              </span>
            </div>

            <div class="grid md:grid-cols-2 gap-8">
              <!-- Image -->
              <div>
                <div class="relative bg-gray-100 rounded-lg overflow-hidden aspect-[3/4]">
                  <img
                    :src="searchedStudent.imageUrl"
                    :alt="searchedStudent.name"
                    class="w-full h-full object-cover"
                    @error="handleImageError"
                  />
                </div>
                <button 
                  @click="handleDownload(searchedStudent)" 
                  class="button variant-outline w-full mt-4 gap-2"
                >
                  <DownloadIcon />
                  Descargar foto
                </button>
              </div>

              <!-- Information -->
              <div class="space-y-6">
                <div>
                  <h3 class="mb-4">Información personal</h3>
                  
                  <div class="space-y-4">
                    <div class="flex items-start gap-3">
                      <HashIcon />
                      <div>
                        <p class="text-sm text-gray-500">Matrícula</p>
                        <p>{{ searchedStudent.studentId }}</p>
                      </div>
                    </div>

                    <div class="flex items-start gap-3">
                      <UserIcon />
                      <div>
                        <p class="text-sm text-gray-500">Nombre completo</p>
                        <p>{{ searchedStudent.name }}</p>
                      </div>
                    </div>

                    <div class="flex items-start gap-3">
                      <GraduationCapIcon />
                      <div>
                        <p class="text-sm text-gray-500">Carrera</p>
                        <p>{{ searchedStudent.course }}</p>
                      </div>
                    </div>

                    <div class="flex items-start gap-3">
                      <ClockIcon />
                      <div>
                        <p class="text-sm text-gray-500">Grado/Año</p>
                        <p>{{ searchedStudent.grade }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p class="text-sm text-blue-800">
                    Tu foto de carnet ha sido registrada correctamente. 
                    Podrás recoger tu carnet en la oficina administrativa según el calendario establecido.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <XCircleIcon />
            </div>
            <h3 class="mb-2">No se encontró registro</h3>
            <p class="text-gray-500 mb-6">
              No existe una foto de carnet asociada al número de matrícula <strong>{{ studentId }}</strong>
            </p>
            <p class="text-sm text-gray-500">
              Verifica que el número de matrícula sea correcto o contacta con la administración.
            </p>
          </div>
        </div>
      </div>

      <!-- Info Section -->
      <div v-if="!hasSearched" class="grid sm:grid-cols-3 gap-4 mt-8">
        <div class="card">
          <div class="card-content p-6 text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-3">
              <SearchIcon />
            </div>
            <h3 class="text-sm mb-2">Busca tu foto</h3>
            <p class="text-xs text-gray-500">
              Ingresa tu número de matrícula para ver tu foto registrada
            </p>
          </div>
        </div>

        <div class="card">
          <div class="card-content p-6 text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
              <CheckCircle2Icon />
            </div>
            <h3 class="text-sm mb-2">Verifica el estado</h3>
            <p class="text-xs text-gray-500">
              Consulta si tu foto ha sido registrada correctamente
            </p>
          </div>
        </div>

        <div class="card">
          <div class="card-content p-6 text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-3">
              <DownloadIcon />
            </div>
            <h3 class="text-sm mb-2">Descarga tu foto</h3>
            <p class="text-xs text-gray-500">
              Descarga una copia de tu foto de carnet
            </p>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="mt-16 py-8 border-t bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-sm text-gray-500">
          Si tienes alguna duda o problema, contacta con la oficina administrativa
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref } from 'vue';

// Icons components (simplified SVG icons)
const SearchIcon = {
  template: '<svg class="h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>'
};

const CheckCircle2Icon = {
  template: '<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
};

const XCircleIcon = {
  template: '<svg class="h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>'
};

const DownloadIcon = {
  template: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>'
};

const UserIcon = {
  template: '<svg class="h-5 w-5 text-gray-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
};

const GraduationCapIcon = {
  template: '<svg class="h-5 w-5 text-gray-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>'
};

const HashIcon = {
  template: '<svg class="h-5 w-5 text-gray-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>'
};

const ClockIcon = {
  template: '<svg class="h-5 w-5 text-gray-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
};

export default {
  name: 'StudentPortal',
  components: {
    SearchIcon,
    CheckCircle2Icon,
    XCircleIcon,
    DownloadIcon,
    UserIcon,
    GraduationCapIcon,
    HashIcon,
    ClockIcon
  },
  props: {
    images: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    // State
    const studentId = ref('');
    const searchedStudent = ref(null);
    const hasSearched = ref(false);

    // Methods
    const handleSearch = () => {
      if (!studentId.value.trim()) return;
      
      const found = props.images.find(img => img.studentId === studentId.value.trim());
      searchedStudent.value = found || null;
      hasSearched.value = true;
    };

    const handleDownload = (image) => {
      const link = document.createElement('a');
      link.href = image.imageUrl;
      link.download = `carnet_${image.studentId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const handleImageError = (e) => {
      const target = e.target;
      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EImagen no disponible%3C/text%3E%3C/svg%3E';
    };

    return {
      studentId,
      searchedStudent,
      hasSearched,
      handleSearch,
      handleDownload,
      handleImageError
    };
  }
};
</script>

<style scoped>
/* Estilos para simular las clases de Tailwind CSS usadas en React */
.min-h-screen {
  min-height: 100vh;
}

.bg-gradient-to-br {
  background: linear-gradient(to bottom right, #dbeafe, #e0e7ff);
}

.from-blue-50 {
  --tw-gradient-from: #dbeafe;
}

.to-indigo-50 {
  --tw-gradient-to: #e0e7ff;
}

.bg-white {
  background-color: white;
}

.border-b {
  border-bottom: 1px solid #e5e7eb;
}

.sticky {
  position: sticky;
}

.top-0 {
  top: 0;
}

.z-50 {
  z-index: 50;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.max-w-4xl {
  max-width: 56rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.gap-3 {
  gap: 0.75rem;
}

.w-10 {
  width: 2.5rem;
}

.h-10 {
  height: 2.5rem;
}

.bg-gradient-to-br {
  background: linear-gradient(to bottom right, #3b82f6, #2563eb);
}

.from-blue-500 {
  --tw-gradient-from: #3b82f6;
}

.to-blue-600 {
  --tw-gradient-to: #2563eb;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.text-white {
  color: white;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-gray-500 {
  color: #6b7280;
}

.py-12 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.card {
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.mb-8 {
  margin-bottom: 2rem;
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.card-content {
  padding: 2rem;
}

.text-center {
  text-align: center;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.inline-flex {
  display: inline-flex;
}

.w-16 {
  width: 4rem;
}

.h-16 {
  height: 4rem;
}

.rounded-full {
  border-radius: 9999px;
}

.bg-blue-100 {
  background-color: #dbeafe;
}

.mb-4 {
  margin-bottom: 1rem;
}

.text-blue-600 {
  color: #2563eb;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.max-w-md {
  max-width: 28rem;
}

.label {
  display: block;
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
  margin-bottom: 0.25rem;
}

.input {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.mt-2 {
  margin-top: 0.5rem;
}

.button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button:hover {
  background-color: #2563eb;
}

.button.variant-outline {
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.button.variant-outline:hover {
  background-color: #f9fafb;
  border-color: #3b82f6;
}

.w-full {
  width: 100%;
}

.gap-2 {
  gap: 0.5rem;
}

.size-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.pb-6 {
  padding-bottom: 1.5rem;
}

.border-b {
  border-bottom: 1px solid #e5e7eb;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background-color: #059669;
  color: white;
  border-radius: 9999px;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 500;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.bg-green-600 {
  background-color: #059669;
}

.grid {
  display: grid;
}

.md\:grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.gap-8 {
  gap: 2rem;
}

.relative {
  position: relative;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.overflow-hidden {
  overflow: hidden;
}

.aspect-\[3\/4\] {
  aspect-ratio: 3/4;
}

.w-full {
  width: 100%;
}

.h-full {
  height: 100%;
}

.object-cover {
  object-fit: cover;
}

.mt-4 {
  margin-top: 1rem;
}

.flex {
  display: flex;
}

.items-start {
  align-items: flex-start;
}

.bg-blue-50 {
  background-color: #dbeafe;
}

.border-blue-200 {
  border-color: #bfdbfe;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.p-4 {
  padding: 1rem;
}

.text-blue-800 {
  color: #1e40af;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.bg-red-100 {
  background-color: #fee2e2;
}

.text-red-600 {
  color: #dc2626;
}

.grid {
  display: grid;
}

.sm\:grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.gap-4 {
  gap: 1rem;
}

.mt-8 {
  margin-top: 2rem;
}

.p-6 {
  padding: 1.5rem;
}

.w-12 {
  width: 3rem;
}

.h-12 {
  height: 3rem;
}

.bg-green-100 {
  background-color: #dcfce7;
}

.text-green-600 {
  color: #16a34a;
}

.bg-purple-100 {
  background-color: #f3e8ff;
}

.text-purple-600 {
  color: #9333ea;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.mt-16 {
  margin-top: 4rem;
}

.border-t {
  border-top: 1px solid #e5e7eb;
}

/* Responsive breakpoints */
@media (min-width: 640px) {
  .sm\:px-6 {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\:px-8 {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}
</style>