<template>
  <div class="flex flex-row gap-2">
    <Select :id="'filtro-avanzado'" v-model="modelValue" :disabled="disabled" :loading="loading" :options="filtros"
      optionLabel="label" :optionValue="o => o" :filter="true" :placeholder="placeholderFinal" class="select-color"
      style="border-radius: normal; border-color: black;" />
  </div>

</template>

<script setup>
import { computed } from 'vue'
import { Select } from 'primevue'

const props = defineProps({
  filtros: Array,
  estilos: Object,
  placeholder: String,
  label: String, // NUEVO → para pasar el label manualmente si quieres
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },// ✅ Aquí agregamos la prop
  labelColor: { type: String, default: 'white' } // NUEVO → color configurable
})

const modelValue = defineModel()

const placeholderFinal = computed(() => props.placeholder || 'Seleccionar...')

function capitalizar(texto) {
  if (!texto) return ''
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
</script>
