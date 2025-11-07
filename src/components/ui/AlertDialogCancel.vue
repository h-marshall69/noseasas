<template>
  <ButtonSimple
    variant="outline"
    :class="props.className"
    v-bind="props"
    @click="handleCancel"
  >
    <slot />
  </ButtonSimple>
</template>

<script setup>
import ButtonSimple from './ButtonSimple.vue';

const props = defineProps({
  className: String
});

const emit = defineEmits(['click', 'cancel']);

const handleCancel = (e) => {
  emit('click', e);
  emit('cancel', e);
};
</script>
