<template>
    <form @submit.prevent="emitirBusqueda" class="flex   flex-wrap items-center w-full gap-2">
        <!-- Filtro Normal -->

        <FiltroNormal v-if="filterSeleccionNormal" v-model:criterio="criterioSeleccionado" v-model:valor="valor"
            :opciones="opciones" :soloNumeros="soloNumeros" :estilos="estilos" />

        <!-- Filtros Individuales múltiples -->
        <div>
            <label v-if="labelsStatus" style="font-weight: bold; margin-bottom: 4px; margin-left: 8px; color: white">
                -
            </label>
            <div class="flex flex-row gap-2">

                <FiltroAvanzado v-if="filtrosIndividual" v-for="(filtros, index) in listaFiltrosAvanzados" :key="index"
                    v-model="filtrosAvanzadosSeleccionados[index]" :filtros="filtros"
                    :disabled="props.filtrosDisabled.includes(index)"
                    :loading="props.filtrosDisabled.includes(index)"

                    :placeholder="placeholdersAvanzados[index] || `Seleccionar opción ${index + 1}...`"
                    @update:modelValue="valor => {
                        const indices = Array.isArray(indiceFiltroTiempoReal)
                            ? indiceFiltroTiempoReal
                            : [indiceFiltroTiempoReal];

                        if (indices.includes(index)) {
                            emitirSeleccion(index, valor);
                        }
                    }" />
            </div>
        </div>


        <!-- Filtro Status -->
        <FiltroStatus v-if="filtrosStatus" v-model="filtrosStatusSeleccionado" :filtros="filtrosStatusAvanzados"
            :estilos="estilos" />

        <!-- Filtro Text Input -->
        <FiltroTextInput v-if="filtrosTextInput" v-model="valores" :criterios="criterios" :estiloInput="inputStyle" />
        <div v-if="filtrosMultiselect">
            <FiltroMultiselect v-model="multiSelectValue" :opciones="opcionesMultiselect"
                placeholder="Selecciona opciones..." label="Multiselección" :labelColor="labelColor"
                :estiloSelect="estilos.selectStyle" />
        </div>
        <div class="flex flex-col">
            <!-- Botón Buscar -->
            <label v-if="labelsStatus" style="font-weight: bold; margin-bottom: 4px; margin-left: 8px; color: white">
                -
            </label>
            <Button label="Buscar" :disabled="isDisabled" icon="pi pi-search" type="submit" class="ml-1"
                style="font-size: 13.5px; background: #1c3550; cursor: pointer" />
        </div>

    </form>
</template>

<script setup>
import { ref, onMounted, computed,watch } from 'vue'
import FiltroNormal from './filtros/FiltroNormal.vue'
import FiltroAvanzado from './filtros/FiltroAvanzado.vue'
import FiltroStatus from './filtros/FiltroStatus.vue'
import FiltroTextInput from './filtros/FiltroTextInput.vue'
import FiltroMultiselect from './filtros/FiltroMultiselect.vue'

import { Button } from 'primevue'

const criterioSeleccionado = ref(null)
const filtrosAvanzadosSeleccionados = ref([]) // ahora es array
const filtrosStatusSeleccionado = ref(null)
const valor = ref('')
const valores = ref({})
const multiSelectValue = ref([]) // <-- Aquí

const props = defineProps({
    opciones: Array,
    criterios: Array,
    listaFiltrosAvanzados: { type: Array, default: () => [] },
    placeholdersAvanzados: { type: Array, default: () => [] },
    indiceFiltroTiempoReal: {
        type: [Number, Array],
        default: null
    },
    filtrosStatusAvanzados: Array,
    filter: { type: Boolean, default: false },
    labelColor: { type: String, default: 'white' },
    backgroundColor: { type: String, default: '#1c3550' },
    borderRadius: { type: String, default: 'normal' },
    filterSeleccionNormal: Boolean,
    filtrosIndividual: Boolean,
    filtrosTextInput: Boolean,
    filtrosStatus: Boolean,
    labelsStatus: { type: Boolean, default: false },
    soloNumeros: {
        type: Boolean,
        default: false
    },
    filtrosMultiselect: Boolean,
    filtrosDisabled: { type: Array, default: () => [] }, // índices deshabilitados

    opcionesMultiselect: { type: Array, default: () => [] }

})

const emit = defineEmits(['buscar', 'seleccion-cambio']) // 

function emitirSeleccion(index, valor) {
    emit('seleccion-cambio', { index, valor })
}

const estilos = computed(() => ({
    selectStyle: {
        background: props.backgroundColor,
        borderColor: '#1c3550',
        borderRadius: props.borderRadius,
        width: '120px',
        marginLeft: '4px'
    },
    labelStyle: {
        color: props.labelColor
    }
}))

const inputStyle = {
    width: '150px',
    borderColor: '#1c3550',
    // borderRadius: '0%',
    marginLeft: '4px'
}

const isDisabled = computed(() => {
    const sinValorSeleccionNormal = props.filterSeleccionNormal
        ? !(criterioSeleccionado.value && valor.value)
        : true

    const sinValorFiltrosAvanzados = props.filtrosIndividual
        ? filtrosAvanzadosSeleccionados.value.every(
            f => !(f?.campo && f?.value)
        )
        : true

    const sinValorFiltroStatus = props.filtrosStatus
        ? !(filtrosStatusSeleccionado.value?.campo && filtrosStatusSeleccionado.value?.value)
        : true

    const sinValoresTextInput = props.filtrosTextInput
        ? Object.values(valores.value).every(v => !v || v.trim() === '')
        : true

    const sinValoresMultiSelect = props.filtrosMultiselect
        ? !multiSelectValue.value.length
        : true

    return sinValorSeleccionNormal && sinValorFiltrosAvanzados && sinValorFiltroStatus && sinValoresTextInput &&
        sinValoresMultiSelect
})

watch(
  () => filtrosAvanzadosSeleccionados.value[0],
  (nuevo) => {
    if (nuevo) {
      emitirSeleccion(0, nuevo)
    }
  },
  { immediate: true }
)


onMounted(() => {
    criterioSeleccionado.value = props.opciones?.[0]?.value ?? null
    // filtros avanzados: solo si está vacío
    if (!filtrosAvanzadosSeleccionados.value.length) {
        filtrosAvanzadosSeleccionados.value = props.listaFiltrosAvanzados.map(
            filtros => filtros?.[0] ?? null
        )
    }

    filtrosStatusSeleccionado.value = props.filtrosStatusAvanzados?.[0] ?? null
    valores.value = Object.fromEntries((props.criterios || []).map(c => [c.value, '']))
    multiSelectValue.value = [] // inicia vacío o con valores predeterminados

})

function emitirBusqueda() {
    const payload = {}

    // Filtro normal
    if (criterioSeleccionado.value && valor.value) {
        payload[criterioSeleccionado.value] = valor.value
    }

    // Filtros avanzados múltiples
    props.listaFiltrosAvanzados.forEach((_, index) => {
        const seleccionado = filtrosAvanzadosSeleccionados.value[index]
        if (seleccionado?.campo && seleccionado?.value) {
            payload[seleccionado.campo] = seleccionado.value
        }
    })

    // Filtro status
    if (filtrosStatusSeleccionado.value?.campo && filtrosStatusSeleccionado.value?.value) {
        payload[filtrosStatusSeleccionado.value.campo] = filtrosStatusSeleccionado.value.value
    }

    //Filtro multiple 
    if (multiSelectValue.value.length > 0) {
        payload['multiSelect'] = multiSelectValue.value
    }

    // Text inputs
    for (const [campo, val] of Object.entries(valores.value)) {
        if (val && val.trim() !== '') {
            payload[campo] = val.trim()
        }
    }

    emit('buscar', payload)
}
</script>