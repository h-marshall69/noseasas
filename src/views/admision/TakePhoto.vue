<template>
    <div>
        <div class="space-y-6">

            <label class="text-center text-3xl font-bold text-gray-800"> <i
                    class="pi pi-camera mr-2 text-primary"></i>Toma de Fotos</label>

            <div class="space-y-4">
                <div class="relative rounded-lg border-2 border-gray-200 bg-black">
                    <video ref="videoElement" autoplay playsinline class="w-full h-auto rounded-md"></video>
                    <div v-if="loading"
                        class="absolute inset-0 flex items-center justify-center rounded-md bg-black bg-opacity-50">
                        <i class="pi pi-spin pi-spinner text-white" style="font-size: 3rem"></i>
                    </div>
                </div>

                <div>
                    <label for="camera-select" class="mb-2 block text-sm font-medium text-gray-700">Seleccionar
                        Cámara</label>
                    <Dropdown id="camera-select" v-model="selectedCamera" :options="videoDevices" optionLabel="label"
                        optionValue="deviceId" placeholder="Selecciona un dispositivo" @change="startCamera"
                        class="w-full" :disabled="videoDevices.length === 0" />
                </div>
            </div>

            <div>
                <label for="dni" class="mb-2 block text-sm font-medium text-gray-700">Número de DNI</label>
                <div class="p-inputgroup flex-1">
                    <span class="p-inputgroup-addon">
                        <i class="pi pi-id-card"></i>
                    </span>
                    <InputText id="dni" v-model="dni" @input="validateDNI" type="text" maxlength="8"
                        placeholder="Ej. 12345678" />
                </div>
                <small v-if="dni.length > 0" class="mt-2 block"
                    :class="{ 'text-green-600': isValid, 'text-red-600': !isValid }">
                    <span v-if="isValid">✓ DNI válido.</span>
                    <span v-else>✗ El DNI debe contener 8 dígitos numéricos.</span>
                </small>
            </div>

            <Button @click="uploadPhoto" :disabled="!isValid || loading" label="Tomar Foto"
                icon="pi pi-camera" class="w-full justify-center p-button-lg" :loading="loading" />

            <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from "axios";
import { useAdmisionStore } from '../../stores/useAdmisionStore';
import { makeFormData } from '../../abadeer_truco/utilities/FormDataMaker';

// Importaciones de Componentes PrimeVue
import Message from 'primevue/message';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';

const loading = ref(false)
const videoDevices = ref([])
const selectedCamera = ref(null)
const videoElement = ref(null)
const dni = ref("")
const error = ref('')
const permissionStatus = ref('')

const capturedImage = ref(null)
const isValid = ref(false)

// Función de validación de DNI
function validateDNI() {
    dni.value = dni.value.replace(/\D/g, '').slice(0, 8)
    isValid.value = /^[0-9]{8}$/.test(dni.value)
}

// Función para obtener y listar las cámaras disponibles
const getCameras = async () => {
    try {
        // Solicitar permiso para asegurar que la lista de dispositivos esté completa
        await navigator.mediaDevices.getUserMedia({ video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');

        // Mapear dispositivos para asegurar que siempre tengan una etiqueta visible
        videoDevices.value = cameras.map((device, index) => ({
            label: device.label || `Cámara ${index + 1}`,
            deviceId: device.deviceId
        }));

        if (videoDevices.value.length > 0) {
            // Seleccionar la primera cámara por defecto si no hay ninguna seleccionada
            if (!selectedCamera.value) {
                selectedCamera.value = videoDevices.value[0].deviceId;
            }
            await startCamera(); // Iniciar la cámara seleccionada
        } else {
            error.value = "No se encontraron cámaras disponibles.";
        }
    } catch (err) {
        console.error("Error al enumerar dispositivos:", err);
        if (err.name === 'NotAllowedError') {
            error.value = 'Acceso a la cámara denegado. Por favor, habilite los permisos en su navegador.';
        } else {
            error.value = 'No se pudo acceder a los dispositivos de video.';
        }
    }
};

// Función para iniciar el stream de la cámara
const startCamera = async () => {
    if (!selectedCamera.value) return; // No hacer nada si no hay cámara seleccionada

    loading.value = true;
    error.value = '';

    // Detener cualquier stream existente antes de iniciar uno nuevo
    if (videoElement.value && videoElement.value.srcObject) {
        videoElement.value.srcObject.getTracks().forEach(track => track.stop());
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: { exact: selectedCamera.value },
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
        error.value = 'La cámara no está lista para capturar la foto.';
        return false
    }

    const canvas = document.createElement('canvas')
    canvas.width = videoElement.value.videoWidth
    canvas.height = videoElement.value.videoHeight
    canvas.getContext('2d').drawImage(videoElement.value, 0, 0)
    capturedImage.value = canvas.toDataURL('image/jpeg')
    return true;
}


onMounted(async () => {
    await getCameras();
});

const uploadPhoto = async () => {
    if (!isValid.value) {
        error.value = 'Debe ingresar un DNI válido de 8 dígitos'
        return
    }

    if (!capturePhoto()) {
        return;
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