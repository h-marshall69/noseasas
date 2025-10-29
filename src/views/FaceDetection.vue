<template>
  <div class="face-landmarker-container">
    <h2>MediaPipe Face Landmarker - Detección por Cascada</h2>

    <div class="controls">
      <button @click="startCamera" :disabled="isRunning">
        {{ isRunning ? 'Cámara Activa' : 'Iniciar Cámara' }}
      </button>
      <button @click="stopCamera" :disabled="!isRunning">
        Detener Cámara
      </button>
    </div>

    <div class="status-info">
      <p><strong>Estado:</strong> {{ status }}</p>
    </div>

    <!-- Validaciones en cascada -->
    <div v-if="isRunning" class="validation-cascade">
      <div class="validation-step" :class="{ 'active': faceCount > 0, 'passed': validations.faceDetected }">
        <span class="step-icon">{{ validations.faceDetected ? '✓' : '○' }}</span>
        <div class="step-info">
          <strong>1. Detección de rostro</strong>
          <p class="instruction-text">{{ faceCount > 0 ? `Rostro detectado (${faceCount})` : 'Esperando rostro...' }}</p>
        </div>
      </div>

      <div class="validation-step" :class="{ 'active': validations.faceDetected, 'passed': validations.facePresence }">
        <span class="step-icon">{{ validations.facePresence ? '✓' : '○' }}</span>
        <div class="step-info">
          <strong>2. Presencia facial</strong>
          <p class="instruction-text">Confianza: {{ validations.presenceScore }}%</p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: validations.presenceScore + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="validation-step" :class="{ 'active': validations.facePresence, 'passed': validations.faceTracking }">
        <span class="step-icon">{{ validations.faceTracking ? '✓' : '○' }}</span>
        <div class="step-info">
          <strong>3. Seguimiento estable</strong>
          <p class="instruction-text">Estabilidad: {{ validations.trackingScore }}%</p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: validations.trackingScore + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="validation-step" :class="{ 'active': validations.faceTracking, 'passed': validations.qualityCheck }">
        <span class="step-icon">{{ validations.qualityCheck ? '✓' : '○' }}</span>
        <div class="step-info">
          <strong>4. Calidad de imagen</strong>
          <p class="instruction-text">Calidad: {{ validations.qualityScore }}%</p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: validations.qualityScore + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="camera-wrapper">
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
        <div v-if="isRunning && !allValidationsPassed" class="overlay-message">
          {{ getCurrentInstruction() }}
        </div>
      </div>
    </div>

    <!-- Botón de captura solo cuando todas las validaciones pasen -->
    <div class="photo-controls" v-if="isRunning">
      <button
        @click="takePhoto"
        class="capture-btn"
        :disabled="!allValidationsPassed"
        :class="{ 'pulse': allValidationsPassed }"
      >
        📸 {{ allValidationsPassed ? 'Capturar Foto' : 'Validando...' }}
      </button>
      <p class="instruction-text" v-if="allValidationsPassed">
        ✅ Todas las validaciones completadas. Presiona para capturar
      </p>
      <p class="instruction-text" v-else>
        ⏳ Completa todas las validaciones para habilitar la captura
      </p>
    </div>

    <div v-if="capturedImage" class="captured-image">
      <h3>✅ Imagen Capturada con Éxito</h3>
      <img :src="capturedImage" alt="Foto capturada con landmarks" />
      <div class="capture-details">
        <p><strong>Detalles de captura:</strong></p>
        <p>• Caras detectadas: {{ captureDetails.faces }}</p>
        <p>• Confianza de presencia: {{ captureDetails.presence }}%</p>
        <p>• Confianza de seguimiento: {{ captureDetails.tracking }}%</p>
        <p>• Calidad: {{ captureDetails.quality }}%</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

// Refs
const videoRef = ref(null)
const canvasRef = ref(null)
const isRunning = ref(false)
const faceCount = ref(0)
const status = ref('Inicializando...')
const capturedImage = ref(null)

// Validaciones en cascada
const validations = ref({
  faceDetected: false,
  facePresence: false,
  faceTracking: false,
  qualityCheck: false,
  presenceScore: 0,
  trackingScore: 0,
  qualityScore: 0
})

// Detalles de captura
const captureDetails = ref({
  faces: 0,
  presence: 0,
  tracking: 0,
  quality: 0
})

// Variables para MediaPipe
let faceLandmarker = null
let animationFrameId = null
let lastVideoTime = -1

// Configuración de umbrales
const thresholds = {
  faceDetection: 0.5,
  facePresence: 0.7,
  faceTracking: 0.7,
  quality: 0.75
}

// Historial para estabilidad
let detectionHistory = []
const historySize = 30 // 30 frames para calcular estabilidad

// Computed
const allValidationsPassed = computed(() => {
  return validations.value.faceDetected &&
         validations.value.facePresence &&
         validations.value.faceTracking &&
         validations.value.qualityCheck
})

// Configuración
const modelPath = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

// Inicializar Face Landmarker
const initializeFaceLandmarker = async () => {
  try {
    status.value = 'Cargando modelo de IA...'

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
      minFaceDetectionConfidence: thresholds.faceDetection,
      minFacePresenceConfidence: thresholds.facePresence,
      minTrackingConfidence: thresholds.faceTracking,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true
    })

    status.value = '✓ Modelo cargado. Listo para iniciar'
    console.log('Face Landmarker inicializado')
  } catch (error) {
    console.error('Error inicializando Face Landmarker:', error)
    status.value = '❌ Error cargando modelo'
  }
}

// Iniciar cámara
const startCamera = async () => {
  try {
    status.value = 'Solicitando acceso a la cámara...'

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
      status.value = '🎥 Cámara activa - Iniciando validaciones...'
      resetValidations()
      predictWebcam()
    }
  } catch (error) {
    console.error('Error accediendo a la cámara:', error)
    status.value = '❌ Error: No se pudo acceder a la cámara'
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

  if (canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d')
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  }

  isRunning.value = false
  faceCount.value = 0
  status.value = '⏹ Cámara detenida'
  resetValidations()
}

// Resetear validaciones
const resetValidations = () => {
  validations.value = {
    faceDetected: false,
    facePresence: false,
    faceTracking: false,
    qualityCheck: false,
    presenceScore: 0,
    trackingScore: 0,
    qualityScore: 0
  }
  detectionHistory = []
}

// Función principal de predicción
const predictWebcam = () => {
  if (!faceLandmarker || !videoRef.value || !canvasRef.value) return

  const video = videoRef.value
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')

  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
  }

  const startTimeMs = performance.now()

  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime

    const results = faceLandmarker.detectForVideo(video, startTimeMs)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      faceCount.value = results.faceLandmarks.length

      // Validación en cascada
      performCascadeValidation(results)

      // Dibujar landmarks
      drawLandmarks(ctx, results.faceLandmarks)

      // Agregar a historial
      addToHistory(results)
    } else {
      faceCount.value = 0
      resetValidations()
    }
  }

  if (isRunning.value) {
    animationFrameId = requestAnimationFrame(predictWebcam)
  }
}

// Validación en cascada
const performCascadeValidation = (results) => {
  // 1. Detección de rostro
  validations.value.faceDetected = results.faceLandmarks.length > 0

  if (!validations.value.faceDetected) {
    validations.value.facePresence = false
    validations.value.faceTracking = false
    validations.value.qualityCheck = false
    return
  }

  // 2. Presencia facial (simulada con calidad de landmarks)
  const presenceScore = calculatePresenceScore(results.faceLandmarks[0])
  validations.value.presenceScore = Math.round(presenceScore * 100)
  validations.value.facePresence = presenceScore >= thresholds.facePresence

  if (!validations.value.facePresence) {
    validations.value.faceTracking = false
    validations.value.qualityCheck = false
    return
  }

  // 3. Seguimiento estable
  const trackingScore = calculateTrackingStability()
  validations.value.trackingScore = Math.round(trackingScore * 100)
  validations.value.faceTracking = trackingScore >= thresholds.faceTracking

  if (!validations.value.faceTracking) {
    validations.value.qualityCheck = false
    return
  }

  // 4. Calidad de imagen
  const qualityScore = calculateQualityScore(results.faceLandmarks[0])
  validations.value.qualityScore = Math.round(qualityScore * 100)
  validations.value.qualityCheck = qualityScore >= thresholds.quality
}

// Calcular score de presencia (basado en visibilidad de landmarks clave)
const calculatePresenceScore = (landmarks) => {
  // Verificar landmarks clave: ojos, nariz, boca
  const keyPoints = [
    33, 263,  // Ojos externos
    61, 291,  // Comisuras de labios
    1,        // Punta de nariz
    10        // Centro de frente
  ]

  let visibleCount = 0
  keyPoints.forEach(idx => {
    if (landmarks[idx] && landmarks[idx].visibility !== undefined) {
      visibleCount += landmarks[idx].visibility || 0.8
    } else {
      visibleCount += 0.8 // Asumimos visible si no hay info
    }
  })

  return visibleCount / keyPoints.length
}

// Calcular estabilidad de seguimiento
const calculateTrackingStability = () => {
  if (detectionHistory.length < 10) return 0.5

  // Calcular varianza en las últimas detecciones
  const recentHistory = detectionHistory.slice(-20)
  const positions = recentHistory.map(h => h.position)

  if (positions.length < 2) return 0.5

  let totalVariance = 0
  for (let i = 1; i < positions.length; i++) {
    const dx = positions[i].x - positions[i-1].x
    const dy = positions[i].y - positions[i-1].y
    totalVariance += Math.sqrt(dx * dx + dy * dy)
  }

  const avgVariance = totalVariance / (positions.length - 1)

  // Menor varianza = mayor estabilidad
  const stability = Math.max(0, 1 - (avgVariance * 50))
  return Math.min(1, stability)
}

// Calcular calidad general
const calculateQualityScore = (landmarks) => {
  // Verificar que todos los landmarks importantes estén presentes
  const totalLandmarks = landmarks.length
  const expectedLandmarks = 468 // MediaPipe Face Mesh

  const completeness = totalLandmarks / expectedLandmarks

  // Verificar que la cara esté centrada y de buen tamaño
  const centerX = landmarks[1]?.x || 0.5
  const centerY = landmarks[1]?.y || 0.5

  const centerScore = 1 - Math.abs(centerX - 0.5) - Math.abs(centerY - 0.5)

  return (completeness * 0.5 + centerScore * 0.5)
}

// Agregar a historial
const addToHistory = (results) => {
  if (results.faceLandmarks && results.faceLandmarks.length > 0) {
    const noseTip = results.faceLandmarks[0][1]
    detectionHistory.push({
      timestamp: Date.now(),
      position: { x: noseTip.x, y: noseTip.y }
    })

    if (detectionHistory.length > historySize) {
      detectionHistory.shift()
    }
  }
}

// Obtener instrucción actual
const getCurrentInstruction = () => {
  if (!validations.value.faceDetected) {
    return '👤 Posiciona tu rostro frente a la cámara'
  }
  if (!validations.value.facePresence) {
    return '📍 Acércate más a la cámara'
  }
  if (!validations.value.faceTracking) {
    return '🎯 Mantén tu rostro estable'
  }
  if (!validations.value.qualityCheck) {
    return '✨ Centra tu rostro y mantén la posición'
  }
  return '✅ Perfecto! Puedes capturar la foto'
}

// Dibujar landmarks faciales
const drawLandmarks = (ctx, landmarks) => {
  const color = allValidationsPassed.value ? '#00FF00' : '#FFA500'
  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineWidth = 1

  landmarks.forEach(faceLandmarks => {
    // Dibujar puntos
    faceLandmarks.forEach(landmark => {
      ctx.beginPath()
      ctx.arc(
        landmark.x * canvasRef.value.width,
        landmark.y * canvasRef.value.height,
        1.5,
        0,
        2 * Math.PI
      )
      ctx.fill()
    })

    // Dibujar contorno facial
    const faceOval = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]

    ctx.beginPath()
    faceOval.forEach((index, i) => {
      if (faceLandmarks[index]) {
        const x = faceLandmarks[index].x * canvasRef.value.width
        const y = faceLandmarks[index].y * canvasRef.value.height
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
    })
    ctx.closePath()
    ctx.stroke()
  })
}

// Capturar foto
const takePhoto = () => {
  if (!canvasRef.value || !videoRef.value || !allValidationsPassed.value) return

  const tempCanvas = document.createElement('canvas')
  const video = videoRef.value
  const canvas = canvasRef.value

  tempCanvas.width = canvas.width
  tempCanvas.height = canvas.height

  const ctx = tempCanvas.getContext('2d')

  ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height)
  ctx.drawImage(canvas, 0, 0)

  capturedImage.value = tempCanvas.toDataURL('image/png')

  // Guardar detalles de captura
  captureDetails.value = {
    faces: faceCount.value,
    presence: validations.value.presenceScore,
    tracking: validations.value.trackingScore,
    quality: validations.value.qualityScore
  }

  console.log('Foto capturada exitosamente con validaciones:', captureDetails.value)
}

// Ciclo de vida
onMounted(() => {
  initializeFaceLandmarker()
})

onUnmounted(() => {
  stopCamera()
})
</script>

<style scoped>
.face-landmarker-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 20px 0;
}

.controls button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.controls button:hover:not(:disabled) {
  background-color: #0056b3;
}

.controls button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.status-info {
  text-align: center;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 20px 0;
}

.status-info p {
  margin: 0;
  color: #495057;
}

.validation-cascade {
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.validation-step {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  margin: 10px 0;
  border-radius: 6px;
  background-color: #f8f9fa;
  opacity: 0.5;
  transition: all 0.3s;
}

.validation-step.active {
  opacity: 1;
  background-color: #fff3cd;
}

.validation-step.passed {
  background-color: #d4edda;
  opacity: 1;
}

.step-icon {
  font-size: 24px;
  margin-right: 15px;
  color: #6c757d;
  min-width: 30px;
  text-align: center;
}

.validation-step.passed .step-icon {
  color: #28a745;
  font-weight: bold;
}

.step-info {
  flex: 1;
}

.step-info strong {
  display: block;
  margin-bottom: 5px;
  color: #333;
}

.instruction-text {
  margin: 5px 0;
  color: #6c757d;
  font-size: 13px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
}

.progress-fill {
  height: 100%;
  background-color: #007bff;
  transition: width 0.3s, background-color 0.3s;
}

.validation-step.passed .progress-fill {
  background-color: #28a745;
}

.camera-wrapper {
  margin: 20px 0;
}

.camera-container {
  position: relative;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
}

.camera-feed {
  width: 100%;
  height: auto;
  display: block;
}

.overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.overlay-message {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 12px 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.photo-controls {
  text-align: center;
  margin: 30px 0;
}

.capture-btn {
  padding: 15px 40px;
  border: none;
  border-radius: 8px;
  background-color: #6c757d;
  color: white;
  cursor: not-allowed;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
}

.capture-btn:not(:disabled) {
  background-color: #28a745;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.capture-btn:not(:disabled):hover {
  background-color: #218838;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0,0,0,0.15);
}

.capture-btn.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 6px rgba(40, 167, 69, 0.3);
  }
  50% {
    box-shadow: 0 4px 20px rgba(40, 167, 69, 0.6);
  }
}

.captured-image {
  margin: 30px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.captured-image h3 {
  color: #28a745;
  margin-top: 0;
}

.captured-image img {
  max-width: 100%;
  border: 2px solid #28a745;
  border-radius: 8px;
  margin: 15px 0;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.capture-details {
  text-align: left;
  max-width: 400px;
  margin: 20px auto;
  padding: 15px;
  background-color: white;
  border-radius: 6px;
  border-left: 4px solid #28a745;
}

.capture-details p {
  margin: 8px 0;
  color: #495057;
  font-size: 14px;
}
</style>
