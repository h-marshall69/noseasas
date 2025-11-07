<!-- src\components\ui\ButtonSimple.vue -->

<template>
    <component :is="asChild ? 'slot' : 'button'" data-slot="button" :class="buttonClasses" v-bind="attrs">
        <slot />
    </component>
</template>

<script setup>
import { cn } from '../utils';
import { useAttrs, computed } from 'vue';

const props = defineProps({
  className: { type: String, default: '' },
  variant: {
    type: String,
    default: 'default',
    validator: (value) =>
      ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'].includes(value),
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'sm', 'lg', 'icon'].includes(value),
  },
  asChild: { type: Boolean, default: false },
});

const attrs = useAttrs();

const baseClasses =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";

const variantClasses = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
  outline: "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
  link: "text-primary underline-offset-4 hover:underline",
};

const sizeClasses = {
  default: "h-9 px-4 py-2 has-[>svg]:px-3",
  sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
  lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
  icon: "size-9 rounded-md",
};

const buttonClasses = computed(() =>
  cn(baseClasses, variantClasses[props.variant], sizeClasses[props.size], props.className)
);

const buttonVariants = (options = {}) => {
  const { variant = 'default', size = 'default', className = '' } = options;
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
};

// 👇 Esto expone la función al importar el componente
defineExpose({ buttonVariants });
</script>
