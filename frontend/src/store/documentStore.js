import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/boot/api'

export const useDocumentStore = defineStore('documents', () => {
  // State
  const documents = ref([])
  const currentDocument = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const documentCount = computed(() => documents.value.length)
  const hasDocuments = computed(() => documents.value.length > 0)

  // Actions
  const fetchDocuments = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/documents', { params })
      documents.value = response.data.data || response.data
      return documents.value
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      console.error('Error fetching documents:', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getDocument = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/documents/${id}`)
      currentDocument.value = response.data.data || response.data
      return currentDocument.value
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      console.error('Error fetching document:', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createDocument = async (documentData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/documents', documentData)
      const newDocument = response.data.data || response.data
      documents.value.push(newDocument)
      currentDocument.value = newDocument
      return newDocument
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      console.error('Error creating document:', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateDocument = async (id, documentData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/documents/${id}`, documentData)
      const updatedDocument = response.data.data || response.data
      const index = documents.value.findIndex(doc => doc.id === id)
      if (index !== -1) {
        documents.value[index] = updatedDocument
      }
      if (currentDocument.value?.id === id) {
        currentDocument.value = updatedDocument
      }
      return updatedDocument
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      console.error('Error updating document:', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteDocument = async (id) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/documents/${id}`)
      documents.value = documents.value.filter(doc => doc.id !== id)
      if (currentDocument.value?.id === id) {
        currentDocument.value = null
      }
      return true
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      console.error('Error deleting document:', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const resetStore = () => {
    documents.value = []
    currentDocument.value = null
    error.value = null
    loading.value = false
  }

  return {
    // State
    documents,
    currentDocument,
    loading,
    error,

    // Computed
    documentCount,
    hasDocuments,

    // Actions
    fetchDocuments,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    clearError,
    resetStore,
  }
})
