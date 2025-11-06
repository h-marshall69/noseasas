<template>
  <div>
    <!-- View Selection Screen -->
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div class="w-full max-w-4xl">
        <div class="text-center mb-12">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
            <span class="text-4xl">🎓</span>
          </div>
          <h1 class="text-4xl mb-3">Sistema de Carnets Estudiantiles</h1>
          <p class="text-gray-600">Selecciona tu perfil para acceder al sistema</p>
        </div>
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Admin Card -->
          <Card class="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-blue-500" @click="setViewMode('admin')">
            <CardContent class="p-8 text-center">
              <div class="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-6 group-hover:bg-blue-500 transition-colors">
                <Shield class="h-10 w-10 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h2 class="mb-3">Panel de Administración</h2>
              <p class="text-gray-600 mb-6">Acceso completo para gestionar fotos de carnet, crear, editar y eliminar registros</p>
              <Button class="w-full gap-2 group-hover:bg-blue-600" size="lg">
                <Shield class="h-4 w-4" />
                Acceder como Administrador
              </Button>
            </CardContent>
          </Card>
          <!-- Student Card -->
          <Card class="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-green-500" @click="setViewMode('student')">
            <CardContent class="p-8 text-center">
              <div class="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-2xl mb-6 group-hover:bg-green-500 transition-colors">
                <Users class="h-10 w-10 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <h2 class="mb-3">Portal del Estudiante</h2>
              <p class="text-gray-600 mb-6">Consulta el estado de tu foto de carnet y descarga tu información</p>
              <Button class="w-full gap-2 bg-green-600 hover:bg-green-700 group-hover:bg-green-700" size="lg">
                <Users class="h-4 w-4" />
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
  </div>
</template>

<script setup>
import AdminPanel from '../components/AdminPanel.vue'
import StudentPortal from '../components/StudentPortal.vue'

</script>