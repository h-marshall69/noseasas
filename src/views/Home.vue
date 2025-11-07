<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Pantalla de Selección de Vista -->
    <div
      v-if="currentView === 'selection'"
      class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4"
    >
      <div class="w-full max-w-4xl">
        <div class="text-center mb-12">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
            <span class="text-4xl">🎓</span>
          </div>
          <h1 class="text-4xl font-bold mb-3 text-gray-800">Sistema de Carnets Estudiantiles</h1>
          <p class="text-gray-600 text-lg">Selecciona tu perfil para acceder al sistema</p>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <!-- Tarjeta de Administrador -->
          <Card
            hover-effect
            border-on-hover="blue"
            class="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
            @click="setViewMode('admin')"
            role="button"
            tabindex="0"
            @keyup.enter="setViewMode('admin')"
          >
            <CardContent padding="large" text-align="center">
              <div class="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-6 group-hover:bg-blue-500 transition-colors duration-300">
                <i class="fas fa-shield-alt text-blue-600 text-2xl group-hover:text-white transition-colors duration-300"></i>
              </div>
              <h2 class="text-2xl font-bold mb-3 text-gray-800">Panel de Administración</h2>
              <p class="text-gray-600 mb-6">Acceso completo para gestionar fotos de carnet, crear, editar y eliminar registros</p>
              <Button
                variant="primary"
                size="large"
                full-width
                @click.stop="setViewMode('admin')"
                aria-label="Acceder como Administrador"
              >
                <template #icon>
                  <i class="fas fa-shield-alt"></i>
                </template>
                Acceder como Administrador
              </Button>
            </CardContent>
          </Card>

          <!-- Tarjeta de Estudiante -->
          <Card
            hover-effect
            border-on-hover="green"
            class="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
            @click="setViewMode('student')"
            role="button"
            tabindex="0"
            @keyup.enter="setViewMode('student')"
          >
            <CardContent padding="large" text-align="center">
              <div class="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-2xl mb-6 group-hover:bg-green-500 transition-colors duration-300">
                <i class="fas fa-users text-green-600 text-2xl group-hover:text-white transition-colors duration-300"></i>
              </div>
              <h2 class="text-2xl font-bold mb-3 text-gray-800">Portal del Estudiante</h2>
              <p class="text-gray-600 mb-6">Consulta el estado de tu foto de carnet y descarga tu información</p>
              <Button
                variant="success"
                size="large"
                full-width
                @click.stop="setViewMode('student')"
                aria-label="Acceder como Estudiante"
              >
                <template #icon>
                  <i class="fas fa-users"></i>
                </template>
                Acceder como Estudiante
              </Button>
            </CardContent>
          </Card>
        </div>

        <div class="mt-8 text-center">
          <p class="text-sm text-gray-500">Sistema de gestión y consulta de fotos de carnet estudiantil</p>
        </div>
      </div>
    </div>

    <!-- Panel de Administración -->
    <AdminPanel v-else-if="currentView === 'admin'" />

    <!-- Portal del Estudiante -->
    <StudentPortal v-else-if="currentView === 'student'" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Componentes UI personalizados
import Card from '../components/ui/Card.vue'
import Button from '../components/ui/Button.vue' // Corregido: mayúscula inicial para consistencia
import CardContent from '../components/ui/CardContent.vue'

// Componentes de vistas
import AdminPanel from '../components/AdminPanel.vue'
import StudentPortal from '../components/StudentPortal.vue'

const currentView = ref('selection')

const setViewMode = (mode) => {
  currentView.value = mode
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

/* Transiciones suaves para efectos de hover en grupos */
.group {
  transition: all 0.3s ease;
}
</style>