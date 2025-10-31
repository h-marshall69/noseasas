<template>
  <div class="detector-container">
    <h1>Detección de Objetos con MediaPipe</h1>
    
    <!-- Controles -->
    <div class="controls">
      <input type="file" @change="loadVideo" accept="video/*" />
      <button @click="startStreaming">Iniciar Streaming (Webcam)</button>
      <button @click="stopStreaming">Detener Streaming</button>
      <p>Modo actual: {{ currentMode }}</p>
    </div>
    
    <!-- Video y Canvas -->
    <div class="video-wrapper">
      <video
        ref="videoRef"
        :src="videoSrc"
        @loadedmetadata="onVideoLoaded"
        @play="startDetection"
        muted
        loop
      ></video>
      <canvas ref="canvasRef"></canvas>
    </div>
    
    <!-- Resultados --> 
    <div class="results">
      <h2>Objetos Detectados:</h2>
      <ul>
        <li v-for="detection in detections" :key="detection.categoryName">
          {{ detection.categoryName }} (Confianza: {{ (detection.categories[0].score * 100).toFixed(2) }}%)
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

// Refs para elementos DOM y estado
const videoRef = ref(null);
const canvasRef = ref(null);
const videoSrc = ref('');
const currentMode = ref('Ninguno'); // 'Video' o 'Streaming'
const detections = ref([]);
let objectDetector = null;
let vision = null;
let animationFrameId = null;
let lastVideoTime = -1;

// Función para cargar video local
const loadVideo = (event) => {
  const file = event.target.files[0];
  if (file) {
    videoSrc.value = URL.createObjectURL(file);
    currentMode.value = 'Video';
  }
};

// Callback cuando el video se carga
const onVideoLoaded = () => {
  const video = videoRef.value;
  const canvas = canvasRef.value;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
};

// Iniciar detección
const startDetection = async () => {
  if (!objectDetector) {
    await initDetector();
  }
  await objectDetector.setOptions({ runningMode: 'VIDEO' });
  renderLoop();
};

// Inicializar MediaPipe
const initDetector = async () => {
  const { FilesetResolver, ObjectDetector } = window.vision; // De la CDN
  vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );
  objectDetector = await ObjectDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0_uint8/1/efficientdet_lite0_uint8.tflite',
      delegate: 'GPU' // Usa GPU si está disponible para mejor rendimiento
    },
    scoreThreshold: 0.5, // Umbral de confianza
    maxResults: 5 // Máximo 5 objetos por frame
  });
};

// Loop de renderizado para procesar frames
const renderLoop = () => {
  const video = videoRef.value;
  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');

  if (video.currentTime !== lastVideoTime) {
    const results = objectDetector.detectForVideo(video, Date.now());
    detections.value = results.detections || [];
    lastVideoTime = video.currentTime;

    // Dibujar detecciones en el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    results.detections?.forEach((detection) => {
      const bbox = detection.boundingBox;
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        bbox.originX, bbox.originY, bbox.width, bbox.height
      );
      ctx.fillStyle = 'red';
      ctx.font = '16px Arial';
      ctx.fillText(
        `${detection.categories[0].categoryName} (${(detection.categories[0].score * 100).toFixed(0)}%)`,
        bbox.originX, bbox.originY - 5
      );
    });
  }

  animationFrameId = requestAnimationFrame(renderLoop);
};

// Iniciar streaming de webcam
const startStreaming = async () => {
  const video = videoRef.value;
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  video.play();
  currentMode.value = 'Streaming';
  await nextTick();
  onVideoLoaded();
  startDetection();
};

// Detener streaming
const stopStreaming = () => {
  const video = videoRef.value;
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
  videoSrc.value = '';
  currentMode.value = 'Ninguno';
  detections.value = [];
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
};

onMounted(() => {
  // Inicializar detector al montar el componente
  initDetector();
});

onUnmounted(() => {
  stopStreaming();
  if (objectDetector) {
    objectDetector.close();
  }
});
</script>

<style scoped>
.detector-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.controls {
  margin-bottom: 20px;
}

.controls button {
  margin-left: 10px;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.video-wrapper {
  position: relative;
  display: inline-block;
}

video {
  display: block;
  max-width: 100%;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.results {
  margin-top: 20px;
}

.results ul {
  list-style: none;
  padding: 0;
}

.results li {
  background: #f8f9fa;
  margin: 5px 0;
  padding: 10px;
  border-radius: 4px;
}
</style>