<template>
    <div>
        <video ref="video" autoplay playsinline webkit-playsinline muted hidden></video>
        <canvas ref="canvas" width="400" height="400" class="bg-black rounded-3x1"></canvas>

        <div class="dni-validator">
            <label for="dni">Ingrese su DNI:</label>
            <input id="dni" v-model="dni" @input="validateDNI" placeholder="Ej. 12345678" />
            <p v-if="dni.length > 0">
                <span v-if="isValid" style="color: green">✅ DNI válido</span>
                <span v-else style="color: red">❌ DNI inválido</span>
            </p>
        </div>

        <div class="flex items-center justify-center py-4">
            <button @click="TakePicture" class="
px-6 py-4bg-green-500 rounded
text-white text-2x1 uppercase font-bold
hover:bg-green-600">Take Picture</button>

        </div>
    </div>
</template>

<script setup>
import { useAdmisionStore } from '../../stores/useAdmisionStore';
import { ref, onMounted } from 'vue'

const canvas = ref(null)
const video = ref(null)
const ctx = ref(null)
const dni = ref('')
const isValid = ref(false)

const constraints = ref({
    audio: false,
    video: true
})

onMounted(async () => {
    if (video.value && canvas.value) {
        ctx.value = canvas.value.getContext("2d");
        await navigator.mediaDevices
        getUserMedia(constraints.value)
            .then(SetStream)
            .catch(e => {
                console.error(e)
            })
    }
})

function SetStream(stream) {
    video.value.srcObject = stream
    video.value.play()
    requestAnimationFrame(Draw)
}

function Draw() {
    ctx.value.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height)

    requestAnimationFrame(Draw)
}

function TakePicture() {
    var link = document.createElement('a')
    link.download = `vue-cam-${new Date().toISOString()}.png{}`
    link.href = canvas.value.toDataURL()
    link.click()
}

const validateDNI = () => {
  // Regex para 8 dígitos numéricos (DNI Perú)
  const dniRegex = /^[0-9]{8}$/
  isValid.value = dniRegex.test(dni.value)
}

</script>

<style scoped>
.dni-validator {
  max-width: 300px;
  margin: 20px auto;
  font-family: sans-serif;
}
input {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  box-sizing: border-box;
}
</style>