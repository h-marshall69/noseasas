<template>
  <div class="container">
    <h2>Detección Facial con Validaciones</h2>

    <!-- Controles -->
    <div class="controls">
      <button @click="toggleCamera" :disabled="!modelsLoaded">
        {{ cameraActive ? 'Detener' : 'Activar' }} Cámara
      </button>
      <button
        @click="capturePhoto"
        :disabled="!cameraActive || !allValidationsPassed"
        :class="{ 'pulse': allValidationsPassed && cameraActive }"
      >
        {{ allValidationsPassed ? '📸 Capturar' : 'Validando...' }}
      </button>
      <input type="file" @change="handleImageUpload" accept="image/*" />
    </div>

    <!-- Validaciones en Cascada -->
    <div v-if="cameraActive" class="validations">
      <h3>Estado de Validación: {{ validationProgress }}%</h3>

      <div
        v-for="(validation, index) in validationSteps"
        :key="index"
        class="validation-step"
        :class="{ 'active': validation.active, 'passed': validation.passed }"
      >
        <span class="icon">{{ validation.passed ? '✓' : '○' }}</span>
        <div class="info">
          <strong>{{ validation.title }}</strong>
          <p>{{ validation.message }}</p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: validation.score + '%' }"></div>
          </div>
        </div>
      </div>

      <div v-if="!allValidationsPassed" class="instruction">
        💡 {{ currentInstruction }}
      </div>
    </div>

    <!-- Vista Previa -->
    <div class="preview">
      <video ref="videoRef" v-show="cameraActive" autoplay playsinline></video>
      <img v-if="selectedImage && !cameraActive" :src="selectedImage" />
      <canvas ref="canvasRef" class="overlay"></canvas>
    </div>

    <!-- Resultados -->
    <div v-if="detections.length > 0" class="results">
      <h3>{{ detections.length }} rostro(s) detectado(s)</h3>
      <div v-for="(detection, i) in detections" :key="i" class="detection">
        <strong>Rostro {{ i + 1 }}</strong>
        <div>Confianza: {{ (detection.detection.score * 100).toFixed(1) }}%</div>
        <div v-if="detection.expressions">
          Expresión: {{ getDominantExpression(detection.expressions) }}
        </div>
      </div>
    </div>

    <!-- Mensajes -->
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="!modelsLoaded" class="loading">Cargando modelos...</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

// Referencias
const videoRef = ref(null);
const canvasRef = ref(null);
const modelsLoaded = ref(false);
const cameraActive = ref(false);
const selectedImage = ref(null);
const detections = ref([]);
const stream = ref(null);
const error = ref(null);
const detectionInterval = ref(null);

// Validaciones
const validations = ref({
  faceDetected: false,
  faceQuality: false,
  facePosition: false,
  faceStability: false,
  faceOcclusion: false,
  qualityScore: 0,
  positionScore: 0,
  stabilityScore: 0
});

const detectionHistory = ref([]);
const HISTORY_SIZE = 30;

// Computados
const allValidationsPassed = computed(() =>
  Object.values(validations.value).slice(0, 5).every(v => v === true)
);

const validationProgress = computed(() => {
  const passed = Object.values(validations.value).slice(0, 5).filter(Boolean).length;
  return Math.round((passed / 5) * 100);
});

const validationSteps = computed(() => [
  {
    title: '1. Detección de rostro',
    message: validations.value.faceDetected ? 'Rostro detectado' : 'Esperando rostro...',
    passed: validations.value.faceDetected,
    active: true,
    score: validations.value.faceDetected ? 100 : 0
  },
  {
    title: '2. Calidad del rostro',
    message: validations.value.faceQuality ? 'Rostro nítido' : 'Mejora la iluminación',
    passed: validations.value.faceQuality,
    active: validations.value.faceDetected,
    score: validations.value.qualityScore
  },
  {
    title: '3. Posición correcta',
    message: validations.value.facePosition ? 'Rostro centrado' : 'Centra tu rostro',
    passed: validations.value.facePosition,
    active: validations.value.faceQuality,
    score: validations.value.positionScore
  },
  {
    title: '4. Estabilidad',
    message: validations.value.faceStability ? 'Posición estable' : 'Mantén la posición',
    passed: validations.value.faceStability,
    active: validations.value.facePosition,
    score: validations.value.stabilityScore
  },
  {
    title: '5. Sin obstrucciones',
    message: validations.value.faceOcclusion ? 'Rostro visible' : 'Despeja tu rostro',
    passed: validations.value.faceOcclusion,
    active: validations.value.faceStability,
    score: validations.value.faceOcclusion ? 100 : 0
  }
]);

const currentInstruction = computed(() => {
  if (!validations.value.faceDetected) return 'Posiciona tu rostro frente a la cámara';
  if (!validations.value.faceQuality) return 'Mejora la iluminación';
  if (!validations.value.facePosition) return 'Centra tu rostro';
  if (!validations.value.faceStability) return 'Mantén la posición estable';
  if (!validations.value.faceOcclusion) return 'Asegura que tu rostro esté visible';
  return '¡Perfecto! Puedes capturar';
});

// Ciclo de vida
onMounted(loadModels);
onUnmounted(() => {
  stopCamera();
  if (detectionInterval.value) clearInterval(detectionInterval.value);
});

// Cargar modelos
async function loadModels() {
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
    ]);
    modelsLoaded.value = true;
  } catch (e) {
    error.value = 'Error cargando modelos';
    console.error(e);
  }
}

// Cámara
async function toggleCamera() {
  cameraActive.value ? stopCamera() : await startCamera();
}

async function startCamera() {
  try {
    resetValidations();
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
    });

    videoRef.value.srcObject = stream.value;
    await videoRef.value.play();
    cameraActive.value = true;
    selectedImage.value = null;

    await nextTick();
    setupCanvas();
    startDetection();
  } catch (e) {
    error.value = 'No se pudo acceder a la cámara';
    console.error(e);
  }
}

function stopCamera() {
  if (stream.value) {
    stream.value.getTracks().forEach(t => t.stop());
    stream.value = null;
  }
  cameraActive.value = false;
  if (detectionInterval.value) {
    clearInterval(detectionInterval.value);
    detectionInterval.value = null;
  }
}

// Canvas
function setupCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  let width, height;
  if (cameraActive.value && videoRef.value) {
    width = videoRef.value.videoWidth;
    height = videoRef.value.videoHeight;
  } else if (selectedImage.value) {
    const img = new Image();
    img.src = selectedImage.value;
    width = img.width;
    height = img.height;
  } else return;

  canvas.width = width;
  canvas.height = height;
}

// Detección
function startDetection() {
  detectionInterval.value = setInterval(async () => {
    if (cameraActive.value && videoRef.value?.readyState === 4) {
      await detectFaces();
    }
  }, 150);
}

async function detectFaces() {
  try {
    const video = videoRef.value;
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });

    const results = await faceapi
      .detectAllFaces(video, options)
      .withFaceLandmarks()
      .withFaceExpressions();

    detections.value = results;
    performValidation(results);
    drawDetections(results);
  } catch (e) {
    console.error('Error en detección:', e);
  }
}

function drawDetections(results) {
  const canvas = canvasRef.value;
  const video = videoRef.value;

  const displaySize = { width: video.videoWidth, height: video.videoHeight };
  faceapi.matchDimensions(canvas, displaySize);

  const resized = faceapi.resizeResults(results, displaySize);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (results.length > 0) {
    faceapi.draw.drawDetections(canvas, resized);
    faceapi.draw.drawFaceLandmarks(canvas, resized);
  }
}

// Validaciones
function performValidation(results) {
  if (!results.length) {
    resetValidations();
    return;
  }

  const detection = results[0];
  validations.value.faceDetected = true;

  const quality = calculateQuality(detection);
  validations.value.qualityScore = Math.round(quality * 100);
  validations.value.faceQuality = quality >= 0.7;

  const position = calculatePosition(detection);
  validations.value.positionScore = Math.round(position * 100);
  validations.value.facePosition = position >= 0.8;

  const stability = calculateStability(detection);
  validations.value.stabilityScore = Math.round(stability * 100);
  validations.value.faceStability = stability >= 0.8;

  validations.value.faceOcclusion =
    validations.value.faceQuality &&
    validations.value.facePosition &&
    validations.value.faceStability;
}

function calculateQuality(detection) {
  let score = detection.detection.score * 0.4;
  if (detection.landmarks) score += 0.3;
  if (detection.expressions) score += 0.3;
  return Math.min(1, score);
}

function calculatePosition(detection) {
  const box = detection.detection.box;
  const video = videoRef.value;

  const centerX = video.videoWidth / 2;
  const centerY = video.videoHeight / 2;

  const faceCenterX = box.x + box.width / 2;
  const faceCenterY = box.y + box.height / 2;

  const distance = Math.sqrt(
    Math.pow(faceCenterX - centerX, 2) +
    Math.pow(faceCenterY - centerY, 2)
  );

  const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
  return 1 - (distance / maxDistance);
}

function calculateStability(detection) {
  const current = {
    x: detection.detection.box.x,
    y: detection.detection.box.y,
    timestamp: Date.now()
  };

  detectionHistory.value.push(current);
  if (detectionHistory.value.length > HISTORY_SIZE) {
    detectionHistory.value.shift();
  }

  if (detectionHistory.value.length < 5) return 0.5;

  let totalMovement = 0;
  for (let i = 1; i < detectionHistory.value.length; i++) {
    const prev = detectionHistory.value[i - 1];
    const curr = detectionHistory.value[i];
    totalMovement += Math.sqrt(
      Math.pow(curr.x - prev.x, 2) +
      Math.pow(curr.y - prev.y, 2)
    );
  }

  const avgMovement = totalMovement / (detectionHistory.value.length - 1);
  return Math.max(0, 1 - (avgMovement / 50));
}

function resetValidations() {
  validations.value = {
    faceDetected: false,
    faceQuality: false,
    facePosition: false,
    faceStability: false,
    faceOcclusion: false,
    qualityScore: 0,
    positionScore: 0,
    stabilityScore: 0
  };
  detectionHistory.value = [];
}

// Captura
async function capturePhoto() {
  if (!cameraActive.value || !allValidationsPassed.value) return;

  const canvas = document.createElement('canvas');
  const video = videoRef.value;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);

  selectedImage.value = canvas.toDataURL('image/jpeg');
  stopCamera();
}

// Subir imagen
async function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file || !file.type.startsWith('image/')) return;

  stopCamera();
  resetValidations();

  const reader = new FileReader();
  reader.onload = (e) => {
    selectedImage.value = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Utilidades
function getDominantExpression(expressions) {
  const [emotion, score] = Object.entries(expressions)
    .reduce((max, curr) => curr[1] > max[1] ? curr : max);

  const map = {
    neutral: 'Neutral', happy: 'Feliz', sad: 'Triste',
    angry: 'Enojado', fearful: 'Temeroso',
    disgusted: 'Disgustado', surprised: 'Sorprendido'
  };

  return `${map[emotion] || emotion} (${(score * 100).toFixed(1)}%)`;
}
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
  flex-wrap: wrap;
}

.controls button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  background: #007bff;
  color: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.controls button:hover:not(:disabled) {
  background: #0056b3;
}

.controls button:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.controls button.pulse {
  background: #28a745;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 4px 6px rgba(40, 167, 69, 0.3); }
  50% { box-shadow: 0 4px 20px rgba(40, 167, 69, 0.6); }
}

.validations {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.validations h3 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.validation-step {
  display: flex;
  gap: 15px;
  padding: 15px;
  margin: 10px 0;
  border-radius: 6px;
  background: #f8f9fa;
  opacity: 0.5;
  transition: all 0.3s;
}

.validation-step.active {
  opacity: 1;
  background: #fff3cd;
}

.validation-step.passed {
  background: #d4edda;
  opacity: 1;
}

.icon {
  font-size: 24px;
  min-width: 30px;
  text-align: center;
  color: #6c757d;
}

.validation-step.passed .icon {
  color: #28a745;
}

.info {
  flex: 1;
}

.info strong {
  display: block;
  margin-bottom: 5px;
}

.info p {
  margin: 5px 0;
  font-size: 13px;
  color: #6c757d;
}

.progress-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s;
}

.validation-step.passed .progress-fill {
  background: #28a745;
}

.instruction {
  text-align: center;
  margin-top: 20px;
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border-radius: 20px;
  display: inline-block;
  width: 100%;
  box-sizing: border-box;
}

.preview {
  position: relative;
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
  margin-bottom: 20px;
}

.preview video,
.preview img {
  width: 100%;
  display: block;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.results {
  padding: 15px;
  background: #e9f7ef;
  border-radius: 8px;
  border-left: 4px solid #28a745;
  margin-bottom: 20px;
}

.detection {
  padding: 12px;
  margin: 8px 0;
  background: white;
  border-radius: 6px;
  border-left: 4px solid #007bff;
}

.error {
  padding: 15px;
  background: #f8d7da;
  color: #721c24;
  border-radius: 8px;
  border-left: 4px solid #dc3545;
}

.loading {
  padding: 15px;
  background: #fff3cd;
  color: #856404;
  border-radius: 8px;
  text-align: center;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }

  .controls {
    flex-direction: column;
  }

  .controls button {
    width: 100%;
  }
}
</style>
