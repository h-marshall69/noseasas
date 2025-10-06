<template>
    <div>

        <button @click="requestCameraPermission" :disabled="isLoading">
            {{ isLoading ? 'Solicitando...' : 'Activar Cámara' }}
        </button>

        <div v-if="permissionStatus">
            <p>Estado del permiso: <strong>{{ permissionStatus }}</strong></p>
        </div>

        <div v-if="stream">
            <video ref="videoElement" autoplay playsinline webkit-playsinline muted hidden></video>
            <select v-model="selectedCamera" @change="startCamera">
                <option v-for="device in videoDevices" :key="device.deviceId" :value="device.deviceId">
                    {{ device.label || 'Cámara ' + device.deviceId }}
                </option>
            </select>
        </div>

        <div class="dni-container">
            <label for="dni" class="dni-label">Ingrese su DNI:</label>
            <input id="dni" v-model="dni" @input="validateDNI" placeholder="Ej. 12345678" type="number"
                class="dni-input" />
            <div class="validation-message" v-if="dni.length > 0">
                <span v-if="isValid" class="valid">✅ DNI válido</span>
                <span v-else class="invalid">❌ DNI debe tener 8 dígitos</span>
            </div>
        </div>

        <div v-if="error" class="error">
            Error: {{ error }}
        </div>
    </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

const video = ref(null)
const stream = ref(null)
const permissionStatus = ref('')
const isLoading = ref(false)
const error = ref('')



const requestCameraPermission = async () => {
    isLoading.value = true
    error.value = ''

    try {
        // Solicitar permiso de cámara
        stream.value = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        })

        // Mostrar el video en el elemento
        if (video.value) {
            video.value.srcObject = stream.value
        }

        permissionStatus.value = 'concedido'

    } catch (err) {
        console.error('Error al acceder a la cámara:', err)
        error.value = err.message
        permissionStatus.value = 'denegado'

        // Manejar diferentes tipos de errores
        if (err.name === 'NotAllowedError') {
            error.value = 'Permiso de cámara denegado por el usuario'
        } else if (err.name === 'NotFoundError') {
            error.value = 'No se encontró ninguna cámara'
        } else if (err.name === 'NotSupportedError') {
            error.value = 'El navegador no soporta acceso a cámara'
        }
    } finally {
        isLoading.value = false
    }
}

const stopCamera = () => {
    if (stream.value) {
        stream.value.getTracks().forEach(track => track.stop())
        stream.value = null
        permissionStatus.value = 'detenido'

        if (video.value) {
            video.value.srcObject = null
        }
    }
}

// Limpiar al desmontar el componente
onUnmounted(() => {
    stopCamera()
})
</script>

<style scoped></style>