<script setup>
import { computed, ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import { Bold, Italic, Underline, List, ListOrdered, Heading, Share2, Users, FileText, UserCheck } from '@lucide/vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'

const props = defineProps({
  activeDoc: Object,
  currentUser: Object,
  activeSharedUsers: Array,
})

const emits = defineEmits(['update-title', 'update-content', 'open-share'])
const editor = ref(null)
const selectionRange = ref(null)
const editorHasFocus = ref(false)
const activeStates = ref({
  bold: false,
  italic: false,
  underline: false,
  heading: false,
  bullet: false,
  ordered: false,
})
const sharedCount = computed(() => props.activeSharedUsers?.length || 0)

function rememberSelection() {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  selectionRange.value = selection.getRangeAt(0)
}

function restoreSelection() {
  const selection = window.getSelection()
  if (!selection) return
  selection.removeAllRanges()
  if (selectionRange.value) {
    selection.addRange(selectionRange.value)
  }
}

function formatText(command, value = null) {
  if (!editor.value) return
  restoreSelection()
  editor.value.focus()

  let actualValue = value
  if (command === 'formatBlock' && value === 'H1' && activeStates.value.heading) {
    actualValue = 'P'
  }

  document.execCommand(command, false, actualValue)
  emitContent()
  nextTick(updateActiveStates)
}

function updateActiveStates() {
  if (!editor.value) return
  activeStates.value.bold = document.queryCommandState('bold')
  activeStates.value.italic = document.queryCommandState('italic')
  activeStates.value.underline = document.queryCommandState('underline')
  activeStates.value.bullet = document.queryCommandState('insertUnorderedList')
  activeStates.value.ordered = document.queryCommandState('insertOrderedList')
  activeStates.value.heading = getHeadingState()
  markSelectedHeading()
}

function getHeadingState() {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false
  let node = selection.anchorNode
  while (node && node !== editor.value) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const name = node.nodeName.toLowerCase()
      if (name === 'h1') return true
      if (name === 'p' || name === 'div' || /^h[1-6]$/.test(name) || name === 'li') return false
    }
    node = node.parentNode
  }
  const formatBlock = document.queryCommandValue('formatBlock') || ''
  return String(formatBlock).toLowerCase() === 'h1'
}

function clearSelectedHeadingClass() {
  if (!editor.value) return
  editor.value.querySelectorAll('h1.selected-heading').forEach((heading) => {
    heading.classList.remove('selected-heading')
  })
}

function markSelectedHeading() {
  clearSelectedHeadingClass()
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  let node = selection.anchorNode
  while (node && node !== editor.value) {
    if (node.nodeType === Node.ELEMENT_NODE && node.nodeName.toLowerCase() === 'h1') {
      node.classList.add('selected-heading')
      return
    }
    node = node.parentNode
  }
}

function emitContent() {
  if (!editor.value) return
  emits('update-content', editor.value.innerHTML)
}

function onEditorInput() {
  emitContent()
}

function onEditorFocus() {
  editorHasFocus.value = true
  nextTick(updateActiveStates)
}

function onEditorBlur() {
  editorHasFocus.value = false
}

function insertImportedContent(e) {
  const html = e?.detail?.html || ''
  if (!html) return
  if (!editor.value) return

  if (editorHasFocus.value) {
    // Try to insert at caret
    try {
      restoreSelection()
      editor.value.focus()
      document.execCommand('insertHTML', false, html)
      emitContent()
      nextTick(updateActiveStates)
      return
    } catch (err) {
      // fall through to append
    }
  }

  // If not focused or insert failed, append to end
  editor.value.innerHTML = (editor.value.innerHTML || '') + html
  emitContent()
  nextTick(updateActiveStates)
}

function syncEditorContent() {
  if (!editor.value) return
  const newContent = props.activeDoc?.content || ''
  if (editor.value.innerHTML !== newContent && !editorHasFocus.value) {
    editor.value.innerHTML = newContent
  }
}

onMounted(() => {
  nextTick(syncEditorContent)
  window.addEventListener('ajaia:importContent', insertImportedContent)
})

onBeforeUnmount(() => {
  window.removeEventListener('ajaia:importContent', insertImportedContent)
})

watch(
  () => props.activeDoc?.id,
  () => {
    nextTick(syncEditorContent)
  }
)

watch(
  () => props.activeDoc?.content,
  () => {
    nextTick(syncEditorContent)
  }
)
</script>

<template>
  <div>
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="space-y-2">
        <div class="flex flex-wrap items-center gap-3">
          <div class="rounded-3xl bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">Owned</div>
          <div class="rounded-3xl bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300">Live editor</div>
        </div>
        <div class="space-y-3">
          <input
            :value="props.activeDoc.title"
            @input="$emit('update-title', $event)"
            class="w-full border-0 bg-transparent text-4xl font-semibold leading-tight text-slate-950 outline-none placeholder:text-slate-400 dark:text-slate-100"
            placeholder="Document title"
          />
          <div class="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span>Last updated {{ new Date(props.activeDoc.updatedAt).toLocaleString() }}</span>
            <span class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Users class="h-4 w-4" /> {{ props.currentUser.name }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <Button variant="secondary" size="sm" className="inline-flex items-center gap-2" @click="$emit('open-share')">
          <Share2 class="h-4 w-4" /> Share
        </Button>
        <div class="rounded-3xl bg-slate-100 px-4 py-2 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">Owner: {{ props.currentUser.name }}</div>
      </div>
    </div>

    <Card className="mt-6 rounded-[28px] border-slate-200/80 bg-slate-50 p-4 dark:border-slate-700/80 dark:bg-slate-900/70">
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          @mousedown.prevent="rememberSelection"
          @click.prevent="formatText('bold')"
          :class="['toolbar-button', { 'toolbar-button-active': activeStates.bold }]"
          title="Bold"
        >
          <Bold class="h-4 w-4" />
        </button>
        <button
          type="button"
          @mousedown.prevent="rememberSelection"
          @click.prevent="formatText('italic')"
          :class="['toolbar-button', { 'toolbar-button-active': activeStates.italic }]"
          title="Italic"
        >
          <Italic class="h-4 w-4" />
        </button>
        <button
          type="button"
          @mousedown.prevent="rememberSelection"
          @click.prevent="formatText('underline')"
          :class="['toolbar-button', { 'toolbar-button-active': activeStates.underline }]"
          title="Underline"
        >
          <Underline class="h-4 w-4" />
        </button>
        <button
          type="button"
          @mousedown.prevent="rememberSelection"
          @click.prevent="formatText('formatBlock', 'H1')"
          :class="['toolbar-button', { 'toolbar-button-active': activeStates.heading }]"
          title="Heading"
        >
          <Heading class="h-4 w-4" />
        </button>
        <button
          type="button"
          @mousedown.prevent="rememberSelection"
          @click.prevent="formatText('insertUnorderedList')"
          :class="['toolbar-button', { 'toolbar-button-active': activeStates.bullet }]"
          title="Bullet list"
        >
          <List class="h-4 w-4" />
        </button>
        <button
          type="button"
          @mousedown.prevent="rememberSelection"
          @click.prevent="formatText('insertOrderedList')"
          :class="['toolbar-button', { 'toolbar-button-active': activeStates.ordered }]"
          title="Numbered list"
        >
          <ListOrdered class="h-4 w-4" />
        </button>
      </div>
    </Card>

    <div class="mt-6 min-h-[420px] rounded-[32px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-950">
      <div
        ref="editor"
        class="prose min-h-[420px] max-w-none outline-none prose-p:m-0 prose-p:text-slate-700 prose-headings:text-slate-900 dark:prose-p:text-slate-300 dark:prose-headings:text-slate-100"
        contenteditable="true"
        @input="onEditorInput"
        @keyup="updateActiveStates"
        @mouseup="updateActiveStates"
        @focus="onEditorFocus"
        @blur="onEditorBlur"
      />
    </div>

    <div class="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-slate-950/5 p-4 text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
      <div class="flex items-center gap-2">
        <FileText class="h-4 w-4" />
        <span>Auto-saved in your browser. Connect a backend later for cross-device sync.</span>
      </div>
      <div class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
        <UserCheck class="h-4 w-4 text-emerald-500" /> {{ sharedCount }} shared
      </div>
    </div>
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

.toolbar-button-active {
  border-color: #2563eb;
  background: #e0ecff;
  color: #1e40af;
}

.toolbar-button:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(148, 163, 184, 0.25);
}

  .prose :deep(h1) {
    font-size: 1.25rem;
    font-weight: 500;
    margin-bottom: 1rem;
    color: #0f172a;
  }

  .prose :deep(h1.selected-heading) {
    outline: 2px solid rgba(37, 99, 235, 0.25);
    outline-offset: 0.25rem;
    border-radius: 0.375rem;
  }

  .prose :deep(ul),
  .prose :deep(ol) {
    padding-left: 1.5rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  .prose :deep(ul) {
    list-style-type: disc;
  }

  .prose :deep(ol) {
    list-style-type: decimal;
  }

  .prose :deep(li) {
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
  }

  </style>