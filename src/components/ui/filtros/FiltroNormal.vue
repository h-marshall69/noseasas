<template>
  <Select :modelValue="criterio" @update:modelValue="val => $emit('update:criterio', val)" :options="opciones"
    optionLabel="label" optionValue="value" placeholder="Buscar por..." class="select-color"
    :style="estilos.selectStyle" :labelStyle="estilos.labelStyle" />
  <InputText :modelValue="valor" @keypress="soloNumeros ? bloquearNoNumeros($event) : null"
    @input="soloNumeros ? filtrarPegado($event) : $emit('update:valor', $event.target.value)"
    placeholder="Ingrese valor" :style="estilosInput" />
</template>

<script setup>
import { Select, InputText } from 'primevue'

const props = defineProps({
  criterio: String,
  valor: String,
  opciones: Array,
  estilos: Object,
  soloNumeros: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:criterio', 'update:valor'])

// Bloquea cualquier tecla que no sea número
function bloquearNoNumeros(e) {
  if (!/[0-9]/.test(e.key)) {
    e.preventDefault()
  }
}

// Si pegan texto, lo limpia
function filtrarPegado(e) {
  const soloDigitos = e.target.value.replace(/\D/g, '')
  emit('update:valor', soloDigitos)
}

const estilosInput = {
  width: '150px',
  borderColor: '#1c3550',
  borderRadius: 'normal',
  marginLeft: '4px'
}
</script>