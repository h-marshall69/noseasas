<template>

  <Select v-model="modelValue" :options="filtros" optionLabel="label" :optionValue="o => o" :filter="true"
    placeholder="Seleccionar estado..." class="select-color" :style="estilos.selectStyle"
    :labelStyle="estilos.labelStyle" />

</template>

<script setup>
import { Select } from 'primevue'

const props = defineProps({
  filtros: Array,
  estilos: Object
})

const modelValue = defineModel()
</script>