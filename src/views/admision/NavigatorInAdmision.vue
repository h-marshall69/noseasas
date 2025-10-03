<template>
    <header>
        <Menubar :model="items">
            <template #start>
            </template>
        </Menubar>
    </header>

    <main>
        <component :is="currentComponent" />
    </main>
</template>

<script>
import { ref } from 'vue'
// 1. Importar el componente Menubar
import Menubar from 'primevue/menubar';

// Importa tus componentes de vista
import Nose from './Nose.vue';
import TakePhotoInscripcion from './TakePhotoInscripcion.vue';
import PhotoTakedInscripcion from './PhotoTakedInscripcion.vue';

export default {
    name: 'App',
    components: {
        // 2. Registrar el componente de PrimeVue
        Menubar, 
        PhotoTakedInscripcion,
        // TakePhotoInscripcion,
        Nose,
    },
    setup() {
        // Definimos currentComponent para cambiar la vista. 
        // Inicializa en 'Nose'.
        const currentComponent = ref('Nose');

        // Función auxiliar para cambiar el componente
        const handleNavigation = (componentName) => {
            currentComponent.value = componentName;
        };
        
        // 3. Definición de los ítems para el Menubar de PrimeVue
        const items = ref([
            {
                label: 'Ir a Tomar Foto',
                icon: 'pi pi-camera', // Requiere PrimeIcons
                command: () => {
                    handleNavigation('Nose');
                }
            },
            {
                label: 'Ir a Verificación',
                icon: 'pi pi-check-circle', // Requiere PrimeIcons
                command: () => {
                    handleNavigation('PhotoTakedInscripcion');
                }
            }
        ]);

        return {
            currentComponent,
            items, // Exponemos los ítems para el Menubar
            handleNavigation
        }
    },

    data() {
        return {
            // Este data es ignorado si 'currentComponent' se inicializa en setup()
            
        };
    },
}
</script>

<style scoped>
/* Estilos opcionales */
</style>