<template>
    <div :class="containerClasses" id="container">
        <Navbar />
        <div class="boxed">
            <Sidebar />

            <!-- Overlay que aparece cuando el menú está abierto en móvil -->
            <div v-if="isMobile && isMenuOpen" class="fixed inset-0 z-40" @click="closeMenu"></div>

            <div id="content-container">
                <div id="page-head">
                    <div id="page-title">
                        <h1 class="page-header text-overflow">Programas EPG</h1>
                    </div>
                    <ol class="breadcrumb">
                        <li><a href="#"><i class="pli-home"></i></a></li>
                        <li><a href="#">Inicio</a></li>
                        <li class="active"></li>
                    </ol>
                </div>
                <div id="page-content">
                    <div class="panel">
                        <div class="panel-body">
                            <router-view />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
    </div>
</template>

<script setup>
import { ref, computed, provide, onMounted, onBeforeUnmount } from 'vue'
import Navbar from './Navbar.vue'
import Sidebar from './Sidebar.vue'
import Footer from './Footer.vue'
defineOptions({ name: 'DefaultLayout' })

const isMobile = ref(false)
const isMenuOpen = ref(true) // true = abierto

// Computar clases según estado
const containerClasses = computed(() => {
    if (isMobile.value) {
        return [
            'effect',
            'lg-mainnav-lg',
            isMenuOpen.value ? 'mainnav-in' : 'mainnav-sm'
        ]
    } else {
        return [
            'effect',
            isMenuOpen.value ? 'mainnav-lg' : 'mainnav-sm'
        ]
    }
})

// Toggle manual
const toggleNavSize = () => {
    isMenuOpen.value = !isMenuOpen.value
}

// Cerrar menú
const closeMenu = () => {
    if (isMobile.value) {
        isMenuOpen.value = false
    }
}

// Detectar tamaño pantalla
const handleResize = () => {
    isMobile.value = window.innerWidth < 990
    isMenuOpen.value = !isMobile.value // abierto en escritorio, cerrado en móvil
}

provide('toggleNavSize', toggleNavSize)

onMounted(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
})
</script>
