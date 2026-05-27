import { defineStore } from 'pinia'

const CURSORS = {
  neon:    { name: '赛博霓虹',  icon: '💫' },
  classic: { name: '经典箭头',  icon: '🖱️' },
  cross:   { name: '像素准星',  icon: '🎯' },
  laser:   { name: '激光瞄准',  icon: '🔴' },
  hacker:  { name: '黑客矩阵',  icon: '💚' },
}

export const useCursorStore = defineStore('cursor', {
  state: () => ({
    active: localStorage.getItem('arcadeCursor') || 'neon'
  }),

  getters: {
    current: (state) => CURSORS[state.active] || CURSORS.neon,
    list: () => Object.entries(CURSORS).map(([k,v]) => ({ key: k, ...v }))
  },

  actions: {
    set(name) {
      if (!CURSORS[name]) return
      this.active = name
      localStorage.setItem('arcadeCursor', name)
      this.apply()
    },
    apply() {
      const root = document.documentElement
      root.setAttribute('data-cursor', this.active)

      const neonEl = document.getElementById('cursor-neon')
      const arrowEl = document.getElementById('cursorArrow')
      const tipEl = document.getElementById('cursorTip')
      const trails = document.querySelectorAll('.cursor-trail')

      // Reset all inline styles first
      if (neonEl) neonEl.style.opacity = ''
      if (arrowEl) arrowEl.style.opacity = ''
      if (tipEl) tipEl.style.opacity = ''
      trails.forEach(t => { t.style.opacity = '' })

      // Apply per-mode visibility
      if (this.active === 'classic') {
        if (neonEl) neonEl.style.opacity = '0'
        if (arrowEl) arrowEl.style.opacity = '0'
        if (tipEl) tipEl.style.opacity = '0'
        trails.forEach(t => { t.style.opacity = '0' })
      }
      // Other modes use CSS [data-cursor] rules to control appearance
    }
  }
})
