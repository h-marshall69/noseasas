<template>
  <header id="navbar">
    <Toast />

    <div id="navbar-container" class="boxed">
      <div class="navbar-header">
        <a href="#" class="navbar-brand">
          <img :src="LogoUnap" alt="Logo" class="brand-icon" />
          <div class="brand-title">
            <span class="brand-text">UNA PUNO</span>
          </div>
        </a>
      </div>
      <div class="navbar-content" style="z-index: 100;">
        <ul class="nav navbar-top-links">
          <li @click="toggleNavSize" class="tgl-menu-btn">
            <a class="mainnav-toggle" href="#">
              <i class="pli-list-view"></i>
            </a>
          </li>
        </ul>
        <ul class="nav navbar-top-links">
          <li id="dropdown-user" class="dropdown" style="position: relative;" @click="toggleDropdown">
            <a href="#" class="dropdown-toggle text-right">
              <span class="ic-user pull-right">
                <i class="pli-male"></i>
              </span>
            </a>
            <!-- class="absolute right-0 mt-2 w-56 bg-white border rounded shadow-lg z-50" -->

            <div class="dropdown-menu dropdown-menu-sm panel-default" :class="{ 'show': isDropdownOpen }"
              style="position: absolute; right: 0; top: 100%; min-width: 200px; z-index: 1000;">
              <ul class="head-list">
                <!-- <li><a href="#"><i class="pli-male icon-lg icon-fw"></i> Perfil</a></li> -->
                <!-- <li @click="cambiarContraseña"> <a href="#"><i class="pli-computer-secure icon-lg icon-fw"></i> Cambio
                    de
                    Contraseña</a></li> -->
                <li @click="closeSession">
                  <a href="javascript:void(0)">
                    <i class="pli-unlock icon-lg icon-fw"></i> Cerrar Sesión
                  </a>
                </li>
              </ul>
            </div>
          </li>
        </ul>

      </div>
    </div>
  </header>
</template>

<script setup>
import LogoUnap from "../../assets/img/logo_unap.png"
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { inject } from 'vue'
import Toast from 'primevue/toast'
const toggleNavSize = inject('toggleNavSize')
const isDropdownOpen = ref(false)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = (event) => {
  if (!event.target.closest('#dropdown-user')) {
    isDropdownOpen.value = false
  }
}

// Manejo de clic fuera del menú
onMounted(() => {
  document.addEventListener('click', closeDropdown)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdown)
})

const closeSession = () => {
  sessionStorage.removeItem('access_token')
  window.location.href = import.meta.env.VITE_API_URL_LOGIN
}


</script>

<style scoped>
.dropdown-menu-sm {
  min-width: 220px !important;
  left: auto !important;
  right: 0 !important;
}
</style>