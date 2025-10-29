<template>
    <div class="face-detection">
        <h1>🪄 Detección de Landmarks Faciales con MediaPipe</h1>
        <button v-if="!webcamRunning" @click="enableCam" class="btn-start" :disabled="loading">
            {{ loading ? 'Cargando...' : '🚀 Activar Cámara' }}
        </button>
        <div v-else class="video-container">
            <video ref="video" autoplay playsinline class="video"></video>
            <canvas ref="canvas" class="canvas"></canvas>
        </div>
        <div v-if="results" class="info">
            <p>👤 Rostros detectados: {{ results.faceLandmarks?.length || 0 }}</p>
            <p>😀 Expresión principal: {{ getMainBlendshape() }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import {
    FaceLandmarker,
    FilesetResolver,
    DrawingUtils
} from '@mediapipe/tasks-vision'

const video = ref()
const canvas = ref()
const canvasCtx = ref()
const loading = ref(true)
const webcamRunning = ref(false)
const results = ref(null)

let faceLandmarker = null
let animationFrameId = null

// Configuración del modelo
const createFaceLandmarker = async () => {
    const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    )
    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: 'GPU' // Usa GPU si disponible
        },
        outputFaceBlendshapes: true,
        runningMode: 'VIDEO',
        numFaces: 1
    })
    loading.value = false
}

// Activar cámara
const enableCam = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 }
        })
        video.value.srcObject = stream
        await nextTick()
        video.value.onloadedmetadata = () => predictWebcam()
        webcamRunning.value = true
    } catch (err) {
        console.error('Error al acceder a la cámara:', err)
    }
}

// Bucle de predicción en tiempo real
const predictWebcam = () => {
    if (!faceLandmarker || !webcamRunning.value) return

    const startTimeMs = performance.now()
    results.value = faceLandmarker.detectForVideo(video.value, startTimeMs)

    // Configurar canvas al tamaño del video
    canvas.value.width = video.value.videoWidth
    canvas.value.height = video.value.videoHeight

    canvasCtx.value.save()
    canvasCtx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
    canvasCtx.value.drawImage(
        video.value,
        0, 0,
        canvas.value.width,
        canvas.value.height
    )

    // Dibujar landmarks si hay rostros
    if (results.value.faceLandmarks) {
        const drawingUtils = new DrawingUtils(canvasCtx.value)
        for (const landmarks of results.value.faceLandmarks) {
            // Contorno facial (ovalado)
            drawingUtils.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
                { color: '#E0E0E0', lineWidth: 2 }
            )
            // Labios
            drawingUtils.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_LIPS,
                { color: '#E0E0E0', lineWidth: 1 }
            )
            // Ojos derechos
            drawingUtils.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
                { color: '#FF3030' }
            )
            drawingUtils.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
                { color: '#FF3030' }
            )
            drawingUtils.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
                { color: '#FF3030' }
            )
            // Ojos izquierdos
            drawingUtils.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
                { color: '#30FF30' }
            )
            drawingUtils.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
                { color: '#30FF30' }
            )
            drawingUtils.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
                { color: '#30FF30' }
            )
            // Malla completa (opcional, ligera)
            drawingUtils.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_TESSELATION,
                { color: '#C0C0C070', lineWidth: 1 }
            )
        }
    }

    canvasCtx.value.restore()
    animationFrameId = requestAnimationFrame(predictWebcam)
}

// Obtener expresión principal
const getMainBlendshape = () => {
    if (!results.value?.faceBlendshapes?.[0]) return 'Ninguna'
    const max = results.value.faceBlendshapes[0].reduce((prev, curr, i) =>
        curr.score > prev.score ? curr : prev
    )
    return max.categoryName
}

onMounted(async () => {
    await createFaceLandmarker()
})

onUnmounted(() => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
})
</script>

<style scoped>
.face-detection {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
}

.btn-start {
    background: #007f8b;
    color: white;
    border: none;
    padding: 15px 30px;
    font-size: 18px;
    border-radius: 8px;
    cursor: pointer;
    margin-bottom: 20px;
}

.btn-start:hover:not(:disabled) {
    background: #005f66;
}

.btn-start:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.video-container {
    position: relative;
    width: 640px;
    height: 480px;
    margin: 0 auto;
    border: 2px solid #007f8b;
    border-radius: 12px;
    overflow: hidden;
}

.video,
.canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.video {
    transform: scaleX(-1);
    /* Voltear horizontal para selfie */
}

.canvas {
    transform: scaleX(-1);
}

.info {
    margin-top: 20px;
    padding: 15px;
    background: #f0f8ff;
    border-radius: 8px;
    text-align: center;
}
</style>