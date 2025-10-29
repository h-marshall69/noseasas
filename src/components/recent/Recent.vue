<!-- components/RecentPhotos.vue -->
<template>
    <div>
        <div v-if="recentPhotos.length === 0" class="empty-state">
            <div class="empty-icon">🗂️</div>
            <h3>No hay fotos recortadas</h3>
            <p>Toma y recorta una foto para verla aquí</p>
        </div>

        <div v-else>
            <table class="photos-table">
                <thead>
                    <tr>
                        <th class="image-column">Imagen</th>
                        <th class="name-column">Nombre</th>
                        <th class="dni-column">DNI</th>
                        <th class="date-column">Fecha</th>
                        <th class="actions-column">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(photo, index) in recentPhotos" :key="index" class="photo-row">
                        <td class="image-cell">
                            <div class="table-photo-container" @click="selectPhoto(photo)">
                                <img :src="photo.imageUrl" :alt="`Foto de ${photo.nombre}`" class="table-photo"
                                    loading="lazy" />
                            </div>
                        </td>
                        <td class="name-cell">{{ photo.nombre }}</td>
                        <td class="dni-cell">{{ photo.dni }}</td>
                        <td class="date-cell">
                            <div class="date-info">
                                <div class="date-main">{{ formatDate(photo.timestamp) }}</div>
                                <div class="date-time">{{ formatTime(photo.timestamp) }}</div>
                            </div>
                        </td>
                        <td class="actions-cell">
                            <button class="action-btn" @click="selectPhoto(photo)" title="Ver imagen">
                                <span class="btn-icon">👁️</span>
                                <span class="btn-text">Ver</span>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal para vista ampliada -->
        <div v-if="selectedPhoto" class="photo-modal" @click="closeModal">
            <div class="modal-content" @click.stop>
                <button class="modal-close" @click="closeModal">×</button>
                <img :src="selectedPhoto.imageUrl" :alt="`Foto de ${selectedPhoto.nombre}`" class="modal-image" />
                <div class="modal-info">
                    <div><strong>Nombre:</strong> {{ selectedPhoto.nombre }}</div>
                    <div><strong>DNI:</strong> {{ selectedPhoto.dni }}</div>
                    <div><strong>Fecha:</strong> {{ formatDate(selectedPhoto.timestamp) }}</div>
                    <div><strong>Hora:</strong> {{ formatTime(selectedPhoto.timestamp) }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { ref, onMounted, onUnmounted } from 'vue'
import { useCameraStore } from '../../stores/camera'

const cameraStore = useCameraStore()
const { recentCroppedPhotos: recentPhotos } = storeToRefs(cameraStore)

const selectedPhoto = ref(null)

// Formatear fecha
const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Hoy'
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer'

    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

// Formatear hora
const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    })
}

// Seleccionar foto para vista modal
const selectPhoto = (photo) => {
    selectedPhoto.value = photo
}

// Cerrar modal
const closeModal = () => {
    selectedPhoto.value = null
}

// Cerrar modal con tecla Escape
const handleEscape = (event) => {
    if (event.key === 'Escape') closeModal()
}

onMounted(() => {
    document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #6c757d;
}

.empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
}

.empty-state h3 {
    margin: 0 0 8px 0;
    color: #495057;
}

.empty-state p {
    margin: 0;
    opacity: 0.8;
}

/* Estilos de la tabla */
.photos-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
}

.photos-table th {
    background: #f8f9fa;
    padding: 16px 12px;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid #e9ecef;
}

.photos-table td {
    padding: 12px;
    border-bottom: 1px solid #f0f0f0;
}

.photo-row:hover {
    background-color: #f8f9fa;
}

/* Columnas específicas */
.image-column {
    width: 120px;
}

.name-column {
    width: 25%;
}

.dni-column {
    width: 20%;
}

.date-column {
    width: 20%;
}

.actions-column {
    width: 100px;
}

/* Celdas específicas */
.table-photo-container {
    width: 80px;
    height: 80px;
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;
    border: 1px solid #e9ecef;
}

.table-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.name-cell {
    font-weight: 500;
}

.dni-cell {
    color: #6c757d;
    font-family: monospace;
}

.date-info {
    display: flex;
    flex-direction: column;
}

.date-main {
    font-weight: 500;
    margin-bottom: 2px;
}

.date-time {
    color: #6c757d;
    font-size: 0.85em;
}

.actions-cell {
    text-align: center;
}

.action-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    background: #007bff;
    color: white;
    cursor: pointer;
}

/* Modal */
.photo-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    padding: 20px;
}

.modal-content {
    position: relative;
    background: white;
    border-radius: 12px;
    max-width: 90vw;
    max-height: 90vh;
    overflow: auto;
}

.modal-close {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 40px;
    height: 40px;
    border: none;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-image {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
    padding: 40px;
}

.modal-info {
    padding: 20px;
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;
    text-align: left;
}

.modal-info div {
    margin: 8px 0;
}

/* Responsive */
@media (max-width: 768px) {

    .photos-table th,
    .photos-table td {
        padding: 10px 8px;
    }

    .table-photo-container {
        width: 60px;
        height: 60px;
    }

    .btn-text {
        display: none;
    }

    .action-btn {
        padding: 8px;
    }

    .modal-content {
        max-width: 95vw;
        max-height: 95vh;
    }

    .modal-image {
        padding: 20px;
        max-height: 60vh;
    }

    .empty-state {
        padding: 40px 20px;
    }

    .empty-icon {
        font-size: 48px;
    }
}

@media (max-width: 600px) {

    .photos-table th,
    .photos-table td {
        padding: 8px 6px;
    }

    .table-photo-container {
        width: 50px;
        height: 50px;
    }

    .image-column {
        width: 70px;
    }

    .actions-column {
        width: 60px;
    }
}

@media (max-width: 480px) {
    .empty-state {
        padding: 30px 15px;
    }

    .empty-icon {
        font-size: 40px;
    }

    .modal-image {
        padding: 15px;
        max-height: 50vh;
    }

    .modal-info {
        padding: 12px;
    }

    .modal-close {
        top: 10px;
        right: 10px;
        width: 35px;
        height: 35px;
    }
}
</style>