<template>
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 p-4">
        <h1 class="text-6xl font-bold mb-4">404</h1>
        <h2 class="text-2xl font-semibold mb-2">Página no encontrada</h2>
        <p class="text-lg text-gray-600 mb-6 text-center">
            Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <router-link to="/" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Volver al inicio
        </router-link>
    </div>
</template>