<script setup>
import { computed } from 'vue'
import { Plus, Upload, Trash2 } from '@lucide/vue'
import Button from './ui/Button.vue'
import Card from './ui/Card.vue'

const props = defineProps({
  ownedDocs: Array,
  sharedDocs: Array,
  selectedId: String,
  uploadMessage: String,
  users: Array,
})

const emits = defineEmits(['create-document', 'select-doc', 'delete-doc', 'file-upload'])

const hasOwned = computed(() => props.ownedDocs?.length > 0)
const hasShared = computed(() => props.sharedDocs?.length > 0)

const ownerName = (ownerId) => props.users?.find((user) => user.id === ownerId)?.name || 'Unknown'
</script>

<template>
  <aside class="flex w-full max-w-sm flex-col gap-4 rounded-[28px] border border-slate-200/80 bg-white/90 p-4 shadow-xl shadow-slate-200/40 backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/80">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Ajaia Docs</p>
        <h1 class="mt-2 text-2xl font-semibold tracking-tight">Workspace</h1>
      </div>
      <Button variant="default" size="sm" className="inline-flex items-center gap-2" @click="$emit('create-document')">
        <Plus class="h-4 w-4" /> New
      </Button>
    </div>

    <Card className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
      <div class="flex items-center justify-between gap-2">
        <span class="font-medium text-slate-900 dark:text-slate-100">Import file</span>
        <Upload class="h-4 w-4" />
      </div>
      <p>Upload .txt or .md, then continue editing in the document editor.</p>
      <label class="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
        <span>Choose file</span>
        <input type="file" class="hidden" accept=".txt,.md" @change="$emit('file-upload', $event)" />
      </label>
      <p class="text-xs text-slate-500 dark:text-slate-400">{{ uploadMessage }}</p>
    </Card>

    <div class="space-y-4 overflow-hidden">
      <div>
        <div class="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-200">
          <span>Owned documents</span>
          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">{{ props.ownedDocs.length }}</span>
        </div>
        <div class="space-y-2">
          <template v-if="hasOwned">
            <button
              v-for="doc in props.ownedDocs"
              :key="doc.id"
              @click="$emit('select-doc', doc.id)"
              class="flex w-full items-start justify-between gap-3 rounded-[24px] border px-4 py-3 text-left transition hover:border-slate-400/80 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              :class="props.selectedId === doc.id ? 'border-slate-950/80 bg-slate-100 dark:border-slate-400/50 dark:bg-slate-800' : ''"
            >
              <div>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ doc.title }}</p>
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Updated {{ new Date(doc.updatedAt).toLocaleDateString() }}</p>
              </div>
              <button type="button" @click.stop="$emit('delete-doc', doc.id)" class="rounded-full p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-slate-100">
                <Trash2 class="h-4 w-4" />
              </button>
            </button>
          </template>
          <p v-else class="rounded-3xl bg-slate-100 p-4 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">No owned documents yet.</p>
        </div>
      </div>

      <div>
        <div class="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-200">
          <span>Shared with me</span>
          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">{{ props.sharedDocs.length }}</span>
        </div>
        <div class="space-y-2">
          <template v-if="hasShared">
            <button
              v-for="doc in props.sharedDocs"
              :key="doc.id"
              @click="$emit('select-doc', doc.id)"
              class="flex w-full items-start justify-between gap-3 rounded-[24px] border px-4 py-3 text-left transition hover:border-slate-400/80 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              :class="props.selectedId === doc.id ? 'border-slate-950/80 bg-slate-100 dark:border-slate-400/50 dark:bg-slate-800' : ''"
            >
              <div>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ doc.title }}</p>
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Owner: {{ ownerName(doc.user_id) }}</p>
              </div>
            </button>
          </template>
          <p v-else class="rounded-3xl bg-slate-100 p-4 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">No shared documents yet.</p>
        </div>
      </div>
    </div>

    <Card className="mt-auto rounded-[32px] bg-slate-950 p-4 text-white shadow-lg shadow-slate-900/10 dark:bg-slate-950">
      <div class="flex items-center gap-2 text-sm font-semibold">
        <span class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-300 text-slate-950">★</span>
        <span>Quick start</span>
      </div>
      <p class="mt-3 text-sm text-slate-300">Create, edit, upload, and share documents with a lightweight experience designed for team notes.</p>
    </Card>
  </aside>
</template>
