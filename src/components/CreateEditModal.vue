<template>
  <Dialog :open="isOpen" @update:open="handleClose">
    <DialogContent class="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {{ editImage ? 'Editar foto de carnet' : 'Registrar nueva foto de carnet' }}
        </DialogTitle>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <!-- Image upload area -->
        <div>
          <Label>Foto de carnet *</Label>
          <div
            :class="[
              'mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            ]"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="handleDrop"
            @click="fileInputRef?.click()"
          >
            <div v-if="previewUrl" class="relative">
              <ImageWithFallback
                :src="previewUrl"
                alt="Preview"
                class="max-h-48 mx-auto rounded object-contain"
              />
              <Button
                size="icon"
                variant="destructive"
                class="absolute top-2 right-2 h-8 w-8"
                @click.stop="clearImage"
              >
                <X class="h-4 w-4" />
              </Button>
            </div>
            <div v-else class="py-8">
              <Upload class="mx-auto h-12 w-12 text-gray-400" />
              <p class="mt-2 text-sm text-gray-600">
                Arrastra la foto aquí o haz clic para seleccionar
              </p>
              <p class="text-xs text-gray-500 mt-1">PNG, JPG - Fondo recortado - Máx 10MB</p>
            </div>
          </div>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileChange"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <!-- Student ID -->
          <div>
            <Label for="studentId">Número de Matrícula *</Label>
            <Input
              id="studentId"
              v-model="studentId"
              placeholder="Ej: 2025001234"
              class="mt-2"
            />
          </div>

          <!-- Grade -->
          <div>
            <Label for="grade">Año/Grado *</Label>
            <Select v-model="grade">
              <SelectTrigger class="mt-2">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="g in GRADES" :key="g" :value="g">
                  {{ g }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Name field -->
        <div>
          <Label for="name">Nombre completo del estudiante *</Label>
          <Input
            id="name"
            v-model="name"
            placeholder="Ej: María Fernanda González López"
            class="mt-2"
          />
        </div>

        <!-- Course field -->
        <div>
          <Label for="course">Carrera *</Label>
          <Select v-model="course">
            <SelectTrigger class="mt-2">
              <SelectValue placeholder="Seleccionar carrera" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="c in COURSES" :key="c" :value="c">
                {{ c }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleClose">
          Cancelar
        </Button>
        <Button 
          @click="handleSubmit" 
          :disabled="!isFormValid"
        >
          {{ editImage ? 'Actualizar' : 'Registrar' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
// import { Upload, X } from 'lucide-vue-next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/Button.vue';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { ImageData } from './ImageCard';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Props {
  isOpen: boolean;
  editImage?: ImageData | null;
}

interface Emits {
  (e: 'close'): void;
  (e: 'save', data: Partial<ImageData> & { file?: File }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const COURSES = [
  'Ingeniería en Sistemas',
  'Administración de Empresas',
  'Derecho',
  'Medicina',
  'Arquitectura',
  'Psicología',
  'Contabilidad',
  'Marketing',
  'Diseño Gráfico',
  'Enfermería'
];

const GRADES = ['1er Año', '2do Año', '3er Año', '4to Año', '5to Año', '6to Año'];

const studentId = ref('');
const name = ref('');
const course = ref('');
const grade = ref('');
const previewUrl = ref('');
const selectedFile = ref<File | null>(null);
const isDragging = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

const isFormValid = computed(() => {
  return name.value.trim() && studentId.value.trim() && course.value && grade.value;
});

watch(() => [props.editImage, props.isOpen], () => {
  if (props.editImage) {
    studentId.value = props.editImage.studentId;
    name.value = props.editImage.name;
    course.value = props.editImage.course;
    grade.value = props.editImage.grade;
    previewUrl.value = props.editImage.imageUrl;
  } else {
    resetForm();
  }
}, { immediate: true });

const handleFileSelect = (file: File) => {
  if (file && file.type.startsWith('image/')) {
    selectedFile.value = file;
    const reader = new FileReader();
    reader.onloadend = () => {
      previewUrl.value = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const handleDrop = (e: DragEvent) => {
  isDragging.value = false;
  const file = e.dataTransfer?.files[0];
  if (file) handleFileSelect(file);
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) handleFileSelect(file);
};

const clearImage = () => {
  previewUrl.value = '';
  selectedFile.value = null;
};

const handleSubmit = () => {
  if (!isFormValid.value) return;
  
  const data: Partial<ImageData> & { file?: File } = {
    studentId: studentId.value,
    name: name.value,
    course: course.value,
    grade: grade.value,
  };

  if (selectedFile.value) {
    data.file = selectedFile.value;
  }

  emit('save', data);
  handleClose();
};

const resetForm = () => {
  studentId.value = '';
  name.value = '';
  course.value = '';
  grade.value = '';
  previewUrl.value = '';
  selectedFile.value = null;
};

const handleClose = () => {
  resetForm();
  emit('close');
};
</script>