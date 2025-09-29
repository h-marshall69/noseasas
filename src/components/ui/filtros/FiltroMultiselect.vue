<template>
    <div class="flex flex-row gap-2"> 
      <MultiSelect
        v-model="seleccion"
        :options="opciones"
        optionLabel="label"  
        optionValue="value"   
        :placeholder="placeholder"
        :maxSelectedLabels="3"
        style="border-radius: normal; border-color: black;" 
      />
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import MultiSelect from 'primevue/multiselect'
  
  const props = defineProps({
    opciones: { type: Array, required: true },
    modelValue: { type: Array, default: () => [] },
    placeholder: { type: String, default: 'Selecciona...' },
    label: { type: String, default: '' },
    labelColor: { type: String, default: 'white' },
    estiloSelect: { type: Object, default: () => ({ width: '30%', marginLeft: '4px' }) }
  })
  
  const emit = defineEmits(['update:modelValue'])
  
  const seleccion = ref([...props.modelValue])
  
  watch(seleccion, (nuevo) => {
  if (nuevo !== props.modelValue) { // solo emite si cambió realmente
    emit('update:modelValue', nuevo)
  }
})

watch(() => props.modelValue, (nuevo) => {
  if (nuevo !== seleccion.value) { // solo asigna si es distinto
    seleccion.value = [...nuevo]
  }
})

  </script>
  