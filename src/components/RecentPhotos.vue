<!-- components/RecentPhotos.vue -->
<template>
    <div class="recent-photos-container">
        <nav class="photos-navbar">
            <div class="nav-tabs">
                <button class="nav-tab" :class="{ 'active': activeTab === 'recent' }" @click="activeTab = 'recent'">
                    📸 Recientes
                </button>
                <button class="nav-tab" :class="{ 'active': activeTab === 'all' }" @click="activeTab = 'all'">
                    📂 Todas las Fotos
                </button>
            </div>
        </nav>

        <div class="tab-content">
            <Recent v-if="activeTab === 'recent'" />
            <RecentAll v-else />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import Recent from '../components/recent/Recent.vue'
import RecentAll from '../components/recent/RecentAll.vue'

const activeTab = ref('recent')
</script>

<style scoped>
.recent-photos-container {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin: 20px 0;
}

.photos-navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: #f8f9fa;
    border-bottom: 2px solid #e9ecef;
    gap: 20px;
}

.nav-tabs {
    display: flex;
    gap: 8px;
    background: #e9ecef;
    padding: 4px;
    border-radius: 8px;
}

.nav-tab {
    padding: 10px 20px;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    color: #6c757d;
    transition: all 0.3s ease;
    font-size: 0.95em;
    display: flex;
    align-items: center;
    gap: 8px;
}

.nav-tab:hover {
    background: rgba(0, 123, 255, 0.1);
    color: #007bff;
}

.nav-tab.active {
    background: #007bff;
    color: white;
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.tab-content {
    padding: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
    .recent-photos-container {
        margin: 10px 0;
        border-radius: 8px;
    }

    .photos-navbar {
        padding: 12px 16px;
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
    }

    .nav-tabs {
        width: 100%;
        justify-content: stretch;
    }

    .nav-tab {
        flex: 1;
        justify-content: center;
        padding: 12px 16px;
        font-size: 0.9em;
    }
}
</style>
