<!-- src/views/Home.vue -->
<template>
  <div class="home-container">
    <header class="hero-section">
      <h1 class="app-title">Aplicación de Reconocimiento Facial</h1>
      <p class="app-description">
        Explora nuestras herramientas de captura y detección facial
      </p>
    </header>

    <main class="features-section">
      <h2 class="section-title">Funcionalidades Disponibles</h2>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            📷
          </div>
          <h3 class="feature-title">Tomar Foto</h3>
          <p class="feature-description">
            Captura fotografías utilizando la cámara de tu dispositivo.
            Perfecto para crear álbumes o tomar imágenes para análisis.
          </p>
          <router-link
            to="/take-photo"
            class="feature-link"
          >
            Probar Tomar Foto
          </router-link>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            👁️
          </div>
          <h3 class="feature-title">Detección Facial</h3>
          <p class="feature-description">
            Analiza imágenes para detectar rostros utilizando algoritmos
            avanzados de reconocimiento facial.
          </p>
          <router-link
            to="/face-detection"
            class="feature-link"
          >
            Probar Detección Facial
          </router-link>
        </div>

        <!-- Nueva tarjeta para el CRUD -->
        <div class="feature-card">
          <div class="feature-icon">
            📂
          </div>
          <h3 class="feature-title">Gestión de Fotos</h3>
          <p class="feature-description">
            Administra tu galería de fotos: visualiza, edita y elimina
            imágenes capturadas con nuestra herramienta de gestión.
          </p>
          <router-link
            to="/crud"
            class="feature-link"
          >
            Gestionar Fotos
          </router-link>
        </div>
      </div>
    </main>

    <footer class="app-footer">
      <p>Aplicación desarrollada con Vue.js</p>
    </footer>
  </div>
</template>

<script setup>
// No se necesita lógica adicional para la página de inicio básica
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.hero-section {
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.app-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.app-description {
  font-size: 1.2rem;
  color: #7f8c8d;
  max-width: 600px;
  margin: 0 auto;
}

.features-section {
  flex: 1;
  padding: 3rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 2.5rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow:   4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.feature-description {
  color: #7f8c8d;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  flex: 1;
}

.feature-link {
  display: inline-block;
  background: #3498db;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.3s ease;
}

.feature-link:hover {
  background: #2980b9;
}

.app-footer {
  text-align: center;
  padding: 1.5rem;
  background: #2c3e50;
  color: white;
  margin-top: auto;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .app-title {
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .feature-card {
    padding: 1.5rem;
  }
}
</style>