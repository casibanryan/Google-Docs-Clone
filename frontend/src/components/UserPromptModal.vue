<script setup>
import { ref, watch } from 'vue'
import Modal from './ui/Modal.vue'
import Button from './ui/Button.vue'

const props = defineProps({
  show: Boolean,
  error: String,
  defaultName: {
    type: String,
    default: '',
  },
})
const emit = defineEmits(['close', 'save'])

const name = ref(props.defaultName)

watch(
  () => props.defaultName,
  (value) => {
    name.value = value
  }
)

const submit = () => {
  const trimmed = name.value.trim()
  if (!trimmed) {
    emit('save', null)
    return
  }
  emit('save', trimmed)
}
</script>

<template>
  <Modal v-if="props.show" @close="$emit('close')">
    <div class="rounded-[32px] border border-slate-200/90 bg-white p-6 shadow-2xl dark:border-slate-700/90 dark:bg-slate-950">
      <div class="space-y-4">
        <div>
          <h2 class="text-2xl font-semibold">Welcome to Ajaia</h2>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">Please enter your name so we can save your workspace and connect your browser.</p>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Your name</label>
          <input
            v-model="name"
            @keydown.enter.prevent="submit"
            type="text"
            class="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Enter your name"
          />
          <p v-if="props.error" class="mt-2 text-sm text-rose-500">{{ props.error }}</p>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" size="sm" className="w-full sm:w-auto" @click="$emit('close')">Cancel</Button>
          <Button size="sm" className="w-full sm:w-auto" @click="submit">Continue</Button>
        </div>
      </div>
    </div>
  </Modal>
</template>
