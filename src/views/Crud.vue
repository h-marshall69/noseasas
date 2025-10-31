<template>
  <div class="face-detection-container">
    <div class="controls">
      <button @click="startCamera" :disabled="!modelsLoaded" v-if="!cameraActive">
        Activar Cámara
      </button>
      <button @click="capturePhoto" v-if="cameraActive">
        Capturar Foto
      </button>
      <input type="file" @change="handleImageUpload" accept="image/*" />
    </div>

    <div class="preview-container">
      <video ref="videoRef" v-show="cameraActive" autoplay playsinline></video>
      <img ref="imageRef" v-if="selectedImage" :src="selectedImage" />
      <canvas ref="canvasRef"></canvas>
    </div>

    <div v-if="detections.length > 0" class="results">
      Detectados {{ detections.length }} rostro(s)
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as faceapi from 'face-api.js';

const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

const videoRef = ref(null);
const canvasRef = ref(null);
const imageRef = ref(null);
const modelsLoaded = ref(false);
const cameraActive = ref(false);
const selectedImage = ref(null);
const detections = ref([]);
const stream = ref(null);

onMounted(async () => {
  await loadModels();
});

onUnmounted(() => {
  stopCamera();
});

const loadModels = async () => {
  try {
    // Cargar los modelos desde la carpeta public/models
    const MODEL_URL = '/models';

    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);

    modelsLoaded.value = true;
    console.log('Modelos cargados exitosamente');
  } catch (error) {
    console.error('Error cargando modelos:', error);
  }
};

const startCamera = async () => {
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }
    });
    videoRef.value.srcObject = stream.value;
    cameraActive.value = true;
  } catch (error) {
    console.error('Error accediendo a la cámara:', error);
    alert('No se pudo acceder a la cámara');
  }
};

const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
    stream.value = null;
  }
  cameraActive.value = false;
};

const capturePhoto = async () => {
  const canvas = canvasRef.value;
  const video = videoRef.value;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);

  selectedImage.value = canvas.toDataURL('image/jpeg');
  stopCamera();

  await detectFaces(imageRef.value);
};

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    selectedImage.value = e.target.result;
    stopCamera();

    // Esperar a que la imagen se cargue
    await new Promise(resolve => {
      const img = new Image();
      img.onload = resolve;
      img.src = e.target.result;
    });

    await detectFaces(imageRef.value);
  };
  reader.readAsDataURL(file);
};

const detectFaces = async (imgElement) => {
  if (!imgElement) return;

  try {
    // Detectar rostros con landmarks y expresiones
    const results = await faceapi
      .detectAllFaces(imgElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    detections.value = results;

    // Dibujar las detecciones en el canvas
    const canvas = canvasRef.value;
    const displaySize = {
      width: imgElement.width,
      height: imgElement.height
    };

    faceapi.matchDimensions(canvas, displaySize);

    const resizedDetections = faceapi.resizeResults(results, displaySize);

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    console.log('Detecciones:', results);
  } catch (error) {
    console.error('Error en la detección:', error);
  }
};
</script>

<style scoped>
.face-detection-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.preview-container {
  position: relative;
  width: 100%;
  margin: 20px 0;
}

video,
img {
  width: 100%;
  height: auto;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
}

.controls button {
  margin: 10px;
  padding: 10px 20px;
}
</style>