import { ref, computed, watch, onMounted } from 'vue'
import { useDocumentStore } from '@/store/documentStore'
import { useUserStore } from '@/store/userStore'

const STORAGE_KEY = 'ajaia-docs-v1'
const selectedId = ref(null)
const shareModalOpen = ref(false)
const uploadMessage = ref('Supports .txt and .md imports')

function makeDoc(title, userId, content = '<p>Start writing your document here.</p>') {
  return {
    id: `doc-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    content,
    user_id: userId,
    sharedWith: [],
    excerpt: null,
    meta: null,
    is_public: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

function loadState(store) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      selectedId.value = parsed.selectedId
    }
  } catch (error) {
    console.error('Error loading state:', error)
  }

  if (!selectedId.value && store.documents.length > 0) {
    selectedId.value = store.documents[0].id
  }
}

function persistState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ selectedId: selectedId.value })
  )
}

export default function useDocuments() {
  const documentStore = useDocumentStore()
  const userStore = useUserStore()

  const currentUser = computed(() => userStore.currentUser)
  const users = computed(() => userStore.users)

  const activeDoc = computed(() => documentStore.documents.find((doc) => doc.id === selectedId.value) || null)
  const ownedDocs = computed(() => {
    if (!currentUser.value) return []
    return documentStore.documents.filter((doc) => doc.user_id === currentUser.value.id)
  })
  const sharedDocs = computed(() => {
    if (!currentUser.value) return []
    return documentStore.documents.filter(
      (doc) => doc.user_id !== currentUser.value.id && (doc.sharedWith || []).includes(currentUser.value.id)
    )
  })
  const activeSharedUsers = computed(() => {
    if (!activeDoc.value || !activeDoc.value.sharedWith) return []
    return activeDoc.value.sharedWith
      .map((id) => users.value.find((user) => user.id === id))
      .filter(Boolean)
  })
  const availableShareUsers = computed(() => {
    if (!activeDoc.value || !currentUser.value) return []
    return users.value.filter(
      (user) => user.id !== currentUser.value.id && !(activeDoc.value.sharedWith || []).includes(user.id)
    )
  })
  const isOwner = computed(() => activeDoc.value?.user_id === currentUser.value?.id)

  function selectDoc(docId) {
    selectedId.value = docId
  }

  async function createDocument() {
    if (!currentUser.value) {
      uploadMessage.value = 'Please create a user before adding documents.'
      return
    }

    const doc = makeDoc('Untitled document', currentUser.value.id)
    const data = await documentStore.createDocument(doc).catch(() => {
      documentStore.documents.unshift(doc)
    })
    selectedId.value = data.id
    shareModalOpen.value = false
  }

  function updateTitle(event) {
    if (!activeDoc.value) return
    activeDoc.value.title = event.target.value
    activeDoc.value.updatedAt = new Date().toISOString()

    documentStore.updateDocument(activeDoc.value.id, {
      title: activeDoc.value.title,
      updatedAt: activeDoc.value.updatedAt,
    }).catch((err) => {
      console.error('Failed to update title:', err)
    })
  }

  function updateContent(html) {
    if (!activeDoc.value || typeof html !== 'string') return
    activeDoc.value.content = html
    activeDoc.value.updatedAt = new Date().toISOString()

    documentStore.updateDocument(activeDoc.value.id, {
      content: activeDoc.value.content,
      updatedAt: activeDoc.value.updatedAt,
    }).catch((err) => {
      console.error('Failed to update content:', err)
    })
  }

  function handleFileUpload(event) {
    const file = event.target.files?.[0]
    if (!file) {
      uploadMessage.value = 'No file selected.'
      return
    }

    const supported = ['txt', 'md']
    const extension = file.name.split('.').pop().toLowerCase()

    if (!supported.includes(extension)) {
      uploadMessage.value = 'Only .txt and .md files are supported right now.'
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const raw = String(reader.result || '')
      const content = `<div>${raw
        .split(/\r?\n/)
        .map((line) => `<p>${line || '&nbsp;'}</p>`)
        .join('')}</div>`

      if (activeDoc.value) {
        activeDoc.value.content = (activeDoc.value.content || '') + content
        activeDoc.value.updatedAt = new Date().toISOString()
        uploadMessage.value = `Imported ${file.name} into ${activeDoc.value.title}`
        try {
          window.dispatchEvent(new CustomEvent('ajaia:importContent', { detail: { html: content } }))
        } catch (err) {
          // ignore (non-browser environments)
        }
        event.target.value = ''
        return
      }

      if (!currentUser.value) {
        uploadMessage.value = 'Please create a user before importing documents.'
        event.target.value = ''
        return
      }

      const doc = makeDoc(file.name.replace(/\.[^/.]+$/, ''), currentUser.value.id, content)
      documentStore.createDocument(doc).catch(() => {
        documentStore.documents.unshift(doc)
      })
      selectedId.value = doc.id
      uploadMessage.value = `Imported ${file.name}`
      event.target.value = ''
    }
    reader.readAsText(file)
  }

  function openShareModal() {
    if (!activeDoc.value) return
    shareModalOpen.value = true
  }

  function closeShareModal() {
    shareModalOpen.value = false
  }

  function shareDocument(userId) {
    if (!activeDoc.value || !userId) return
    if (!activeDoc.value.sharedWith.includes(userId)) {
      activeDoc.value.sharedWith.push(userId)
      activeDoc.value.updatedAt = new Date().toISOString()
    }
  }

  function removeSharedUser(userId) {
    if (!activeDoc.value) return
    activeDoc.value.sharedWith = activeDoc.value.sharedWith.filter((id) => id !== userId)
    activeDoc.value.updatedAt = new Date().toISOString()
  }

  watch([selectedId], () => {
    persistState()
  }, { deep: true })

  onMounted(async () => {
    try {
      await documentStore.fetchDocuments()
      loadState(documentStore)
    } catch (err) {
      console.error('Failed to fetch documents:', err)
      loadState(documentStore)
    }
  })

  return {
    docs: computed(() => documentStore.documents),
    selectedId,
    shareModalOpen,
    uploadMessage,
    activeDoc,
    ownedDocs,
    sharedDocs,
    activeSharedUsers,
    availableShareUsers,
    isOwner,
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
    loading: computed(() => documentStore.loading),
    error: computed(() => documentStore.error),
  }
}
