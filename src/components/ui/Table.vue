<template>
    <DataTable :value="dataLista" :paginator="paginator" :rows="rows" :lazy="lazy" :totalRecords="totalRecords"
        :rowsPerPageOptions="rowsPerPageOptions" :loading="loading" :scrollable="scrollable"
        :rowClass="() => 'fila-hover'" :scrollHeight="scrollHeight" :globalFilter="filtroGlobal"
        :stripedRows="stripedRows" :size="size" @page="onPage" responsiveLayout="scroll"
        v-model:contextMenuSelection="filaSeleccionada" @rowContextmenu="onRightClick"
        v-bind="{ virtualScrollerOptions }" >

        <template #header>
            <div v-if="filerActions" class="flex justify-between items-center gap-2">
                <span class="font-semibold text-lg">Buscar</span>
                <InputText v-model="filtroGlobal" placeholder="Buscar..." class="p-inputtext-sm" />
            </div>
        </template>
        <template v-if="dataLista.length === 0" #empty>
            <div class="text-center py-6 text-gray-500">
                <i class="pi pi-info-circle mr-2"></i>
                No existen registros
            </div>
        </template>
        <!-- <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header"
            :sortable="col.sortable ?? true" /> -->
        <Column v-for="col in columns" :key="col.field || col.header" :field="col.field" :header="col.header"
            :sortable="col.sortable ?? true" :style="{ width: col.width || 'auto' }"
            :bodyStyle="{ fontSize: '14px', textAlign: col.textAlign || 'left' }"
            headerStyle="background: #1c3550; color: white; fontSize: 14px">

            <!-- Campo editable solo si es editable -->
            <template v-if="col.editable" #body="slotProps">
                <InputText v-model="slotProps.data[col.field]" class="w-full text-right" type="number" />
            </template>

            <!-- Body custom -->
            <template v-else-if="col.body" #body="slotProps">
                {{ col.body(slotProps.data) }}
            </template>

            <!-- Estado especial -->
            <template v-else-if="col.field === 'entrega'" #body="slotProps">
                <Tag :value="props.estadoLabels[slotProps.data.entrega]"
                    :severity="slotProps.data.entrega === 1 ? 'success' : 'danger'" rounded style="font-size: 12px;" />
            </template>

            <!-- Render normal -->
            <template v-else #body="slotProps">
                {{ slotProps.data[col.field] }}
            </template>
            <!-- Botón dinámico según valor -->
            <template v-if="col.buttons" #body="slotProps">
                <!-- Vue Template -->
                <Tag :value="slotProps.data[col.field] === 1 ? col.buttons[0].label : col.buttons[1].label"
                    style="font-size: 14px; cursor: pointer;"
                    :severity="slotProps.data[col.field] === 1 ? 'success' : 'secondary'"
                    @click="props.onButtonClick(slotProps.data, col.field, col.buttons)" />


            </template>

        </Column>

        <!-- Acciones -->
        <Column v-if="showActions" header="Acciones" style="min-width: 50px"
            headerStyle="background: #1c3550; color: white; fontSize: 14px">
            <template #body="slotProps">
                <div class="flex justify-center items-left">
                    <Button v-if="columns.some(col => col.editable)" icon="pi pi-save" size="small" severity="success"
                        @click="emit('create', slotProps.data)" v-tooltip="'Crear Nuevo'" />
                    <div v-else>
                        <Button icon="pi pi-pencil" size="large" severity="info" @click="emit('create', slotProps.data)"
                            v-tooltip="'Actualizar'" />
                    </div>
                    <!-- <Button icon="pi pi-trash" size="small" severity="danger" @click="emit('delete', slotProps.data)" /> -->
                </div>
            </template>
        </Column>



        <ColumnGroup type="footer" v-if="totals">
            <Row>
                <Column footer="Total de estudiantes:" :colspan="4" footerStyle="text-align:right" />
                <Column :footer="totals" :colspan="1" />
            </Row>
        </ColumnGroup>

    </DataTable>
    <div v-if="accionMenuItems">
        <ContextMenu :model="menuItems" ref="cm">
            <template #item="{ item, props }">
                <a v-ripple class="flex items-center" v-bind="props.action">
                    <span class="ml-2">{{ item.label }}</span>
                </a>
            </template>
        </ContextMenu>
    </div>

</template>

<script setup>
import { ref, computed, useAttrs } from 'vue'
import {
    DataTable, Column, ColumnGroup, Row, Button, InputText, Tag, ContextMenu
} from 'primevue'

const props = defineProps({
    data: Array,
    columns: Array,
    scrollable: { type: Boolean, default: false },
    scrollHeight: { type: String, default: 'default' },
    showActions: { type: Boolean, default: false },
    filerActions: { type: Boolean, default: true },
    rows: { type: Number, default: 10 },
    paginator: { type: Boolean, default: false },
    lazy: { type: Boolean, default: false },
    totalRecords: { type: Number, default: 0 },
    rowsPerPageOptions: { type: Array, default: () => [10, 20, 30] },
    loading: { type: Boolean, default: false },
    stripedRows: { type: Boolean, default: false },
    size: { type: String, default: 'normal' },
    sortable: { type: Boolean, default: true },
    accionMenuItems: { type: Boolean, default: false },
    menuOpciones: { type: Array, default: [] },
    totals: { type: Number, default: null },
    virtualScrollerOptions: {
        type: Object,
        default: null
    },
    onButtonClick: Function,
})
const cm = ref()
const filaSeleccionada = ref(null)

//  Alias seguro para evitar "undefined"
const dataLista = computed(() => props.data || [])

const filtroGlobal = ref('')
const emit = defineEmits(['edit', 'create', 'delete', 'page', 'show', 'update', 'menuAction'])

const attrs = useAttrs()

const onPage = (event) => {
    emit('page', event)
}

const onRightClick = (event) => {
    if (!props.accionMenuItems || !cm.value) return;
    filaSeleccionada.value = event.data;
    cm.value.show(event.originalEvent);
};


const menuItems = computed(() => {
    if (!Array.isArray(props.menuOpciones)) return []
    return props.menuOpciones.map(opcion => {
        // Submenú
        if (Array.isArray(opcion.items) && opcion.items.length > 0) {
            return {
                label: opcion.label || '(sin etiqueta)',
                icon: opcion.icon,
                items: opcion.items
                    .filter(sub => sub && sub.label) // Solo subitems con label válido
                    .map(sub => ({
                        label: sub.label,
                        icon: sub.icon,
                        command: () => emit('menuAction', {
                            fila: filaSeleccionada.value,
                            action: sub.emit,  // nombre dinámico que viene de la API
                            itemId: sub.id
                        })
                    }))
            }
        }
        // Ítem normal
        return {
            label: opcion.label || '(sin etiqueta)',
            icon: opcion.icon,
            command: () => {
                emit(opcion.emit, filaSeleccionada.value)
            }
        }
    })
})

</script>

<style scoped>
/* CSS */
.btn-success {
    font-size: 14px;
    color: #ffffff;
    background-color: #28a745;
    border: 0.5px solid #ccc;
    transition: background-color 0.3s;
}

.btn-success:hover {
    background-color: #218838;
    /* color verde más oscuro al pasar el mouse */
}

.btn-gray {
    font-size: 14px;
    color: #ffffff;
    background-color: #808080;
    border: 0.5px solid #ccc;
    transition: background-color 0.3s;
}

.btn-gray:hover {
    background-color: #666666;
    /* color plomo más oscuro al pasar el mouse */
}
</style>

<style>
.p-datatable .p-datatable-tbody>tr:hover {
    background: #e3f2fd;
    /* azul clarito */
    cursor: pointer;
}

.fila-hover:hover {
    background: #e3f2fd !important;
    cursor: pointer;
}
</style>