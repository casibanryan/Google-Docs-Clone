<script setup>
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { useAttrs } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  variant: { type: String, default: 'default' },
  size: { type: String, default: 'md' },
  type: { type: String, default: 'button' },
  className: { type: String, default: '' },
})

const attrs = useAttrs()

const buttonStyles = cva(
  'inline-flex items-center justify-center rounded-2xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-slate-950 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200',
        secondary: 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
        ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-sm',
        lg: 'h-12 px-5 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

const classes = computed(() => cn(buttonStyles({ variant: props.variant, size: props.size }), props.className))
</script>

<template>
  <button :type="props.type" :class="classes" v-bind="attrs">
    <slot />
  </button>
</template>
