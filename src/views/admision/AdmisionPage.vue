<template>
    <Splitter style="height: 100%">
        <SplitterPanel :size="40" :minSize="33" class="flex align-items-center justify-content-center">
            <TakePhoto />
        </SplitterPanel>

        <SplitterPanel :size="40" :minSize="33" class="flex align-items-center justify-content-center">
            <PhotoTaken />
        </SplitterPanel>

        <SplitterPanel :size="40" :minSize="33" class="flex align-items-center justify-content-center">
            <SavedPhoto />
        </SplitterPanel>
    </Splitter>
</template>
<script setup>
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import TakePhoto from './TakePhoto.vue';
import SavedPhoto from './SavedPhoto.vue';
import PhotoTaken from './PhotoTaken.vue';
import Nose from './Nose.vue';
</script>
<style scoped></style>