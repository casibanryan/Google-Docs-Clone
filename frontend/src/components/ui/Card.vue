<script setup>
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  className: { type: String, default: '' },
})

const classes = computed(() =>
  cn(
    'rounded-3xl border border-slate-200/80 bg-slate-50 p-4 shadow-sm dark:border-slate-700/80 dark:bg-slate-900',
    props.className
  )
)
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
