<template>
  <div class="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md mt-10">
    <h1 class="text-2xl font-bold text-gray-800 mb-4">
      {{ title }}
    </h1>
    
    <div class="flex items-center justify-between mb-4">
      <button 
        @click="decrement"
        class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
      >
        -
      </button>
      
      <span class="text-3xl font-bold">
        {{ count }}
      </span>
      
      <button 
        @click="increment"
        class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
      >
        +
      </button>
    </div>

    <input 
      v-model="name"
      type="text"
      placeholder="Escribe tu nombre"
      class="w-full p-3 border border-gray-300 rounded-lg mb-4"
    >

    <p v-if="name" class="text-blue-600 font-medium">
      Hola, {{ name }}!
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)
const name = ref('')
const title = ref('Componente Simple')

const increment = () => {
  count.value++
}

const decrement = () => {
  count.value--
}
</script>