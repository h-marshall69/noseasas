<template>
    <div>
        <label>Toma de Fotos</label>
        <video ref="videoElement" autoplay playsinline></video>
        <select v-model="selectedCamera" @change="startCamera">
            <option v-for="device in videoDevices" :key="device.deviceId" :value="device.deviceId">
                {{ device.label || 'Cámara ' + device.deviceId }}
            </option>
        </select>

        <div class="dni-container">
            <label for="dni" class="dni-label">Ingrese su DNI:</label>
            <input id="dni" v-model="dni" @input="validateDNI" type="text" maxlength="8" placeholder="Ej. 12345678"
                class="dni-input" />
            <div class="validation-message" v-if="dni.length > 0">
                <span v-if="isValid" class="valid">DNI válido</span>
                <span v-else class="invalid">DNI debe tener 8 dígitos</span>
            </div>
        </div>

        <div>
            <button @click="uploadPhoto" :disabled="!isValid" class="styled-button">
                <i class="pi pi-camera"></i>
                Take Picture
            </button>
        </div>

        <div v-if="error" class="error">
            Error: {{ error }}
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from "axios";
import { useAdmisionStore } from '../../stores/useAdmisionStore';
import { makeFormData } from '../../abadeer_truco/utilities/FormDataMaker';

const loading = ref(false)
const videoDevices = ref([])
const stream = ref(null)
const selectedCamera = ref(null)
const videoElement = ref(null)
const dni = ref("")
const error = ref('')
const permissionStatus = ref('')

const capturedImage = ref(null)

const isValid = ref(false)
function validateDNI() {
    dni.value = dni.value.replace(/\D/g, '').slice(0, 8)
    isValid.value = /^[0-9]{8}$/.test(dni.value)
}

const startCamera = async () => {
    loading.value = true
    error.value = ''
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: selectedCamera.value,
                width: { min: 1280, ideal: 1920 },
                height: { min: 720, ideal: 1080 }
            }
        })
        videoElement.value.srcObject = stream
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
    }
    finally {
        loading.value = false
    }
}

const capturePhoto = () => {
    if (!videoElement.value || videoElement.value.readyState !== 4) {
        error.value = 'La cámara no está lista'
        return false
    }

    const canvas = document.createElement('canvas')
    canvas.width = videoElement.value.videoWidth
    canvas.height = videoElement.value.videoHeight
    canvas.getContext('2d').drawImage(videoElement.value, 0, 0)
    capturedImage.value = canvas.toDataURL('image/jpeg')
}


onMounted(async () => {
    // await getCameras()
    await startCamera()
})

const uploadPhoto = async () => {
    if (!isValid.value) {
        error.value = 'Debe ingresar un DNI válido de 8 dígitos'
        return
    }

    if (!capturedImage.value) {
        capturePhoto()
    }

    loading.value = true
    error.value = ''

    try {
        const formData = makeFormData({
            imageString: capturedImage.value,
            dni: dni.value,
            codes: ["00000000-0000-0000-0000-000000000000"]
        });

        const response = await axios.post("http://localhost:8000/api/tomar_fotos", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        console.log("Respuesta del servidor:", response.data);
        capturedImage.value = null
    } catch (error) {
        console.error("Error al subir la foto:", error);
        error.value = 'Error al subir la foto: ' + err.message
    } finally {
        loading.value = false
    }
};
</script>

<style scoped></style>