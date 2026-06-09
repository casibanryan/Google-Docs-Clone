<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/userStore'
import DocumentSidebar from '@/components/DocumentSidebar.vue'
import DocumentEditor from '@/components/DocumentEditor.vue'
import ShareModal from '@/components/ShareModal.vue'
import UserPromptModal from '@/components/UserPromptModal.vue'
import useDocuments from '@/lib/useDocuments.js'

const userStore = useUserStore()
const showUserPrompt = ref(false)
const promptName = ref('')
const promptError = ref('')

const {
  selectedId,
  shareModalOpen,
  uploadMessage,
  activeDoc,
  ownedDocs,
  sharedDocs,
  activeSharedUsers,
  availableShareUsers,
  currentUser,
  users,
  selectDoc,
  createDocument,
  updateTitle,
  updateContent,
  handleFileUpload,
  openShareModal,
closeShareModal,
  shareDocument,
  removeSharedUser,
  deleteDocument,
} = useDocuments()

const isUserReady = computed(() => !!userStore.currentUser)

const initializeUser = async () => {
  const browserId = userStore.loadBrowserId()
  if (!browserId) {
    showUserPrompt.value = true
    return
  }

  try {
    const existingUser = await userStore.findUserByBrowserId(browserId)
    if (existingUser) {
      userStore.setCurrentUser(existingUser)
      return
    }
    showUserPrompt.value = true
  } catch (error) {
    console.error('Failed to initialize user:', error)
    showUserPrompt.value = true
  }
}

const handleUserSave = async (name) => {
  if (!name || !name.trim()) {
    promptError.value = 'Please enter a name.'
    return
  }

  promptError.value = ''
  const browserId = userStore.loadBrowserId() || crypto.randomUUID?.() || `browser-${Date.now()}-${Math.random().toString(16).slice(2)}`

  try {
    await userStore.ensureCurrentUser(browserId, name.trim())
    showUserPrompt.value = false
  } catch (error) {
    console.error('Unable to save user:', error)
    promptError.value = error?.message || 'Could not save your name. Please try again.'
  }
}

const handlePromptClose = () => {
  promptError.value = ''
  showUserPrompt.value = false
}

onMounted(() => {
  initializeUser()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
    <div class="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-5 lg:px-8">
      <DocumentSidebar
        :ownedDocs="ownedDocs"
        :sharedDocs="sharedDocs"
        :selectedId="selectedId"
        :uploadMessage="uploadMessage"
        :users="users"
        @create-document="createDocument"
        @select-doc="selectDoc"
        @delete-doc="deleteDocument"
        @file-upload="handleFileUpload"
      />

      <main class="flex-1 rounded-[36px] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/40 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/90">
        <template v-if="activeDoc">
          <DocumentEditor
            :activeDoc="activeDoc"
            :currentUser="currentUser"
            :activeSharedUsers="activeSharedUsers"
            @update-title="updateTitle"
            @update-content="updateContent"
            @open-share="openShareModal"
          />
        </template>

        <template v-else>
          <div class="flex min-h-[520px] items-center justify-center rounded-[32px] border border-slate-200/80 bg-slate-50 p-10 text-center shadow-sm dark:border-slate-700/80 dark:bg-slate-900/70">
            <div>
              <h2 class="text-3xl font-semibold text-slate-950 dark:text-slate-100">Select a document from the sidebar</h2>
              <p class="mt-3 text-slate-600 dark:text-slate-400">Create a new document, import content, or choose a shared file to begin editing.</p>
            </div>
          </div>
        </template>
      </main>
    </div>

    <ShareModal
      v-if="shareModalOpen"
      :activeDoc="activeDoc"
      :currentUser="currentUser"
      :activeSharedUsers="activeSharedUsers"
      :availableShareUsers="availableShareUsers"
      @close="closeShareModal"
      @share-user="shareDocument"
      @remove-user="removeSharedUser"
    />

    <UserPromptModal
      :show="showUserPrompt"
      :defaultName="promptName"
      :error="promptError"
      @close="handlePromptClose"
      @save="handleUserSave"
    />
  </div>
</template>

<style scoped>
.toolbar-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
  padding: 0 0.75rem;
  border-radius: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: white;
  color: #334155;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.toolbar-button:hover {
  border-color: #94a3b8;
  background: #f8fafc;
}

.toolbar-button:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(148, 163, 184, 0.25);
}

.prose :where(h1, h2, h3, h4, h5, h6) {
  scroll-margin-top: 3.5rem;
}

.prose p {
  margin-bottom: 1rem;
}
</style>
