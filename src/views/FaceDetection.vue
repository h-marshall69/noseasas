<template>
  <div class="face-landmarker-container">
    <h2>MediaPipe Face Landmarker con Vue.js</h2>

    <div class="controls">
      <button @click="startCamera" :disabled="isRunning">
        {{ isRunning ? 'Cámara Activa' : 'Iniciar Cámara' }}
      </button>
      <button @click="stopCamera" :disabled="!isRunning">
        Detener Cámara
      </button>
      <button @click="takePhoto" :disabled="!isRunning">
        Capturar Foto
      </button>
    </div>

    <div class="camera-container">
      <video
        ref="videoRef"
        autoplay
        playsinline
        class="camera-feed"
      ></video>
      <canvas
        ref="canvasRef"
        class="overlay-canvas"
      ></canvas>
    </div>

    <div v-if="capturedImage" class="captured-image">
      <h3>Imagen Capturada:</h3>
      <img :src="capturedImage" alt="Captured with landmarks" />
    </div>

    <div class="results">
      <h3>Resultados:</h3>
      <p>Caras detectadas: {{ faceCount }}</p>
      <p>Estado: {{ status }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

// Refs
const videoRef = ref(null)
const canvasRef = ref(null)
const isRunning = ref(false)
const faceCount = ref(0)
const status = ref('Inicializando...')
const capturedImage = ref(null)

// Variables para MediaPipe
let faceLandmarker = null
let animationFrameId = null
let lastVideoTime = -1

// Configuración
const modelPath = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

// Inicializar Face Landmarker
const initializeFaceLandmarker = async () => {
  try {
    status.value = 'Cargando modelo...'

    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    )

    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: modelPath,
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numFaces: 1,
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    })

    status.value = 'Modelo cargado correctamente'
    console.log('Face Landmarker inicializado')
  } catch (error) {
    console.error('Error inicializando Face Landmarker:', error)
    status.value = 'Error cargando modelo'
  }
}

// Iniciar cámara
const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: 640,
        height: 480,
        facingMode: 'user'
      }
    })

    if (videoRef.value) {
      videoRef.value.srcObject = stream
      await videoRef.value.play()
      isRunning.value = true
      status.value = 'Cámara activa - Detectando rostros...'
      predictWebcam()
    }
  } catch (error) {
    console.error('Error accediendo a la cámara:', error)
    status.value = 'Error accediendo a la cámara'
  }
}

// Detener cámara
const stopCamera = () => {
  if (videoRef.value && videoRef.value.srcObject) {
    const tracks = videoRef.value.srcObject.getTracks()
    tracks.forEach(track => track.stop())
    videoRef.value.srcObject = null
  }

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  isRunning.value = false
  faceCount.value = 0
  status.value = 'Cámara detenida'
}

// Función principal de predicción
const predictWebcam = () => {
  if (!faceLandmarker || !videoRef.value || !canvasRef.value) return

  const video = videoRef.value
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')

  // Configurar canvas con las dimensiones del video
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  const startTimeMs = performance.now()

  // Solo procesar si el video ha avanzado
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime

    const results = faceLandmarker.detectForVideo(video, startTimeMs)

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Dibujar el video
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Procesar resultados
    if (results.faceLandmarks) {
      faceCount.value = results.faceLandmarks.length

      // Dibujar landmarks
      drawLandmarks(ctx, results.faceLandmarks)

      // Dibujar bounding boxes
      if (results.faceBlendshapes) {
        drawBoundingBox(ctx, results.faceBlendshapes)
      }
    } else {
      faceCount.value = 0
    }
  }

  if (isRunning.value) {
    animationFrameId = requestAnimationFrame(predictWebcam)
  }
}

// Dibujar landmarks faciales
const drawLandmarks = (ctx, landmarks) => {
  ctx.strokeStyle = '#00FF00'
  ctx.fillStyle = '#00FF00'
  ctx.lineWidth = 1

  landmarks.forEach(faceLandmarks => {
    faceLandmarks.forEach(landmark => {
      ctx.beginPath()
      ctx.arc(landmark.x * canvasRef.value.width, landmark.y * canvasRef.value.height, 2, 0, 2 * Math.PI)
      ctx.fill()
    })
  })
}

// Dibujar bounding box
const drawBoundingBox = (ctx, blendshapes) => {
  if (!blendshapes || blendshapes.length === 0) return

  // Ejemplo simple de bounding box (puedes mejorarlo según tus necesidades)
  ctx.strokeStyle = '#FF0000'
  ctx.lineWidth = 2
  ctx.strokeRect(50, 50, canvasRef.value.width - 100, canvasRef.value.height - 100)
}

// Capturar foto
const takePhoto = () => {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  capturedImage.value = canvas.toDataURL('image/png')
}

// Ciclo de vida del componente
onMounted(() => {
  initializeFaceLandmarker()
})

onUnmounted(() => {
  stopCamera()
})
</script>

<style scoped>
.face-landmarker-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.controls {
  margin: 20px 0;
}

.controls button {
  margin: 0 10px 10px 0;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

.controls button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.camera-container {
  position: relative;
  width: 100%;
  max-width: 640px;
  margin: 20px 0;
}

.camera-feed, .overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
  border: 2px solid #ddd;
  border-radius: 8px;
}

.captured-image {
  margin: 20px 0;
}

.captured-image img {
  max-width: 100%;
  border: 2px solid #ddd;
  border-radius: 8px;
}

.results {
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.results h3 {
  margin-top: 0;
}
</style>
