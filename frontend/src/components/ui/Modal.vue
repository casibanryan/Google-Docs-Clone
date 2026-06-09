<script setup>
const emit = defineEmits(['close'])
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" @click.self="emit('close')">
    <div class="w-full max-w-2xl">
      <slot />
    </div>
  </div>
</template>
