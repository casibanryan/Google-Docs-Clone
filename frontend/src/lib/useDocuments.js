import { ref, computed, watch, onMounted, nextTick } from 'vue'

const STORAGE_KEY = 'ajaia-docs-v1'
export const CURRENT_USER = { id: 'user-1', name: 'Alex', email: 'alex@ajaia.test' }
export const USERS = [
  CURRENT_USER,
  { id: 'user-2', name: 'Casey', email: 'casey@ajaia.test' },
  { id: 'user-3', name: 'Morgan', email: 'morgan@ajaia.test' },
]

const docs = ref([])
const selectedId = ref(null)
const shareModalOpen = ref(false)
const uploadMessage = ref('Supports .txt and .md imports')

const activeDoc = computed(() => docs.value.find((doc) => doc.id === selectedId.value) || null)
const ownedDocs = computed(() => docs.value.filter((doc) => doc.ownerId === CURRENT_USER.id))
const sharedDocs = computed(
  () => docs.value.filter((doc) => doc.ownerId !== CURRENT_USER.id && doc.sharedWith.includes(CURRENT_USER.id))
)
const activeSharedUsers = computed(() => {
  if (!activeDoc.value) return []
  return activeDoc.value.sharedWith
    .map((id) => USERS.find((user) => user.id === id))
    .filter(Boolean)
})
const availableShareUsers = computed(() => {
  if (!activeDoc.value) return []
  return USERS.filter(
    (user) => user.id !== CURRENT_USER.id && !activeDoc.value.sharedWith.includes(user.id)
  )
})
const isOwner = computed(() => activeDoc.value?.ownerId === CURRENT_USER.id)

function makeDoc(title, ownerId, content = '<p>Start writing your document here.</p>') {
  return {
    id: `doc-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    content,
    ownerId,
    sharedWith: [],
    updatedAt: new Date().toISOString(),
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      docs.value = parsed.docs || []
      selectedId.value = parsed.selectedId || (docs.value[0] && docs.value[0].id)
    }
  } catch (error) {
    docs.value = []
  }

  if (!docs.value.length) {
    const starter = makeDoc(
      'Welcome to Ajaia Docs',
      CURRENT_USER.id,
      '<p>Use the sidebar to create a new document or upload a file.</p>'
    )
    docs.value = [starter]
    selectedId.value = starter.id
  }
}

function persistState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ docs: docs.value, selectedId: selectedId.value })
  )
}

function selectDoc(docId) {
  selectedId.value = docId
}

function createDocument() {
  const doc = makeDoc('Untitled document', CURRENT_USER.id)
  docs.value.unshift(doc)
  selectedId.value = doc.id
  shareModalOpen.value = false
}

function updateTitle(event) {
  if (!activeDoc.value) return
  activeDoc.value.title = event.target.value
  activeDoc.value.updatedAt = new Date().toISOString()
}

function updateContent(html) {
  if (!activeDoc.value || typeof html !== 'string') return
  activeDoc.value.content = html
  activeDoc.value.updatedAt = new Date().toISOString()
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
    // If there's an active document, import into the existing draft instead
    if (activeDoc.value) {
      activeDoc.value.content = (activeDoc.value.content || '') + content
      activeDoc.value.updatedAt = new Date().toISOString()
      uploadMessage.value = `Imported ${file.name} into ${activeDoc.value.title}`
      // Notify any open editor to insert at caret if focused
      try {
        window.dispatchEvent(new CustomEvent('ajaia:importContent', { detail: { html: content } }))
      } catch (err) {
        // ignore (non-browser environments)
      }
      event.target.value = ''
      return
    }

    // Fallback: create a new document when no active doc
    const doc = makeDoc(file.name.replace(/\.[^/.]+$/, ''), CURRENT_USER.id, content)
    docs.value.unshift(doc)
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

onMounted(() => {
  loadState()
})

watch([docs, selectedId], () => {
  persistState()
}, { deep: true })

export default function useDocuments() {
  return {
    docs,
    selectedId,
    shareModalOpen,
    uploadMessage,
      activeDoc,
    ownedDocs,
    sharedDocs,
    activeSharedUsers,
    availableShareUsers,
    isOwner,
    CURRENT_USER,
    USERS,
    selectDoc,
    createDocument,
    updateTitle,
    updateContent,
    handleFileUpload,
    openShareModal,
    closeShareModal,
    shareDocument,
    removeSharedUser,
  }
}
