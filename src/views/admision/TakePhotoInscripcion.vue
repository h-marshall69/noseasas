<template>
    <div>
        <!-- Recuadro donde irá la cámara -->
        <div class="camera-box">
            <video ref="video" autoplay playsinline muted class="camera-video"></video>

            <!-- Si el autoplay falla, mostramos botón para forzar inicio -->
            <div v-if="needsUserStart" class="start-overlay">
                <button @click="manualStart" class="start-button">Iniciar cámara</button>
                <p class="hint">Haz click si la cámara no se activa automáticamente.</p>
            </div>

            <div v-if="error" class="error-overlay">
                <p>Error: {{ error }}</p>
            </div>
        </div>

        <!-- Campo DNI Mejorado -->
        <div class="dni-container">
            <label for="dni" class="dni-label">Ingrese su DNI:</label>
            <input id="dni" v-model="dni" @input="validateDNI" placeholder="Ej. 12345678" type="text" class="dni-input"
                maxlength="8" inputmode="numeric" />
            <div class="validation-message" v-if="dni.length > 0">
                <span v-if="isValid" class="valid">✅ DNI válido</span>
                <span v-else class="invalid">❌ DNI debe tener 8 dígitos</span>
            </div>
        </div>

        <!-- Botón de captura -->
        <div class="button-container">
            <button @click="TakePicture" class="capture-button" :disabled="!isValid || !!error">
                <i class="pi pi-camera"></i>
                Take Picture
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const video = ref(null)
const localStream = ref(null)
const needsUserStart = ref(false)
const error = ref('')
const dni = ref('')
const isValid = ref(false)

// Opcional: permite elegir cámara si lo quieres en el futuro
// const videoDevices = ref([])
// const selectedDevice = ref(null)

async function startCamera(auto = true) {
    error.value = ''
    needsUserStart.value = false

    try {
        // Intentamos cámara frontal por defecto
        const constraints = { video: { facingMode: 'user' }, audio: false }

        // Si necesitas deviceId específico (multi cámara), usa enumerateDevices() y deviceId exact
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        // detén stream previo si hubiera
        stopStream()
        localStream.value = stream

        if (video.value) {
            video.value.srcObject = stream
            // try play; si falla, requerirá interacción del usuario
            try {
                await video.value.play()
                needsUserStart.value = false
            } catch (e) {
                // autoplay bloqueado por el navegador -> mostrar botón para iniciar manualmente
                needsUserStart.value = true
            }
        }
    } catch (e) {
        console.error('startCamera error:', e)
        error.value = 'No se pudo acceder a la cámara. Revisa permisos o ejecuta en localhost/HTTPS.'
    }
}

function manualStart() {
    // Forzamos play (el stream ya fue asignado a video.srcObject)
    if (!video.value) return
    video.value.play()
        .then(() => { needsUserStart.value = false })
        .catch(err => {
            console.warn('manualStart play error:', err)
            error.value = 'No se pudo iniciar la reproducción. Revisa los permisos.'
        })
}

function stopStream() {
    if (localStream.value) {
        localStream.value.getTracks().forEach(t => t.stop())
        localStream.value = null
    }
}

// captura frame actual creando un canvas temporal
function TakePicture() {
    if (!video.value) {
        console.error('Video no inicializado')
        return
    }
    if (!isValid.value) {
        console.warn('DNI inválido — deshabilitado')
        return
    }

    const v = video.value
    const w = v.videoWidth || 640
    const h = v.videoHeight || 480
    const tmp = document.createElement('canvas')
    tmp.width = w
    tmp.height = h
    const ctx = tmp.getContext('2d')
    try {
        ctx.drawImage(v, 0, 0, w, h)
        const dataUrl = tmp.toDataURL('image/png')
        // descarga local
        const link = document.createElement('a')
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        link.download = `vue-cam-${timestamp}.png`
        link.href = dataUrl
        link.click()

        // Aquí puedes enviar dataUrl y dni al servidor (FormData, axios, etc.)
        // uploadToServer(dataUrl, dni.value)
    } catch (e) {
        console.error('TakePicture error:', e)
        error.value = 'Error al capturar la imagen.'
    }
}

function validateDNI() {
    dni.value = dni.value.replace(/\D/g, '').slice(0, 8)
    isValid.value = /^[0-9]{8}$/.test(dni.value)
}

onMounted(async () => {
    // Inicia al montar
    // Nota: algunos navegadores exigirán interacción para reproducir video (autoplay policy).
    await startCamera()
})

onBeforeUnmount(() => {
    stopStream()
})
</script>

<style scoped>
.camera-box {
    width: 400px;
    height: 400px;
    margin: 0 auto 16px auto;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
}

.camera-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* overlay cuando se necesita un click para iniciar */
.start-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.35);
    color: white;
    text-align: center;
    padding: 12px;
}

.start-button {
    background: var(--primary-500);
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
}

.hint {
    font-size: 12px;
    opacity: 0.9;
    margin-top: 4px;
}

.error-overlay {
    position: absolute;
    bottom: 8px;
    left: 8px;
    right: 8px;
    background: rgba(255, 0, 0, 0.08);
    color: #fff;
    padding: 8px;
    border-radius: 6px;
    font-size: 13px;
    text-align: center;
}

/* DNI y botón — mantengo tu estilo */
.dni-container {
    max-width: 320px;
    margin: 8px auto 0 auto;
    font-family: inherit;
}

.dni-label {
    display: block;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 8px;
    font-size: 14px;
}

.dni-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid var(--surface-300);
    border-radius: 8px;
    font-size: 16px;
    background: var(--surface-0);
    transition: all 0.3s ease;
    box-sizing: border-box;
}

.dni-input:focus {
    outline: none;
    border-color: var(--primary-500);
    box-shadow: 0 0 0 3px var(--primary-100);
}

.validation-message {
    margin-top: 8px;
    font-size: 14px;
    font-weight: 500;
}

.valid {
    color: var(--green-500);
}

.invalid {
    color: var(--red-500);
}

.button-container {
    display: flex;
    justify-content: center;
    padding: 20px 0;
}

.capture-button {
    background: var(--primary-500);
    color: white;
    border: none;
    padding: 14px 28px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.capture-button:disabled {
    background: var(--surface-300);
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
}
</style>
