import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    username: localStorage.getItem('arcadeUser') || '',
    profiles: {},
    favorites: [],
    scores: {}
  }),

  getters: {
    isLoggedIn: (state) => !!state.username,
    myScores: (state) => state.scores,
    myFavorites: (state) => state.favorites,
    allProfiles: (state) => state.profiles,
    totalScore(state) {
      return Object.values(state.scores).reduce((s, v) => s + v, 0)
    }
  },

  actions: {
    loadFromStorage() {
      try { this.profiles = JSON.parse(localStorage.getItem('arcadeProfiles') || '{}') } catch {}
      try { this.favorites = JSON.parse(localStorage.getItem('arcadeFavorites') || '[]') } catch {}
      if (this.username) {
        this.scores = this.profiles[this.username] || {}
      }
    },

    login(name) {
      this.username = name
      localStorage.setItem('arcadeUser', name)
      this.scores = this.profiles[name] || {}
    },

    logout() {
      this.username = ''
      this.scores = {}
      localStorage.removeItem('arcadeUser')
    },

    saveScore(gameKey, score) {
      if (!this.username) return
      if (!this.profiles[this.username]) this.profiles[this.username] = {}
      const prev = this.profiles[this.username][gameKey] || 0
      if (score > prev) {
        this.profiles[this.username][gameKey] = score
        this.scores[gameKey] = score
        localStorage.setItem('arcadeProfiles', JSON.stringify(this.profiles))
        if (typeof CloudSync !== 'undefined') CloudSync.saveProfile(this.username, this.scores, this.favorites)
      }
    },

    setProfileData(username, scores, favorites) {
      if (!this.profiles[username]) this.profiles[username] = {}
      Object.assign(this.profiles[username], scores)
      this.favorites = favorites || []
      localStorage.setItem('arcadeProfiles', JSON.stringify(this.profiles))
      localStorage.setItem('arcadeFavorites', JSON.stringify(this.favorites))
      if (username === this.username) {
        this.scores = this.profiles[username] || {}
      }
    },

    toggleFavorite(gameKey) {
      const idx = this.favorites.indexOf(gameKey)
      if (idx > -1) this.favorites.splice(idx, 1)
      else this.favorites.push(gameKey)
      localStorage.setItem('arcadeFavorites', JSON.stringify(this.favorites))
      if (this.username && typeof CloudSync !== 'undefined') {
        CloudSync.saveProfile(this.username, this.scores, this.favorites)
      }
    },

    deleteUser(name) {
      delete this.profiles[name]
      localStorage.setItem('arcadeProfiles', JSON.stringify(this.profiles))
      if (this.username === name) this.logout()
    },

    resetAll() {
      ['arcadeProfiles', 'arcadePlayCounts', 'arcadeFavorites', 'arcadeTheme', 'arcadeUser', 'arcadeComments']
        .forEach(k => localStorage.removeItem(k))
      this.profiles = {}
      this.favorites = []
      this.scores = {}
      this.username = ''
    }
  }
})
