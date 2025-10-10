<template>
    <div style="height: 100%; border: 1px solid #ccc;">
        
        <!-- <Splitter style="height: 100%"> -->
            <!-- <NavigatorInAdmision/> -->
            <!-- <SplitterPanel :size="50" :minSize="40" class="flex align-items-center justify-content-center"> -->
                <!-- <TakePhotoInscripcion /> -->
                <!-- <Nose /> -->
                <!-- <Test /> -->
                <NavigatorInAdmision/>
                
                 
            <!-- </SplitterPanel> -->

            <!-- <SplitterPanel :size="50" :minSize="40" class="flex align-items-center justify-content-center">
                <!-- <PhotoTakedInscripcion /> -->
            <!-- </SplitterPanel> -->

            <!-- <UserInformation /> -->
            

        <!-- </Splitter> -->
    </div>
</template>

<script setup>

import NavigatorInAdmision from '../admision/NavigatorInAdmision.vue'
</script>

<style scoped>
.p-splitter-panel {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>