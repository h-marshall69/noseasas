<template>
    <div class="search-container">
        <h3>Buscar Imágenes por DNI</h3>

        <form @submit.prevent="searchDni">
            <div class="input-group">
                <input v-model="dniInput" type="text" placeholder="Ingrese número de DNI" :disabled="loading"
                    class="search-input" maxlength="8" />
                <button type="submit" :disabled="loading" class="search-button">
                    <span v-if="loading">Buscando...</span>
                    <span v-else>Buscar</span>
                </button>
            </div>
        </form>

        <!-- Estado de carga -->
        <div v-if="loading" class="loading-state">
            <p>Buscando imágenes para DNI {{ dniInput }}...</p>
        </div>

        <!-- Resultados exitosos -->
        <div v-else-if="result && result.status === 'success'">
            <div class="result-header">
                <h3>{{ result.message }}</h3>
            </div>

            <div class="photos-grid">
                <div v-for="(photo, index) in result.photos" :key="index" class="photo-card">
                    <img :src="getFullImageUrl(photo.imageUrl)" :alt="photo.filename" class="photo-image" />
                    <p class="filename">{{ photo.filename }}</p>
                </div>
            </div>
        </div>

        <!-- Error -->
        <div v-else-if="result && result.status === 'error'" class="error-result">
            <h3>❌ {{ result.message }}</h3>
            <p>Verifique que el DNI sea correcto.</p>
        </div>
    </div>
</template>

<script>
import { PhotoService } from '../../services/photoService';
import { makeFormData } from '../../abadeer_truco/utilities/FormDataMaker';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default {
    name: 'DniSearch',
    data() {
        return {
            dniInput: '',
            loading: false,
            result: null
        }
    },
    methods: {
        async searchDni() {
            if (this.dniInput.length !== 8) return;

            this.loading = true;
            this.result = null;

            try {
                const formData = makeFormData({
                    dni: this.dniInput,
                    codes: ["00000000-0000-0000-0000-000000000000"]
                });

                const response = await PhotoService.getPhotosDni(formData);
                this.result = response.data;

            } catch (err) {
                this.result = {
                    status: 'error',
                    message: 'Error al buscar el DNI'
                };
            } finally {
                this.loading = false;
            }
        },

        getFullImageUrl(relativeUrl) {
            if (relativeUrl.startsWith('http')) {
                return relativeUrl;
            }
            return `${BASE_URL}${relativeUrl}`;
        }
    }
}
</script>

<style scoped>
.search-container {
    background: white;
    border-radius: 10px;
    padding: 30px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.input-group {
    display: flex;
    gap: 10px;
}

.search-input {
    flex: 1;
    padding: 12px 15px;
    border: 2px solid #e1e5e9;
    border-radius: 6px;
    font-size: 16px;
}

.search-input:focus {
    outline: none;
    border-color: #007bff;
}

.search-button {
    padding: 12px 25px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
}

.search-button:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.loading-state {
    text-align: center;
    padding: 40px;
}

.photos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
}

.photo-card {
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    overflow: hidden;
    text-align: center;
}

.photo-image {
    width: 100%;
    height: 150px;
    object-fit: cover;
}

.filename {
    padding: 10px;
    font-size: 14px;
    word-break: break-all;
}

.error-result {
    text-align: center;
    padding: 40px;
    color: #dc3545;
}

@media (max-width: 768px) {
    .input-group {
        flex-direction: column;
    }

    .photos-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
}
</style>