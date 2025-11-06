<template>
  <div class="container">
    <main class="main-content">
      <!-- Search Section -->
      <div class="search-section">
        <div class="search-content">
          <div class="search-header">
            <div class="search-icon">
              <SearchIcon />
            </div>
            <h2>Buscar mi foto de carnet</h2>
            <p>
              Ingresa tu número de matrícula para consultar el estado de tu foto
            </p>
          </div>

          <div class="search-form">
            <div class="input-group">
              <label for="studentId">Número de Matrícula</label>
              <input
                id="studentId"
                v-model="studentId"
                @keypress.enter="handleSearch"
                placeholder="Ej: 2025001234"
                class="search-input"
              />
            </div>
            <button
              @click="handleSearch"
              class="search-button"
            >
              <SearchIcon />
              Buscar
            </button>
          </div>
        </div>
      </div>

      <!-- Results Section -->
      <div v-if="hasSearched" class="results-section">
        <div class="results-content">
          <div v-if="searchedStudent" class="student-found">
            <!-- Status Header -->
            <div class="status-header">
              <h3>Estado de tu foto de carnet</h3>
              <span class="status-badge">
                <CheckCircle2Icon />
                Foto registrada
              </span>
            </div>

            <div class="student-details">
              <!-- Image -->
              <div class="image-section">
                <div class="image-container">
                  <img
                    :src="searchedStudent.imageUrl"
                    :alt="searchedStudent.name"
                    class="student-image"
                    @error="handleImageError"
                  />
                </div>
                <button
                  @click="handleDownload(searchedStudent)"
                  class="download-button primary"
                >
                  <DownloadIcon />
                  Descargar foto
                </button>
                <button
                  @click="handleViewProfile"
                  class="download-button secondary"
                >
                  <UserIcon />
                  Ver perfil completo
                </button>
              </div>

              <!-- Information -->
              <div class="info-section">
                <div class="personal-info">
                  <h3>Información personal</h3>
                  
                  <div class="info-grid">
                    <div class="info-item">
                      <HashIcon />
                      <div>
                        <p class="info-label">Matrícula</p>
                        <p class="info-value">{{ searchedStudent.studentId }}</p>
                      </div>
                    </div>

                    <div class="info-item">
                      <UserIcon />
                      <div>
                        <p class="info-label">Nombre completo</p>
                        <p class="info-value">{{ searchedStudent.name }}</p>
                      </div>
                    </div>

                    <div class="info-item">
                      <GraduationCapIcon />
                      <div>
                        <p class="info-label">Carrera</p>
                        <p class="info-value">{{ searchedStudent.course }}</p>
                      </div>
                    </div>

                    <div class="info-item">
                      <ClockIcon />
                      <div>
                        <p class="info-label">Grado/Año</p>
                        <p class="info-value">{{ searchedStudent.grade }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="info-message">
                  <p>
                    Tu foto de carnet ha sido registrada correctamente. 
                    Podrás recoger tu carnet en la oficina administrativa según el calendario establecido.
                  </p>
                </div>

                <!-- Additional Options -->
                <div class="additional-options">
                  <h4>Opciones adicionales</h4>
                  <div class="options-grid">
                    <button @click="handleScheduleAppointment" class="option-button">
                      <CalendarIcon />
                      Programar cita de recogida
                    </button>
                    <button @click="handleViewCalendar" class="option-button">
                      <CalendarIcon />
                      Ver calendario de recogidas
                    </button>
                    <button @click="handleContactSupport" class="option-button">
                      <MessageCircleIcon />
                      Contactar soporte
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="student-not-found">
            <div class="error-icon">
              <XCircleIcon />
            </div>
            <h3>No se encontró registro</h3>
            <p class="error-message">
              No existe una foto de carnet asociada al número de matrícula <strong>{{ studentId }}</strong>
            </p>
            <p class="error-help">
              Verifica que el número de matrícula sea correcto o contacta con la administración.
            </p>
            <!-- Options for not found -->
            <div class="additional-options">
              <h4>¿Qué puedes hacer?</h4>
              <div class="options-grid">
                <button @click="handleUploadPhoto" class="option-button primary">
                  <UploadIcon />
                  Subir foto de carnet
                </button>
                <button @click="handleContactSupport" class="option-button">
                  <MessageCircleIcon />
                  Solicitar ayuda
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Section -->
      <div v-if="!hasSearched" class="info-cards">
        <div class="info-card">
          <div class="card-content">
            <div class="card-icon">
              <SearchIcon />
            </div>
            <h3>Busca tu foto</h3>
            <p>
              Ingresa tu número de matrícula para ver tu foto registrada
            </p>
          </div>
        </div>

        <div class="info-card">
          <div class="card-content">
            <div class="card-icon">
              <CheckCircle2Icon />
            </div>
            <h3>Verifica el estado</h3>
            <p>
              Consulta si tu foto ha sido registrada correctamente
            </p>
          </div>
        </div>

        <div class="info-card">
          <div class="card-content">
            <div class="card-icon">
              <DownloadIcon />
            </div>
            <h3>Descarga tu foto</h3>
            <p>
              Descarga una copia de tu foto de carnet
            </p>
          </div>
        </div>

        <div class="info-card">
          <div class="card-content">
            <div class="card-icon">
              <CalendarIcon />
            </div>
            <h3>Programa tu cita</h3>
            <p>
              Agenda la recogida de tu carnet universitario
            </p>
          </div>
        </div>

        <div class="info-card">
          <div class="card-content">
            <div class="card-icon">
              <UploadIcon />
            </div>
            <h3>Sube tu foto</h3>
            <p>
              Registra tu foto si aún no lo has hecho
            </p>
          </div>
        </div>

        <div class="info-card">
          <div class="card-content">
            <div class="card-icon">
              <MessageCircleIcon />
            </div>
            <h3>Obtén ayuda</h3>
            <p>
              Contacta con el equipo de soporte para cualquier duda
            </p>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <p>
          Si tienes alguna duda o problema, contacta con la oficina administrativa
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref } from 'vue';

// Icons components (simplified SVG icons)
const SearchIcon = {
  template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>'
};

const CheckCircle2Icon = {
  template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
};

const XCircleIcon = {
  template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>'
};

const DownloadIcon = {
  template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>'
};

const UserIcon = {
  template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
};

const GraduationCapIcon = {
  template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>'
};

const HashIcon = {
  template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>'
};

const ClockIcon = {
  template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
};

const CalendarIcon = {
  template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>'
};

const MessageCircleIcon = {
  template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>'
};

const UploadIcon = {
  template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>'
};

export default {
  name: 'StudentPortal',
  components: {
    SearchIcon,
    CheckCircle2Icon,
    XCircleIcon,
    DownloadIcon,
    UserIcon,
    GraduationCapIcon,
    HashIcon,
    ClockIcon,
    CalendarIcon,
    MessageCircleIcon,
    UploadIcon
  },
  props: {
    images: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    // State
    const studentId = ref('');
    const searchedStudent = ref(null);
    const hasSearched = ref(false);

    // Methods
    const handleSearch = () => {
      if (!studentId.value.trim()) return;
      
      const found = props.images.find(img => img.studentId === studentId.value.trim());
      searchedStudent.value = found || null;
      hasSearched.value = true;
    };

    const handleDownload = (image) => {
      const link = document.createElement('a');
      link.href = image.imageUrl;
      link.download = `carnet_${image.studentId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const handleViewProfile = () => {
      // Implementar navegación o modal para perfil completo
      alert('Navegando al perfil completo del estudiante');
    };

    const handleScheduleAppointment = () => {
      // Implementar programación de cita
      alert('Abriendo formulario de programación de cita');
    };

    const handleViewCalendar = () => {
      // Implementar vista de calendario
      alert('Mostrando calendario de recogidas');
    };

    const handleContactSupport = () => {
      // Implementar contacto con soporte
      alert('Abriendo chat o formulario de soporte');
    };

    const handleUploadPhoto = () => {
      // Implementar subida de foto
      alert('Abriendo formulario para subir foto');
    };

    const handleImageError = (e) => {
      const target = e.target;
      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EImagen no disponible%3C/text%3E%3C/svg%3E';
    };

    return {
      studentId,
      searchedStudent,
      hasSearched,
      handleSearch,
      handleDownload,
      handleViewProfile,
      handleScheduleAppointment,
      handleViewCalendar,
      handleContactSupport,
      handleUploadPhoto,
      handleImageError
    };
  }
};
</script>

<style scoped>
/* Estilos básicos para que el componente sea funcional */
.container {
  min-height: 100vh;
  font-family: Arial, sans-serif;
}

.main-content {
  max-width: none; /* Expandir a ancho completo */
  margin: 0 auto;
  padding: 3rem 2rem; /* Aumentar padding lateral para mejor uso de pantalla */
  width: 100%;
}

.search-section {
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #ddd;
  max-width: 100%;
}

.search-content {
  padding: 3rem; /* Aumentar padding para más espacio */
  max-width: 1200px;
  margin: 0 auto;
}

.search-header {
  text-align: center;
  margin-bottom: 2rem; /* Más espacio */
}

.search-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 5rem; /* Aumentar tamaño del icono */
  height: 5rem;
  border-radius: 50%;
  background: #dbeafe;
  margin-bottom: 1.5rem;
}

.search-icon svg {
  width: 2.5rem;
  height: 2.5rem;
  color: #2563eb;
}

.search-header h2 {
  margin-bottom: 0.75rem;
  font-size: 2rem; /* Aumentar tamaño de fuente */
  font-weight: 600;
}

.search-header p {
  font-size: 1rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.search-form {
  max-width: 32rem; /* Un poco más ancho */
  margin: 0 auto;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem; /* Más padding */
  border: 1px solid #ccc;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-button {
  width: 100%;
  background: #2563eb;
  color: white;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 1.125rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: background 0.2s;
}

.search-button:hover {
  background: #1d4ed8;
}

.search-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.results-section {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #ddd;
  margin-bottom: 2rem;
  max-width: 100%;
}

.results-content {
  padding: 3rem; /* Más padding */
  max-width: 1200px;
  margin: 0 auto;
}

.status-header {
  text-align: center;
  padding-bottom: 2rem;
  border-bottom: 1px solid #ddd;
  margin-bottom: 2rem;
}

.status-header h3 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #059669;
  color: white;
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
}

.status-badge svg {
  width: 1.25rem;
  height: 1.25rem;
}

.student-details {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem; /* Más gap */
}

@media (min-width: 768px) {
  .student-details {
    grid-template-columns: 1fr 1.5fr; /* Ajustar proporciones para más espacio en info */
  }
}

.image-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.image-container {
  position: relative;
  background: #f3f4f6;
  border-radius: 0.5rem;
  overflow: hidden;
  aspect-ratio: 3/4;
  max-width: 300px; /* Limitar ancho de imagen para mejor escalado */
  margin: 0 auto;
}

.student-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.download-button {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
  border: 1px solid #ccc;
}

.download-button.primary {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.download-button.primary:hover {
  background: #1d4ed8;
}

.download-button.secondary {
  background: white;
  color: #2563eb;
}

.download-button.secondary:hover {
  background: #f0f9ff;
  border-color: #2563eb;
}

.download-button svg {
  width: 1rem;
  height: 1rem;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.personal-info h3 {
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.info-item svg {
  width: 1.5rem;
  height: 1.5rem;
  color: #666;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.info-label {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

.info-value {
  font-weight: 500;
  margin: 0;
  font-size: 1rem;
}

.info-message {
  background: #dbeafe;
  border: 1px solid #93c5fd;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.info-message p {
  font-size: 0.875rem;
  color: #1e40af;
  margin: 0;
  line-height: 1.5;
}

.additional-options {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #ddd;
}

.additional-options h4 {
  margin-bottom: 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .options-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.option-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  text-align: left;
}

.option-button.primary {
  background: #dbeafe;
  border-color: #2563eb;
  color: #2563eb;
}

.option-button:hover {
  background: #f9fafb;
  border-color: #2563eb;
  transform: translateY(-1px);
}

.option-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.student-not-found {
  text-align: center;
  padding: 3rem 0; /* Más padding */
}

.error-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background: #fee2e2;
  margin-bottom: 1.5rem;
}

.error-icon svg {
  width: 2.5rem;
  height: 2.5rem;
  color: #dc2626;
}

.student-not-found h3 {
  margin-bottom: 0.75rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.error-message {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1rem;
}

.error-help {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 2rem;
}

.info-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-top: 2rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

@media (min-width: 640px) {
  .info-cards {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1024px) {
    .info-cards {
      grid-template-columns: repeat(6, 1fr); /* Expandir a 6 columnas para más opciones */
    }
  }
}

.info-card {
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #ddd;
  transition: transform 0.2s;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-content {
  padding: 2rem 1.5rem; /* Más padding */
  text-align: center;
}

.card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem; /* Aumentar tamaño */
  height: 4rem;
  border-radius: 50%;
  margin-bottom: 1rem;
  margin: 0 auto 1rem;
}

.card-icon svg {
  width: 1.75rem;
  height: 1.75rem;
}

.info-card:nth-child(1) .card-icon {
  background: #dbeafe;
}

.info-card:nth-child(1) .card-icon svg {
  color: #2563eb;
}

.info-card:nth-child(2) .card-icon {
  background: #dcfce7;
}

.info-card:nth-child(2) .card-icon svg {
  color: #16a34a;
}

.info-card:nth-child(3) .card-icon {
  background: #f3e8ff;
}

.info-card:nth-child(3) .card-icon svg {
  color: #9333ea;
}

.info-card:nth-child(4) .card-icon {
  background: #fef3c7;
}

.info-card:nth-child(4) .card-icon svg {
  color: #d97706;
}

.info-card:nth-child(5) .card-icon {
  background: #fed7d7;
}

.info-card:nth-child(5) .card-icon svg {
  color: #ef4444;
}

.info-card:nth-child(6) .card-icon {
  background: #e0e7ff;
}

.info-card:nth-child(6) .card-icon svg {
  color: #6366f1;
}

.info-card h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.info-card p {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.footer {
  margin-top: 4rem;
  padding: 3rem 0;
  border-top: 1px solid #ddd;
  background: white;
  max-width: 100%;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
}

.footer p {
  font-size: 1rem;
  color: #666;
  margin: 0;
}
</style>