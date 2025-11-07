<!-- src/components/ui/Select.vue -->
<template>
  <div class="relative" ref="selectRef">
    <!-- Trigger -->
    <button
      ref="triggerRef"
      type="button"
      :class="triggerClasses"
      :disabled="disabled"
      @click="toggleOpen"
      @keydown="handleTriggerKeydown"
    >
      <span class="flex items-center gap-2 truncate">
        <slot name="value" :value="modelValue" :placeholder="placeholder">
          <span :class="{ 'text-muted-foreground': !modelValue }">
            {{ displayValue || placeholder }}
          </span>
        </slot>
      </span>
      
      <ChevronDownIcon 
        class="size-4 opacity-50 transition-transform duration-200" 
        :class="{ 'rotate-180': isOpen }" 
      />
    </button>

    <!-- Dropdown Content -->
    <div
      v-if="isOpen"
      ref="contentRef"
      :class="contentClasses"
      @click.stop
    >
      <div class="max-h-60 overflow-y-auto p-1">
        <div
          v-for="option in options"
          :key="option.value"
          :class="itemClasses(option.value)"
          @click="selectOption(option)"
          @keydown="handleItemKeydown($event, option)"
        >
          <CheckIcon 
            v-if="modelValue === option.value" 
            class="size-4 absolute right-2" 
          />
          <span class="flex items-center gap-2">
            <slot name="item" :option="option" :selected="modelValue === option.value">
              {{ option.label }}
            </slot>
          </span>
        </div>
        
        <div v-if="options.length === 0" class="px-2 py-1.5 text-sm text-muted-foreground">
          No hay opciones disponibles
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { cn } from '../utils'

interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface Props {
  modelValue?: string | number
  options?: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  size?: 'sm' | 'default'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  options: () => [],
  placeholder: 'Seleccionar...',
  disabled: false,
  className: '',
  size: 'default'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | undefined]
  'change': [value: string | number | undefined]
}>()

const isOpen = ref(false)
const selectRef = ref<HTMLDivElement>()
const triggerRef = ref<HTMLButtonElement>()
const contentRef = ref<HTMLDivElement>()

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  const selectedOption = props.options.find(opt => opt.value === props.modelValue)
  return selectedOption?.label || props.modelValue
})

const triggerClasses = computed(() => 
  cn(
    'border-input data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
    props.size === 'default' ? 'h-9' : 'h-8',
    props.className
  )
)

const contentClasses = computed(() =>
  cn(
    'bg-popover text-popover-foreground absolute top-full z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-md border shadow-md animate-in fade-in-0 zoom-in-95',
    props.className
  )
)

const itemClasses = (value: string | number) =>
  cn(
    'relative flex w-full cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground',
    modelValue.value === value && 'bg-accent text-accent-foreground'
  )

const toggleOpen = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const selectOption = (option: SelectOption) => {
  if (option.disabled) return
  
  emit('update:modelValue', option.value)
  emit('change', option.value)
  isOpen.value = false
}

const handleTriggerKeydown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault()
      toggleOpen()
      break
    case 'Escape':
      isOpen.value = false
      break
    case 'ArrowDown':
      e.preventDefault()
      if (!isOpen.value) {
        isOpen.value = true
      }
      break
  }
}

const handleItemKeydown = (e: KeyboardEvent, option: SelectOption) => {
  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault()
      selectOption(option)
      break
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>