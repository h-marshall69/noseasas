<!-- src\components\Sapo.vue -->

<template>
  <div class="sapo-container" ref="container">
    <div class="loading-screen" v-if="!prankTriggered">
      <div class="spinner"></div>
      <p>Cargando datos importantes...</p>
    </div>
    <div class="prank-screen" v-else>
      <h1 class="caught-message">¡TE PILLÉ MIRANDO, COTILLA! 😈</h1>
      <div class="sapo-animation">
        <div class="sapo-body">
          <div class="sapo-head">
            <div class="eye left"></div>
            <div class="eye right"></div>
            <div class="mouth"></div>
          </div>
          <div class="sapo-legs">
            <div class="leg front"></div>
            <div class="leg back"></div>
          </div>
        </div>
      </div>
      <p class="subtext">¡La próxima vez avisa antes de espiar! 🐸</p>
      <button @click="resetPrank" class="reset-btn">Reiniciar (para que no se entere)</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const container = ref(null)
const prankTriggered = ref(false)

const triggerPrank = () => {
  prankTriggered.value = true
  // Opcional: Reproducir un sonido chistoso si el navegador lo permite
  // (descomenta si quieres, pero necesita interacción previa del usuario)
  // const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBS/9P/9f9/4Q==') // Sonido corto de "boing"
  // audio.play().catch(() => {}) // Ignora errores de autoplay
}

const resetPrank = () => {
  prankTriggered.value = false
}

onMounted(async () => {
  // Espera un poco para que parezca normal, luego ¡sorpresa!
  await nextTick()
  setTimeout(triggerPrank, 2000) // 2 segundos de "carga"
  
  // Detecta si alguien mueve el mouse cerca (para "peekers" que se acercan)
  container.value.addEventListener('mousemove', (e) => {
    if (!prankTriggered.value && e.clientX > window.innerWidth / 2) {
      triggerPrank()
    }
  })
})
</script>

<style scoped>
.sapo-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Arial', sans-serif;
  overflow: hidden;
}

.loading-screen {
  text-align: center;
  color: white;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid white;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.prank-screen {
  text-align: center;
  color: white;
  animation: bounceIn 0.5s ease-out;
}

@keyframes bounceIn {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}

.caught-message {
  font-size: 2.5em;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  animation: wiggle 0.5s infinite;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(2deg); }
  75% { transform: rotate(-2deg); }
}

.sapo-animation {
  position: relative;
  display: inline-block;
  margin: 20px 0;
  animation: hop 2s ease-in-out infinite;
}

@keyframes hop {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.sapo-body {
  width: 80px;
  height: 60px;
  background: #4CAF50;
  border-radius: 50% 50% 40% 40%;
  position: relative;
}

.sapo-head {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 40px;
  background: #4CAF50;
  border-radius: 50%;
}

.eye {
  position: absolute;
  top: 10px;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  border: 2px solid black;
}

.eye.left {
  left: 10px;
}

.eye.right {
  right: 10px;
}

.mouth {
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 10px;
  border: 2px solid black;
  border-top: none;
  border-radius: 0 0 20px 20px;
}

.sapo-legs {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
}

.leg {
  width: 15px;
  height: 25px;
  background: #4CAF50;
  border-radius: 10px 10px 0 0;
  animation: legBounce 0.5s ease-in-out infinite alternate;
}

.leg.back {
  animation-delay: 0.25s;
}

@keyframes legBounce {
  0% { transform: rotate(-10deg); }
  100% { transform: rotate(10deg); }
}

.subtext {
  font-size: 1.2em;
  margin: 20px 0;
}

.reset-btn {
  background: #FF5722;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1em;
  transition: background 0.3s;
}

.reset-btn:hover {
  background: #E64A19;
}
</style>