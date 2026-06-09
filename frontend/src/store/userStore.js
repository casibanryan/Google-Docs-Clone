import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/boot/api'

const STORAGE_KEY = 'ajaia-browser-user-id'

export const useUserStore = defineStore('users', () => {
  const users = ref([])
  const currentUser = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const userCount = computed(() => users.value.length)
  const hasUsers = computed(() => users.value.length > 0)
  const hasCurrentUser = computed(() => currentUser.value !== null)

  const fetchUsers = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('users')
      users.value = response.data.data || response.data
      return users.value
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getUser = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`users/${id}`)
      return response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createUser = async (payload) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('users', payload)
      const user = response.data.data || response.data
      users.value.push(user)
      return user
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id, payload) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`users/${id}`, payload)
      const updated = response.data.data || response.data
      const index = users.value.findIndex((user) => user.id === id)
      if (index !== -1) {
        users.value[index] = updated
      }
      if (currentUser.value?.id === id) {
        currentUser.value = updated
      }
      return updated
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`users/${id}`)
      users.value = users.value.filter((user) => user.id !== id)
      if (currentUser.value?.id === id) {
        currentUser.value = null
        localStorage.removeItem(STORAGE_KEY)
      }
      return true
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const setCurrentUser = (user) => {
    currentUser.value = user
    if (user?.browser_id) {
      localStorage.setItem(STORAGE_KEY, user.browser_id)
    }
  }

  const clearCurrentUser = () => {
    currentUser.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  const loadBrowserId = () => {
    return localStorage.getItem(STORAGE_KEY)
  }

  const findUserByBrowserId = async (browserId) => {
    if (!browserId) return null
    if (!users.value.length) {
      await fetchUsers()
    }
    return users.value.find((user) => user.browser_id === browserId) || null
  }

  const ensureCurrentUser = async (browserId, name) => {
    if (!browserId) {
      throw new Error('browser_id is required to identify the current user')
    }

    let user = await findUserByBrowserId(browserId)
    if (user) {
      setCurrentUser(user)
      return user
    }

    user = await createUser({ name, browser_id: browserId })
    setCurrentUser(user)
    return user
  }

  return {
    users,
    currentUser,
    loading,
    error,
    userCount,
    hasUsers,
    hasCurrentUser,
    fetchUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    setCurrentUser,
    clearCurrentUser,
    loadBrowserId,
    findUserByBrowserId,
    ensureCurrentUser,
  }
})
