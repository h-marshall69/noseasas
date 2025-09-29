<template>
  <div class="flex flex-wrap items-center gap-2">
    <div v-for="(criterio, index) in criterios" :key="index" class="flex flex-col">
      <label v-if="criterio.name" :for="'criterio-' + index" style="font-weight: bold; margin-bottom: 4px; margin-left: 8px; color: dark">
        {{ criterio.label || capitalizar(criterio.value) }}
      </label>

      <InputText :id="'criterio-' + index" v-model="modelValue[criterio.value]"
        :placeholder="`Buscar por ${criterio.label || capitalizar(criterio.value)}`" :style="estiloInput"
        :type="criterio.type || 'text'" />
    </div>
  </div>
</template>

<script setup>
import { InputText } from 'primevue'

defineProps({
  criterios: Array,
  estiloInput: Object
})

const modelValue = defineModel()

function capitalizar(texto) {
  if (!texto) return ''
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
</script>
