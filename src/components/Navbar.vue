<!-- src\components\ui\Navbar.vue -->

<template>
  <nav class="border-b bg-white sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span class="text-white">🎓</span>
          </div>
          <div class="hidden sm:block">
            <div class="text-xl">Sistema de Carnets</div>
            <div class="text-xs text-gray-500">Panel de Administración</div>
          </div>
        </div>
        <!-- Search bar - Hidden on mobile -->
        <div class="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div class="relative w-full">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por nombre, matrícula o curso..."
              :value="searchTerm"
              @input="onSearchChange($event.target.value)"
              class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-10 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <!-- Actions -->
        <div class="flex items-center gap-3">
          <button @click="onUploadClick" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 py-2 gap-2">
            <Upload class="h-4 w-4" />
            <span class="hidden sm:inline">Nueva foto</span>
          </button>
          <div class="relative h-9 w-9 cursor-pointer hover:ring-2 ring-gray-200 transition rounded-full bg-gray-100 flex items-center justify-center">
            <User class="h-4 w-4 text-gray-600" />
          </div>
        </div>
      </div>
      <!-- Mobile search -->
      <div class="md:hidden pb-3">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar..."
            :value="searchTerm"
            @input="onSearchChange($event.target.value)"
            class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-10 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">

interface NavbarProps {
  onUploadClick: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

defineProps<NavbarProps>();
</script>