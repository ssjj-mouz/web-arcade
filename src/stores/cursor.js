import { defineStore } from 'pinia'

const CURSORS = {
  neon:    { name: '赛博霓虹',  icon: '💫' },
  classic: { name: '经典箭头',  icon: '🖱️' },
  cross:   { name: '像素准星',  icon: '🎯' },
  laser:   { name: '激光瞄准',  icon: '🔫' },
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

      // Show/hide custom cursor DOM elements
      const neonEl = document.getElementById('cursor-neon')
      const arrowEl = document.getElementById('cursorArrow')
      const tipEl = document.getElementById('cursorTip')
      const trails = document.querySelectorAll('.cursor-trail')

      const show = this.active !== 'classic'
      const opacity = show ? '' : '0'
      if (neonEl) neonEl.style.opacity = this.active === 'cross' || this.active === 'classic' ? '0' : '0.7'
      else if (neonEl) neonEl.style.opacity = this.active === 'laser' ? '0.3' : opacity
      if (arrowEl) arrowEl.style.opacity = (this.active === 'neon' || this.active === 'laser') ? '' : '0'
      if (tipEl) tipEl.style.opacity = (this.active === 'neon' || this.active === 'cross') ? '' : '0'
      trails.forEach(t => {
        t.style.opacity = this.active === 'neon' ? '' : '0'
      })
    }
  }
})
