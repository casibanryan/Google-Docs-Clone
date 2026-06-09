import { defineStore } from 'pinia'
import api from '@/boot/api'

export const useShareStore = defineStore('share', () => {

  const add = async (documentId, userId) => {
    try {
      const response = await api.post('/document/share', {
        user_id: userId,
        document_id: documentId,
      })

      return response.data
    } catch (err) {
      console.error(
        'Error sharing document:',
        err.response?.data?.message || err.message
      )
      throw err
    }
  }

  const remove = async (userId, documentId) => {
    try {
      const response = await api.post('/document/remove-share', {
          user_id: userId,
          document_id: documentId,
      })
      
      return response.data
    } catch (err) {
      console.error(
        'Error removing share:',
        err.response?.data?.message || err.message
      )
      throw err
    }
  }

  return {
    add,
    remove
  }
})