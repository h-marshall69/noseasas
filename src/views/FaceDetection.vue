<template>
  <div class="face-landmarker-container">
    <h2>MediaPipe Face Landmarker - Sistema de Validación Facial</h2>

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
      <p><strong>Frame Rate:</strong> {{ frameRate }} fps</p>
    </div>

    <!-- Validaciones en cascada -->
    <div v-if="isRunning" class="validation-cascade">
      <div class="validation-step" :class="{ 'active': faceCount > 0, 'passed': validations.faceDetected }">
        <span class="step-icon">{{ validations.faceDetected ? '✓' : '○' }}</span>
        <div class="step-info">
          <strong>1. Detección de rostro</strong>
          <p class="instruction-text">{{ faceCount > 0 ? `Rostro detectado (${faceCount})` : 'Esperando rostro...' }}</p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: faceDetectionProgress + '%' }"></div>
          </div>
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

      <!-- Nueva validación creativa: Rostro limpio -->
      <div class="validation-step" :class="{ 'active': validations.qualityCheck, 'passed': validations.faceClean }">
        <span class="step-icon">{{ validations.faceClean ? '✓' : '○' }}</span>
        <div class="step-info">
          <strong>5. Verificación de rostro limpio</strong>
          <p class="instruction-text">Limpieza: {{ validations.cleanScore }}%</p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: validations.cleanScore + '%' }"></div>
          </div>
          <div class="clean-indicators">
            <span class="clean-indicator" :class="{ 'good': cleanIndicators.eyes }">👁️ Ojos</span>
            <span class="clean-indicator" :class="{ 'good': cleanIndicators.nose }">👃 Nariz</span>
            <span class="clean-indicator" :class="{ 'good': cleanIndicators.mouth }">👄 Boca</span>
            <span class="clean-indicator" :class="{ 'good': cleanIndicators.cheeks }">😊 Mejillas</span>
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
        <div v-if="isRunning" class="face-stats">
          <div>Estabilidad: {{ Math.round(stabilityScore * 100) }}%</div>
          <div>Movimiento: {{ Math.round(movementScore * 100) }}%</div>
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
        <p>• Limpieza facial: {{ captureDetails.clean }}%</p>
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
const frameRate = ref(0)

// Validaciones en cascada
const validations = ref({
  faceDetected: false,
  facePresence: false,
  faceTracking: false,
  qualityCheck: false,
  faceClean: false,
  presenceScore: 0,
  trackingScore: 0,
  qualityScore: 0,
  cleanScore: 0
})

// Indicadores de limpieza
const cleanIndicators = ref({
  eyes: false,
  nose: false,
  mouth: false,
  cheeks: false
})

// Detalles de captura
const captureDetails = ref({
  faces: 0,
  presence: 0,
  tracking: 0,
  quality: 0,
  clean: 0
})

// Variables para MediaPipe
let faceLandmarker = null
let animationFrameId = null
let lastVideoTime = -1
let frameCount = 0
let lastFpsUpdate = 0

// Configuración de umbrales
const thresholds = {
  faceDetection: 0.5,
  facePresence: 0.7,
  faceTracking: 0.7,
  quality: 0.75,
  faceClean: 0.8,
  stability: 0.8,
  minFramesForValidation: 15
}

// Historial para estabilidad
let detectionHistory = []
const historySize = 30
let stabilityScore = ref(0)
let movementScore = ref(0)

// Computed
const allValidationsPassed = computed(() => {
  return validations.value.faceDetected &&
         validations.value.facePresence &&
         validations.value.faceTracking &&
         validations.value.qualityCheck &&
         validations.value.faceClean
})

const faceDetectionProgress = computed(() => {
  return validations.value.faceDetected ? 100 : Math.min((detectionHistory.length / 5) * 100, 80)
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
      frameCount = 0
      lastFpsUpdate = performance.now()
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
    faceClean: false,
    presenceScore: 0,
    trackingScore: 0,
    qualityScore: 0,
    cleanScore: 0
  }
  detectionHistory = []
  stabilityScore.value = 0
  movementScore.value = 0
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

  // Calcular FPS
  frameCount++
  const now = performance.now()
  if (now - lastFpsUpdate >= 1000) {
    frameRate.value = Math.round((frameCount * 1000) / (now - lastFpsUpdate))
    frameCount = 0
    lastFpsUpdate = now
  }

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

// Validación en cascada mejorada
const performCascadeValidation = (results) => {
  // 1. Detección de rostro - más estricta
  validations.value.faceDetected = results.faceLandmarks.length > 0 &&
                                  detectionHistory.length >= 3

  if (!validations.value.faceDetected) {
    resetSubsequentValidations()
    return
  }

  // 2. Presencia facial mejorada
  const presenceScore = calculateEnhancedPresenceScore(results.faceLandmarks[0])
  validations.value.presenceScore = Math.round(presenceScore * 100)
  validations.value.facePresence = presenceScore >= thresholds.facePresence &&
                                  detectionHistory.length >= 5

  if (!validations.value.facePresence) {
    resetSubsequentValidations(['faceTracking', 'qualityCheck', 'faceClean'])
    return
  }

  // 3. Seguimiento estable mejorado
  const trackingScore = calculateEnhancedTrackingStability()
  validations.value.trackingScore = Math.round(trackingScore * 100)
  validations.value.faceTracking = trackingScore >= thresholds.faceTracking &&
                                  detectionHistory.length >= thresholds.minFramesForValidation

  if (!validations.value.faceTracking) {
    resetSubsequentValidations(['qualityCheck', 'faceClean'])
    return
  }

  // 4. Calidad de imagen mejorada
  const qualityScore = calculateEnhancedQualityScore(results.faceLandmarks[0])
  validations.value.qualityScore = Math.round(qualityScore * 100)
  validations.value.qualityCheck = qualityScore >= thresholds.quality

  if (!validations.value.qualityCheck) {
    resetSubsequentValidations(['faceClean'])
    return
  }

  // 5. Verificación creativa de rostro limpio
  const cleanScore = calculateFaceCleanliness(results.faceLandmarks[0])
  validations.value.cleanScore = Math.round(cleanScore * 100)
  validations.value.faceClean = cleanScore >= thresholds.faceClean
}

// Resetear validaciones posteriores
const resetSubsequentValidations = (validationsToReset = ['facePresence', 'faceTracking', 'qualityCheck', 'faceClean']) => {
  validationsToReset.forEach(validation => {
    if (validation === 'facePresence') {
      validations.value.facePresence = false
      validations.value.presenceScore = 0
    } else if (validation === 'faceTracking') {
      validations.value.faceTracking = false
      validations.value.trackingScore = 0
    } else if (validation === 'qualityCheck') {
      validations.value.qualityCheck = false
      validations.value.qualityScore = 0
    } else if (validation === 'faceClean') {
      validations.value.faceClean = false
      validations.value.cleanScore = 0
      resetCleanIndicators()
    }
  })
}

// Resetear indicadores de limpieza
const resetCleanIndicators = () => {
  cleanIndicators.value = {
    eyes: false,
    nose: false,
    mouth: false,
    cheeks: false
  }
}

// Calcular score de presencia mejorado
const calculateEnhancedPresenceScore = (landmarks) => {
  const keyPoints = [
    { index: 33, weight: 1.5 },  // Ojo izquierdo externo
    { index: 263, weight: 1.5 }, // Ojo derecho externo
    { index: 1, weight: 2.0 },   // Punta de nariz (más importante)
    { index: 13, weight: 1.0 },  // Labio superior
    { index: 14, weight: 1.0 },  // Labio inferior
    { index: 151, weight: 1.0 }, // Mentón
    { index: 10, weight: 1.5 }   // Centro de frente
  ]

  let totalScore = 0
  let totalWeight = 0

  keyPoints.forEach(point => {
    if (landmarks[point.index]) {
      const visibility = landmarks[point.index].visibility || 0.8
      const distanceFromCenter = calculateDistanceFromCenter(landmarks[point.index])
      const centerBonus = Math.max(0, 1 - distanceFromCenter * 2)

      totalScore += (visibility * 0.7 + centerBonus * 0.3) * point.weight
      totalWeight += point.weight
    }
  })

  return totalWeight > 0 ? totalScore / totalWeight : 0
}

// Calcular estabilidad de seguimiento mejorada
const calculateEnhancedTrackingStability = () => {
  if (detectionHistory.length < 10) return 0.3

  const recentHistory = detectionHistory.slice(-20)

  // Calcular estabilidad de posición
  const positionStability = calculatePositionStability(recentHistory)

  // Calcular estabilidad de tamaño
  const sizeStability = calculateSizeStability(recentHistory)

  // Calcular consistencia temporal
  const temporalConsistency = calculateTemporalConsistency(recentHistory)

  const finalStability = (positionStability * 0.5 + sizeStability * 0.3 + temporalConsistency * 0.2)
  stabilityScore.value = finalStability

  return finalStability
}

// Calcular estabilidad de posición
const calculatePositionStability = (history) => {
  let totalMovement = 0
  for (let i = 1; i < history.length; i++) {
    const dx = history[i].position.x - history[i-1].position.x
    const dy = history[i].position.y - history[i-1].position.y
    totalMovement += Math.sqrt(dx * dx + dy * dy)
  }

  const avgMovement = totalMovement / (history.length - 1)
  movementScore.value = avgMovement

  return Math.max(0, 1 - (avgMovement * 20))
}

// Calcular estabilidad de tamaño
const calculateSizeStability = (history) => {
  let totalSizeChange = 0
  for (let i = 1; i < history.length; i++) {
    const sizeChange = Math.abs(history[i].size - history[i-1].size)
    totalSizeChange += sizeChange
  }

  const avgSizeChange = totalSizeChange / (history.length - 1)
  return Math.max(0, 1 - (avgSizeChange * 10))
}

// Calcular consistencia temporal
const calculateTemporalConsistency = (history) => {
  const timeDiffs = []
  for (let i = 1; i < history.length; i++) {
    timeDiffs.push(history[i].timestamp - history[i-1].timestamp)
  }

  const avgTimeDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length
  const variance = timeDiffs.reduce((a, b) => a + Math.pow(b - avgTimeDiff, 2), 0) / timeDiffs.length

  return Math.max(0, 1 - (variance / 100))
}

// Calcular calidad mejorada
const calculateEnhancedQualityScore = (landmarks) => {
  const completeness = landmarks.length / 468 // MediaPipe Face Mesh

  // Verificar distribución de landmarks
  const distributionScore = calculateLandmarkDistribution(landmarks)

  // Verificar iluminación (basado en variación de brillo)
  const lightingScore = calculateLightingScore(landmarks)

  // Verificar que no haya oclusión excesiva
  const occlusionScore = calculateOcclusionScore(landmarks)

  return (completeness * 0.4 + distributionScore * 0.3 + lightingScore * 0.2 + occlusionScore * 0.1)
}

// Calcular distribución de landmarks
const calculateLandmarkDistribution = (landmarks) => {
  const regions = {
    leftEye: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
    rightEye: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],
    nose: [1, 2, 98, 327, 4, 5, 195, 197, 6, 122, 196, 3, 51, 45, 44, 125, 141, 239, 20],
    mouth: [13, 14, 78, 95, 88, 178, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78, 77, 76, 75, 74, 73],
    jaw: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
  }

  let regionScores = 0
  let validRegions = 0

  Object.values(regions).forEach(regionIndices => {
    const regionLandmarks = regionIndices.filter(idx => landmarks[idx])
    if (regionLandmarks.length > 0) {
      regionScores += regionLandmarks.length / regionIndices.length
      validRegions++
    }
  })

  return validRegions > 0 ? regionScores / validRegions : 0
}

// Calcular score de iluminación (simulado)
const calculateLightingScore = (landmarks) => {
  // En una implementación real, aquí analizarías el histograma de la imagen
  // Por ahora simulamos basado en la variación de posiciones de landmarks clave
  const keyPoints = [1, 33, 263, 13, 14, 10] // nariz, ojos, boca, frente
  let totalDistance = 0
  let pairs = 0

  for (let i = 0; i < keyPoints.length; i++) {
    for (let j = i + 1; j < keyPoints.length; j++) {
      if (landmarks[keyPoints[i]] && landmarks[keyPoints[j]]) {
        const dx = landmarks[keyPoints[i]].x - landmarks[keyPoints[j]].x
        const dy = landmarks[keyPoints[i]].y - landmarks[keyPoints[j]].y
        totalDistance += Math.sqrt(dx * dx + dy * dy)
        pairs++
      }
    }
  }

  const avgDistance = pairs > 0 ? totalDistance / pairs : 0
  // Asumimos que distancias muy pequeñas o muy grandes indican mala iluminación
  return Math.max(0, 1 - Math.abs(avgDistance - 0.3) * 3)
}

// Calcular score de oclusión
const calculateOcclusionScore = (landmarks) => {
  // Verificar simetría facial como proxy de oclusión
  const symmetricPairs = [
    [33, 263], [7, 362], [159, 386], [145, 374], [133, 362] // pares simétricos
  ]

  let symmetryScore = 0
  symmetricPairs.forEach(([left, right]) => {
    if (landmarks[left] && landmarks[right]) {
      const leftY = landmarks[left].y
      const rightY = landmarks[right].y
      symmetryScore += 1 - Math.abs(leftY - rightY) * 10
    }
  })

  return Math.min(1, symmetryScore / symmetricPairs.length)
}

// VERIFICACIÓN CREATIVA DE ROSTRO LIMPIO
const calculateFaceCleanliness = (landmarks) => {
  let totalScore = 0
  let componentCount = 0

  // 1. Verificación de ojos abiertos y claros
  const eyesScore = verifyEyesCleanliness(landmarks)
  totalScore += eyesScore
  componentCount++
  cleanIndicators.value.eyes = eyesScore >= 0.8

  // 2. Verificación de área nasal
  const noseScore = verifyNoseCleanliness(landmarks)
  totalScore += noseScore
  componentCount++
  cleanIndicators.value.nose = noseScore >= 0.8

  // 3. Verificación de boca
  const mouthScore = verifyMouthCleanliness(landmarks)
  totalScore += mouthScore
  componentCount++
  cleanIndicators.value.mouth = mouthScore >= 0.8

  // 4. Verificación de mejillas/contorno
  const cheeksScore = verifyCheeksCleanliness(landmarks)
  totalScore += cheeksScore
  componentCount++
  cleanIndicators.value.cheeks = cheeksScore >= 0.8

  // 5. Verificación de simetría general (indicador de postura natural)
  const symmetryScore = verifyFacialSymmetry(landmarks)
  totalScore += symmetryScore
  componentCount++

  return componentCount > 0 ? totalScore / componentCount : 0
}

// Verificar limpieza de ojos
const verifyEyesCleanliness = (landmarks) => {
  const leftEyeIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
  const rightEyeIndices = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]

  const leftEyeOpenness = calculateEyeOpenness(landmarks, leftEyeIndices)
  const rightEyeOpenness = calculateEyeOpenness(landmarks, rightEyeIndices)

  // Ojos deben estar razonablemente abiertos (no entrecerrados)
  const opennessScore = (leftEyeOpenness + rightEyeOpenness) / 2

  // Verificar que ambos ojos estén visibles
  const visibilityScore = (leftEyeIndices.filter(i => landmarks[i]).length / leftEyeIndices.length +
                         rightEyeIndices.filter(i => landmarks[i]).length / rightEyeIndices.length) / 2

  return (opennessScore * 0.6 + visibilityScore * 0.4)
}

// Calcular apertura de ojos
const calculateEyeOpenness = (landmarks, eyeIndices) => {
  if (eyeIndices.length < 6) return 0.5

  const topLid = landmarks[eyeIndices[1]]  // Párpado superior
  const bottomLid = landmarks[eyeIndices[4]] // Párpado inferior

  if (!topLid || !bottomLid) return 0.5

  const eyeHeight = Math.abs(topLid.y - bottomLid.y)
  // Normalizar basado en distancia entre puntos oculares externos
  const eyeWidth = Math.abs(landmarks[eyeIndices[0]].x - landmarks[eyeIndices[8]].x)

  if (eyeWidth === 0) return 0.5

  const ratio = eyeHeight / eyeWidth
  // Ratio típico: ~0.2-0.4 para ojos abiertos
  return Math.min(1, Math.max(0, (ratio - 0.1) / 0.3))
}

// Verificar limpieza de nariz
const verifyNoseCleanliness = (landmarks) => {
  const noseIndices = [1, 2, 98, 327, 4, 5, 195, 197, 6, 122, 196, 3, 51, 45, 44, 125, 141, 239, 20]

  // Verificar que todos los puntos de la nariz estén presentes
  const completeness = noseIndices.filter(i => landmarks[i]).length / noseIndices.length

  // Verificar que la nariz esté centrada
  const noseTip = landmarks[1]
  const faceCenterX = 0.5
  if (noseTip) {
    const centerScore = 1 - Math.abs(noseTip.x - faceCenterX) * 2
    return (completeness * 0.7 + centerScore * 0.3)
  }

  return completeness
}

// Verificar limpieza de boca
const verifyMouthCleanliness = (landmarks) => {
  const mouthIndices = [13, 14, 78, 95, 88, 178, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78, 77, 76, 75, 74, 73]

  const completeness = mouthIndices.filter(i => landmarks[i]).length / mouthIndices.length

  // Verificar que la boca esté cerrada o ligeramente abierta (no muy abierta)
  const upperLip = landmarks[13]
  const lowerLip = landmarks[14]

  let mouthOpenness = 0.5
  if (upperLip && lowerLip) {
    const openness = Math.abs(upperLip.y - lowerLip.y)
    // Normalizar la apertura
    mouthOpenness = Math.min(1, Math.max(0, 1 - openness * 10))
  }

  return (completeness * 0.6 + mouthOpenness * 0.4)
}

// Verificar limpieza de mejillas
const verifyCheeksCleanliness = (landmarks) => {
  const cheekIndices = [116, 117, 118, 119, 100, 47, 126, 209, 49, 131, 134, 51, 5, 281, 275, 4, 45, 220, 115, 48, 219, 166, 79, 238, 59, 75, 60, 20, 242, 141, 94, 2, 370, 462, 250, 290, 305, 289, 392, 309, 439, 455, 343, 323, 361, 288, 397, 365, 379, 378, 400, 377]

  const completeness = cheekIndices.filter(i => landmarks[i]).length / cheekIndices.length

  // Verificar simetría de mejillas
  const leftCheek = landmarks[234]
  const rightCheek = landmarks[454]

  let symmetryScore = 0.5
  if (leftCheek && rightCheek) {
    const verticalSymmetry = 1 - Math.abs(leftCheek.y - rightCheek.y)
    symmetryScore = verticalSymmetry
  }

  return (completeness * 0.5 + symmetryScore * 0.5)
}

// Verificar simetría facial general
const verifyFacialSymmetry = (landmarks) => {
  const symmetricPairs = [
    [33, 263], [7, 362], [159, 386], [145, 374], [133, 362],
    [33, 263], [162, 389], [78, 308], [13, 14] // Agregar más pares simétricos
  ]

  let totalSymmetry = 0
  let validPairs = 0

  symmetricPairs.forEach(([left, right]) => {
    if (landmarks[left] && landmarks[right]) {
      const horizontalSymmetry = 1 - Math.abs(landmarks[left].x - (1 - landmarks[right].x))
      const verticalSymmetry = 1 - Math.abs(landmarks[left].y - landmarks[right].y)
      totalSymmetry += (horizontalSymmetry + verticalSymmetry) / 2
      validPairs++
    }
  })

  return validPairs > 0 ? totalSymmetry / validPairs : 0.5
}

// Calcular distancia desde el centro
const calculateDistanceFromCenter = (landmark) => {
  const centerX = 0.5
  const centerY = 0.5
  return Math.sqrt(Math.pow(landmark.x - centerX, 2) + Math.pow(landmark.y - centerY, 2))
}

// Agregar a historial mejorado
const addToHistory = (results) => {
  if (results.faceLandmarks && results.faceLandmarks.length > 0) {
    const landmarks = results.faceLandmarks[0]
    const noseTip = landmarks[1]

    // Calcular tamaño aproximado del rostro
    const leftFace = landmarks[234]
    const rightFace = landmarks[454]
    const faceWidth = leftFace && rightFace ? Math.abs(rightFace.x - leftFace.x) : 0.3

    detectionHistory.push({
      timestamp: Date.now(),
      position: { x: noseTip.x, y: noseTip.y },
      size: faceWidth
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
    return '📍 Acércate más a la cámara y mantén buena iluminación'
  }
  if (!validations.value.faceTracking) {
    return '🎯 Mantén tu rostro estable por unos segundos'
  }
  if (!validations.value.qualityCheck) {
    return '✨ Centra tu rostro y asegura buena visibilidad'
  }
  if (!validations.value.faceClean) {
    return '💫 Asegúrate de tener el rostro limpio y natural'
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
    quality: validations.value.qualityScore,
    clean: validations.value.cleanScore
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

.clean-indicators {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.clean-indicator {
  padding: 4px 8px;
  background-color: #e9ecef;
  border-radius: 12px;
  font-size: 11px;
  color: #6c757d;
  transition: all 0.3s;
}

.clean-indicator.good {
  background-color: #d4edda;
  color: #155724;
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

.face-stats {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
}

.face-stats div {
  margin: 2px 0;
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
