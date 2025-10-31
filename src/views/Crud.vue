<template>
  <div class="face-detection-container">
    <div class="controls">
      <button @click="toggleCamera" :disabled="!modelsLoaded">
        {{ cameraActive ? 'Detener Cámara' : 'Activar Cámara' }}
      </button>
      <button @click="capturePhoto" :disabled="!cameraActive">
        Capturar Foto
      </button>
      <input type="file" @change="handleImageUpload" accept="image/*" />
      <div class="settings">
        <label>
          <input type="checkbox" v-model="showLandmarks" />
          Mostrar landmarks
        </label>
        <label>
          <input type="checkbox" v-model="showExpressions" />
          Mostrar expresiones
        </label>
      </div>
    </div>

    <div class="preview-container">
      <video ref="videoRef" v-show="cameraActive" autoplay playsinline></video>
      <img ref="imageRef" v-if="selectedImage && !cameraActive" :src="selectedImage" />
      <canvas ref="canvasRef"></canvas>
    </div>

    <div v-if="detections.length > 0" class="results">
      <h3>Detectados {{ detections.length }} rostro(s)</h3>
      <div v-for="(detection, index) in detections" :key="index" class="detection-info">
        <div class="detection-item">
          <strong>Rostro {{ index + 1 }}</strong>
          <div>Confianza: {{ (detection.detection.score * 100).toFixed(1) }}%</div>
          <div v-if="detection.expressions" class="expressions">
            Expresión: {{ getDominantExpression(detection.expressions) }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

// Refs
const videoRef = ref(null);
const canvasRef = ref(null);
const imageRef = ref(null);
const modelsLoaded = ref(false);
const cameraActive = ref(false);
const selectedImage = ref(null);
const detections = ref([]);
const stream = ref(null);
const error = ref(null);
const showLandmarks = ref(true);
const showExpressions = ref(true);
const detectionInterval = ref(null);

// Configuración del detector
const detectionOptions = new faceapi.TinyFaceDetectorOptions({
  inputSize: 320,
  scoreThreshold: 0.5
});

onMounted(async () => {
  await loadModels();
});

onUnmounted(() => {
  stopCamera();
  stopDetection();
});

const loadModels = async () => {
  try {
    console.log('Cargando modelos de face-api.js...');
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
    ]);

    modelsLoaded.value = true;
    console.log('Modelos cargados exitosamente');
  } catch (error) {
    console.error('Error cargando modelos:', error);
    error.value = 'Error cargando los modelos de detección';
  }
};

const toggleCamera = async () => {
  if (cameraActive.value) {
    stopCamera();
    stopDetection();
  } else {
    await startCamera();
    startDetection();
  }
};

const startCamera = async () => {
  try {
    error.value = null;
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    });
    
    videoRef.value.srcObject = stream.value;
    
    // Esperar a que el video esté listo
    await new Promise((resolve) => {
      videoRef.value.onloadedmetadata = () => {
        resolve();
      };
    });
    
    cameraActive.value = true;
    selectedImage.value = null;
    
    // Configurar canvas con las dimensiones del video
    const video = videoRef.value;
    const canvas = canvasRef.value;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
  } catch (err) {
    console.error('Error accediendo a la cámara:', err);
    error.value = 'No se pudo acceder a la cámara. Asegúrate de permitir el acceso.';
  }
};

const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
    stream.value = null;
  }
  cameraActive.value = false;
};

const startDetection = () => {
  stopDetection();
  
  // Ejecutar detección cada 100ms para tiempo real
  detectionInterval.value = setInterval(async () => {
    if (cameraActive.value && videoRef.value) {
      await detectFacesInVideo();
    }
  }, 100);
};

const stopDetection = () => {
  if (detectionInterval.value) {
    clearInterval(detectionInterval.value);
    detectionInterval.value = null;
  }
};

const detectFacesInVideo = async () => {
  if (!videoRef.value || !modelsLoaded.value) return;

  try {
    const video = videoRef.value;
    const canvas = canvasRef.value;
    
    // Detectar rostros en el frame actual del video
    const results = await faceapi
      .detectAllFaces(video, detectionOptions)
      .withFaceLandmarks()
      .withFaceExpressions();

    detections.value = results;

    // Dibujar detecciones en el canvas
    const displaySize = {
      width: video.videoWidth,
      height: video.videoHeight
    };

    faceapi.matchDimensions(canvas, displaySize);
    const resizedDetections = faceapi.resizeResults(results, displaySize);

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar detecciones según las opciones seleccionadas
    faceapi.draw.drawDetections(canvas, resizedDetections);
    
    if (showLandmarks.value) {
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    }
    
    if (showExpressions.value) {
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }

  } catch (err) {
    console.error('Error en detección en tiempo real:', err);
  }
};

const capturePhoto = async () => {
  if (!cameraActive.value) return;

  const canvas = document.createElement('canvas');
  const video = videoRef.value;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);

  selectedImage.value = canvas.toDataURL('image/jpeg');
  
  // Detectar rostros en la foto capturada
  await detectFacesInImage(selectedImage.value);
};

const detectFacesInImage = async (imageSrc) => {
  const img = new Image();
  img.src = imageSrc;
  
  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const results = await faceapi
    .detectAllFaces(img, detectionOptions)
    .withFaceLandmarks()
    .withFaceExpressions();

  detections.value = results;
  
  // Dibujar en el canvas principal
  const canvas = canvasRef.value;
  const displaySize = { width: img.width, height: img.height };
  
  faceapi.matchDimensions(canvas, displaySize);
  const resizedDetections = faceapi.resizeResults(results, displaySize);
  
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  faceapi.draw.drawDetections(canvas, resizedDetections);
  if (showLandmarks.value) {
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
  }
  if (showExpressions.value) {
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  }
};

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  stopCamera();
  stopDetection();

  const reader = new FileReader();
  reader.onload = async (e) => {
    selectedImage.value = e.target.result;
    await detectFacesInImage(selectedImage.value);
  };
  reader.readAsDataURL(file);
};

const getDominantExpression = (expressions) => {
  if (!expressions) return 'Desconocida';
  
  const expression = Object.entries(expressions).reduce((max, [emotion, score]) => {
    return score > max.score ? { emotion, score } : max;
  }, { emotion: '', score: 0 });
  
  return `${expression.emotion} (${(expression.score * 100).toFixed(1)}%)`;
};

// Watchers para actualizar la visualización cuando cambian las opciones
watch([showLandmarks, showExpressions], () => {
  if (cameraActive.value || selectedImage.value) {
    if (selectedImage.value) {
      detectFacesInImage(selectedImage.value);
    }
  }
});
</script>

<style scoped>
.face-detection-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.controls {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.controls button {
  margin: 5px;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background: #007bff;
  color: white;
  cursor: pointer;
  transition: background 0.3s;
}

.controls button:hover:not(:disabled) {
  background: #0056b3;
}

.controls button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.settings {
  margin-top: 10px;
}

.settings label {
  margin-right: 15px;
  cursor: pointer;
}

.preview-container {
  position: relative;
  width: 100%;
  margin: 20px 0;
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

video, img {
  width: 100%;
  height: auto;
  display: block;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.results {
  margin-top: 20px;
  padding: 15px;
  background: #e9f7ef;
  border-radius: 8px;
  border-left: 4px solid #28a745;
}

.detection-info {
  margin-top: 10px;
}

.detection-item {
  padding: 10px;
  margin: 5px 0;
  background: white;
  border-radius: 4px;
  border-left: 3px solid #007bff;
}

.expressions {
  margin-top: 5px;
  font-style: italic;
  color: #666;
}

.error {
  margin-top: 20px;
  padding: 15px;
  background: #f8d7da;
  color: #721c24;
  border-radius: 8px;
  border-left: 4px solid #dc3545;
}
</style>