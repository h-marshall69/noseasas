<template>
  <div>
    <div v-if="loading">Cargando cámaras...</div>
    <div v-else>
      <label>Toma de Fotos</label>
      <video ref="videoElement" autoplay playsinline></video>
      <select v-model="selectedCamera" @change="startCamera">
        <option v-for="device in videoDevices" :key="device.deviceId" :value="device.deviceId">
          {{ device.label || 'Cámara ' + device.deviceId }}
        </option>
      </select>
      <input v-model="dni" placeholder="DNI Ej. 12345678" />
      <button @click="takePicture">Take Picture</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAdmisionStore } from '../../stores/useAdmisionStore';

const loading = ref(true)
const videoDevices = ref([])
const selectedCamera = ref(null)
const videoElement = ref(null)
const dni = ref("")

const getCameras = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices()
  videoDevices.value = devices.filter(device => device.kind === 'videoinput')
  if (videoDevices.value.length > 0) {
    selectedCamera.value = videoDevices.value[0].deviceId
    startCamera()
  }
  loading.value = false
}

const startCamera = async () => {
  if (!selectedCamera.value) return
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      deviceId: selectedCamera.value,
      width: { min: 1280, ideal: 1920 },
      height: { min: 720, ideal: 1080 }
    }
  })
  videoElement.value.srcObject = stream
}


onMounted(() => {
  getCameras()
})
</script>

<style scoped></style>
