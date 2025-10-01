<template>
    <div style="height: 100%; border: 1px solid #ccc;">
        
        <Splitter style="height: 100%">
            <SplitterPanel :size="40" :minSize="30" class="flex align-items-center justify-content-center">
                <!-- <TakePhotoInscripcion /> -->
                <Nose />
            </SplitterPanel>

            <SplitterPanel :size="60" :minSize="40" class="flex align-items-center justify-content-center">
                <PhotoTakedInscripcion />
            </SplitterPanel>

            <UserInformation />
            

        </Splitter>
    </div>
</template>

<script setup>
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';

import Nose from '../admision/Nose.vue';
import TakePhotoInscripcion from '../admision/TakePhotoInscripcion.vue';
import PhotoTakedInscripcion from '../admision/PhotoTakedInscripcion.vue';
import UserInformation from '../admision/UserInformation.vue';
</script>

<style scoped>
.p-splitter-panel {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>