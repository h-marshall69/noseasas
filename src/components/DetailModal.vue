<template>
  <div
    v-if="isOpen && image"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
        @click="onClose"
      ></div>
      <!-- Modal panel -->
      <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 id="modal-title" class="text-base font-semibold leading-6 text-gray-900 mb-4">
                Detalle de foto de carnet
              </h3>
              <div class="space-y-6">
                <!-- Image -->
                <div class="relative bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    :src="image.imageUrl"
                    :alt="image.name"
                    class="w-full max-h-96 object-contain mx-auto"
                  />
                </div>
                <!-- Actions -->
                <div class="flex gap-2 flex-wrap">
                  <button
                    @click="handleDownload"
                    class="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Download class="h-4 w-4" />
                    Descargar
                  </button>
                  <button
                    @click="onEdit(image)"
                    class="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Edit class="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    @click="handleDelete"
                    class="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    <Trash2 class="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
                <hr class="border-gray-200" />
                <!-- Student Information -->
                <div class="space-y-4">
                  <h3 class="text-lg font-medium text-gray-900">Información del estudiante</h3>
                  <div class="grid gap-4">
                    <div class="flex items-start gap-3">
                      <Hash class="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p class="text-sm text-gray-500">Número de Matrícula</p>
                        <p class="text-sm font-medium">{{ image.studentId }}</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3">
                      <User class="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p class="text-sm text-gray-500">Nombre completo</p>
                        <p class="text-sm font-medium">{{ image.name }}</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3">
                      <GraduationCap class="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p class="text-sm text-gray-500">Carrera</p>
                        <p class="text-sm font-medium">{{ image.course }}</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3">
                      <FileType class="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p class="text-sm text-gray-500">Año/Grado</p>
                        <p class="text-sm font-medium">{{ image.grade }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <hr class="border-gray-200" />
                <!-- Technical Information -->
                <div class="space-y-4">
                  <h3 class="text-lg font-medium text-gray-900">Información técnica</h3>
                  <div class="grid gap-3">
                    <div class="flex items-start gap-3">
                      <Hash class="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                      <div>
                        <p class="text-sm text-gray-500">ID del registro</p>
                        <p class="break-all text-sm font-mono">{{ image.id }}</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3">
                      <Calendar class="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                      <div>
                        <p class="text-sm text-gray-500">Fecha de registro</p>
                        <p class="text-sm">
                          {{ new Date(image.uploadDate).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) }}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3">
                      <FileType class="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                      <div>
                        <p class="text-sm text-gray-500">Tamaño del archivo</p>
                        <p class="text-sm">{{ image.size }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <button
            @click="onClose"
            class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { Edit, Trash2, Download, Calendar, FileType, Hash, GraduationCap, User } from 'lucide-vue-next';
import type { ImageData } from './ImageCard.vue';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: ImageData | null;
  onEdit: (image: ImageData) => void;
  onDelete: (id: string) => void;
}

const props = defineProps<DetailModalProps>();

const handleDownload = () => {
  const link = document.createElement('a');
  link.href = props.image!.imageUrl;
  link.download = `carnet_${props.image!.studentId}_${props.image!.name}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const handleDelete = () => {
  props.onDelete(props.image!.id);
  props.onClose();
};
</script>