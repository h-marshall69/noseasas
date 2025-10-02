<template>
    <header>
        <h1>Sistema de Gestión</h1>
        <nav>
            <button @click="currentComponent = 'Verificacion'" :class="{ active: currentComponent === 'PhotoTakedInscripcion' }">
                Ir a Verificación
            </button>
        </nav>
    </header>

    <main>
        <component :is="currentComponent" @navigate="handleNavigation" />
    </main>
</template>

<script>
import { ref } from 'vue'
import Nose from './Nose.vue';
import PhotoTakedInscripcion from './PhotoTakedInscripcion.vue';
// import Home from './components/Home.vue'
// import TomaFotos from './components/TomaFotos.vue'
// import Verificacion from './components/Verificacion.vue'

export default {
    name: 'App',
    components: {
        Nose,
        PhotoTakedInscripcion
        // TomaFotos,
        // Verificacion
    },
    setup() {
        const currentComponent = ref('Nose')

        const handleNavigation = (componentName) => {
            currentComponent.value = componentName
        }

        return {
            currentComponent,
            handleNavigation
        }
    }
}
</script>

<style scoped></style>