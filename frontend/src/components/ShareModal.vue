<script setup>
import { Trash2 } from '@lucide/vue'
import Button from './ui/Button.vue'
import Card from './ui/Card.vue'
import Modal from './ui/Modal.vue'

const props = defineProps({
  activeDoc: Object,
  currentUser: Object,
  activeSharedUsers: Array,
  availableShareUsers: Array,
})

const emits = defineEmits(['close', 'share-user', 'remove-user'])
</script>

<template>
  <Modal @close="$emit('close')">
    <div class="rounded-[32px] border border-slate-200/90 bg-white p-6 shadow-2xl dark:border-slate-700/90 dark:bg-slate-950">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-2xl font-semibold">Share document</h2>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Grant access to your document with another team member.</p>
        </div>
        <Button variant="secondary" size="sm" @click="$emit('close')">Close</Button>
      </div>

      <div class="mt-6 grid gap-5 md:grid-cols-[1fr_220px]">
        <div class="space-y-4">
          <Card className="rounded-3xl border-slate-200/80 bg-slate-50 p-4 dark:border-slate-700/80 dark:bg-slate-900">
            <p class="text-sm text-slate-500 dark:text-slate-400">Current shared users</p>
            <div class="mt-4 flex flex-wrap gap-2">
              <template v-if="props.activeSharedUsers.length">
                <button
                  v-for="user in props.activeSharedUsers"
                  :key="user.id"
                  @click="$emit('remove-user', user.id)"
                  class="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                >
                  {{ user.name }}
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
              </template>
              <p v-else class="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">Not shared yet.</p>
            </div>
          </Card>

          <Card className="rounded-3xl border-slate-200/80 bg-slate-50 p-4 dark:border-slate-700/80 dark:bg-slate-900">
            <p class="text-sm text-slate-500 dark:text-slate-400">Available teammates</p>
            <div class="mt-4 space-y-3">
              <template v-if="props.availableShareUsers.length">
                <button
                  v-for="user in props.availableShareUsers"
                  :key="user.id"
                  @click="$emit('share-user', user)"
                  class="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-800 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  <span>{{ user.name }}</span>
                </button>
              </template>
              <p v-else class="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">All teammates already have access.</p>
            </div>
          </Card>
        </div>

        <Card className="rounded-3xl border-slate-200/80 bg-slate-50 p-5 dark:border-slate-700/80 dark:bg-slate-900">
          <p class="text-sm text-slate-500 dark:text-slate-400">Share instructions</p>
          <div class="mt-4 space-y-3 rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-950">
            <p class="text-sm text-slate-700 dark:text-slate-200">Select a teammate to grant view access to this document. Shared documents appear in their sidebar under "Shared with me".</p>
            <div class="mt-4 rounded-3xl bg-slate-100 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              Current user: <strong>{{ props.currentUser.name }}</strong>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </Modal>
</template>
