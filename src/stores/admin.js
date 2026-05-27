import { defineStore } from 'pinia'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    token: localStorage.getItem('arcadeAdminToken') || '',
  }),

  getters: {
    isAuthed: (state) => !!state.token
  },

  actions: {
    async verifyPasscode(passcode) {
      const res = await CloudSync.verifyPasscode(passcode)
      const data = res.result || {}
      if (data.token) {
        this.token = data.token
        localStorage.setItem('arcadeAdminToken', data.token)
        return true
      }
      return false
    },

    lock() {
      this.token = ''
      localStorage.removeItem('arcadeAdminToken')
    }
  }
})
