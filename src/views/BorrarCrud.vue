<!-- src\views\FaceDetection.vue -->

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
      <div class="media-wrapper">
        <video 
          ref="videoRef" 
          v-show="cameraActive" 
          autoplay 
          playsinline
          class="media-element"
        ></video>
        <img 
          ref="imageRef" 
          v-if="selectedImage && !cameraActive" 
          :src="selectedImage" 
          class="media-element"
          crossorigin="anonymous"
        />
        <canvas ref="canvasRef" class="overlay-canvas"></canvas>
      </div>
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

    <div v-if="!modelsLoaded" class="loading">
      Cargando modelos de IA...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as faceapi from 'face-api.js';

// CORRECCIÓN: Usar ruta relativa correcta para los modelos
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
    
    // CORRECCIÓN: Cargar modelos con manejo de errores individual
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    console.log('TinyFaceDetector cargado');
    
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    console.log('FaceLandmark68Net cargado');
    
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    console.log('FaceRecognitionNet cargado');
    
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    console.log('FaceExpressionNet cargado');

    modelsLoaded.value = true;
    console.log('Todos los modelos cargados exitosamente');
  } catch (error) {
    console.error('Error cargando modelos:', error);
    error.value = `Error cargando los modelos de detección: ${error.message}. Asegúrate de que los modelos estén en la carpeta public/models`;
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
    await new Promise((resolve, reject) => {
      videoRef.value.onloadedmetadata = () => {
        resolve();
      };
      videoRef.value.onerror = reject;
      
      // Timeout de seguridad
      setTimeout(() => {
        reject(new Error('Timeout cargando video'));
      }, 5000);
    });
    
    await videoRef.value.play();
    cameraActive.value = true;
    selectedImage.value = null;
    
    // Esperar un frame para asegurar que las dimensiones estén disponibles
    await nextTick();
    setupCanvas();
    
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

const setupCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  let width, height;
  
  if (cameraActive.value && videoRef.value) {
    width = videoRef.value.videoWidth;
    height = videoRef.value.videoHeight;
  } else if (selectedImage.value && imageRef.value) {
    width = imageRef.value.naturalWidth || imageRef.value.width;
    height = imageRef.value.naturalHeight || imageRef.value.height;
  } else {
    return;
  }

  canvas.width = width;
  canvas.height = height;
  canvas.style.width = '100%';
  canvas.style.height = 'auto';
};

const startDetection = () => {
  stopDetection();
  
  // Ejecutar detección cada 150ms para mejor rendimiento
  detectionInterval.value = setInterval(async () => {
    if (cameraActive.value && videoRef.value && videoRef.value.readyState === videoRef.value.HAVE_ENOUGH_DATA) {
      await detectFacesInVideo();
    }
  }, 150);
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
    
    // Asegurar que el canvas tenga las dimensiones correctas
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      setupCanvas();
    }
    
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
    if (results.length > 0) {
      faceapi.draw.drawDetections(canvas, resizedDetections);
      
      if (showLandmarks.value) {
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      }
      
      if (showExpressions.value) {
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      }
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
  
  // Detener cámara y mostrar imagen
  stopCamera();
  stopDetection();
  
  // Esperar a que se renderice la imagen
  await nextTick();
  await detectFacesInImage(selectedImage.value);
};

const detectFacesInImage = async (imageSrc) => {
  if (!modelsLoaded.value) return;

  const img = imageRef.value;
  if (!img) return;

  // Esperar a que la imagen se cargue completamente
  await new Promise((resolve, reject) => {
    if (img.complete && img.naturalWidth !== 0) {
      resolve();
    } else {
      img.onload = () => resolve();
      img.onerror = reject;
      
      // Timeout de seguridad
      setTimeout(() => {
        reject(new Error('Timeout cargando imagen'));
      }, 5000);
    }
  });

  try {
    const results = await faceapi
      .detectAllFaces(img, detectionOptions)
      .withFaceLandmarks()
      .withFaceExpressions();

    detections.value = results;
    
    // Configurar y dibujar en el canvas
    setupCanvas();
    const canvas = canvasRef.value;
    const displaySize = { 
      width: img.naturalWidth || img.width, 
      height: img.naturalHeight || img.height 
    };
    
    faceapi.matchDimensions(canvas, displaySize);
    const resizedDetections = faceapi.resizeResults(results, displaySize);
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar detecciones
    if (results.length > 0) {
      faceapi.draw.drawDetections(canvas, resizedDetections);
      if (showLandmarks.value) {
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      }
      if (showExpressions.value) {
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      }
    }

  } catch (err) {
    console.error('Error detectando rostros en imagen:', err);
    error.value = 'Error procesando la imagen';
  }
};

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    error.value = 'Por favor selecciona un archivo de imagen válido';
    return;
  }

  stopCamera();
  stopDetection();

  const reader = new FileReader();
  reader.onload = async (e) => {
    selectedImage.value = e.target.result;
    // Esperar a que la imagen se renderice
    await nextTick();
    await detectFacesInImage(selectedImage.value);
  };
  reader.onerror = () => {
    error.value = 'Error leyendo el archivo';
  };
  reader.readAsDataURL(file);
};

const getDominantExpression = (expressions) => {
  if (!expressions) return 'Desconocida';
  
  const expression = Object.entries(expressions).reduce((max, [emotion, score]) => {
    return score > max.score ? { emotion, score } : max;
  }, { emotion: '', score: 0 });
  
  // Traducir expresiones al español
  const expressionMap = {
    'neutral': 'Neutral',
    'happy': 'Feliz',
    'sad': 'Triste',
    'angry': 'Enojado',
    'fearful': 'Temeroso',
    'disgusted': 'Disgustado',
    'surprised': 'Sorprendido'
  };
  
  const emotionText = expressionMap[expression.emotion] || expression.emotion;
  return `${emotionText} (${(expression.score * 100).toFixed(1)}%)`;
};

// Watchers para actualizar la visualización cuando cambian las opciones
watch([showLandmarks, showExpressions], () => {
  if (selectedImage.value) {
    detectFacesInImage(selectedImage.value);
  } else if (cameraActive.value) {
    // Forzar redibujado en video
    detectFacesInVideo();
  }
});

// Watch para cuando cambia la imagen seleccionada
watch(selectedImage, (newVal) => {
  if (newVal) {
    nextTick(() => {
      setupCanvas();
    });
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

.controls input[type="file"] {
  margin: 10px 5px;
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
  background: #000;
  min-height: 300px;
}

.media-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.media-element {
  width: 100%;
  height: auto;
  max-width: 100%;
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

.loading {
  margin-top: 20px;
  padding: 15px;
  background: #fff3cd;
  color: #856404;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
  text-align: center;
}
</style>