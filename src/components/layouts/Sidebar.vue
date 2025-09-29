<template>
    <nav id="mainnav-container" style="z-index: 1000;">
        <div id="mainnav">
            <div id="mainnav-menu-wrap">
                <div class="nano">
                    <div class="nano-content">
                        <div id="mainnav-profile" class="mainnav-profile">
                            <div class="profile-wrap  ">
                                <div class="pad-btm flex justify-center items-center ">
                                    <img class="img-circle img-md" :src="Profile" alt="Profile" />
                                </div>
                                <a href="#profile-nav" class="box-block" data-bs-toggle="collapse">
                                    <!-- <span class="pull-right dropdown-toggle">
                                        <i class="dropdown-caret"></i>
                                    </span> -->
                                    <p class="mnp-name" style="text-align: center;">{{ nombrePerfil }}</p>
                                    <p class="mnp-desc" style="text-align: center; font-weight: bold;">ADMINISTRADOR</p>
                                </a>
                            </div>
                        </div>
                        <ul id="mainnav-menu" class="list-group">
                            <li class="list-header">Navegación</li>
                            <li v-for="route in visibleRoutes" :key="route.path">
                                <router-link :to="route.path" class="list-group-item" active-class="active-sub">
                                    <i :class="route?.icon || 'pi pi-home'"></i>
                                    <span class="menu-title">{{ route.name }}</span>
                                </router-link>
                                <!-- <pre>{{ visibleRoutes }}</pre> -->
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Profile from "../../assets/img/profile.png"
import axios from 'axios'
// import { apiPefil } from '../../config/Api'
import { ref } from 'vue'
import { ApiMePerfil } from '../../config/Api'
// Obtener todas las rutas desde el router
const router = useRouter()
const nombrePerfil = ref("")
// Filtrar solo las rutas visibles en el menú
const visibleRoutes = router.options.routes
    .find(r => r.path === '/' && r.children)?.children
    ?.filter(route => route.name && !route.meta?.hidden) || []



const token = sessionStorage.getItem('access_token')
const config = {
    headers: {
        Authorization: `Bearer ${token}`,
    },
};
async function miPerfil() {
    try {
        const response = await axios.get(ApiMePerfil, config)
        if (response.status === 200) {
            const { firstName, lastName1, lastName2 } = response.data.data
            nombrePerfil.value = `${firstName} ${lastName1} ${lastName2}`.trim()
        }
    } catch (error) {
        console.log(error)
    }
}
miPerfil()
</script>

<style scoped>
/* puedes personalizar aquí los estilos activos */
.active-sub {
    background-color: #eee;
    font-weight: bold;
}
</style>