<template>
  <DialogTrigger data-slot="alert-dialog-trigger" v-bind="props">
    <slot />
  </DialogTrigger>
</template>

<script setup>
import { DialogTrigger } from 'vueuc';

const props = defineProps();
</script>