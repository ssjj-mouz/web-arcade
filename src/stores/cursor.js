import { defineStore } from 'pinia'

const CURSORS = {
  neon:     { name: '赛博霓虹',  icon: '💫' },
  classic:  { name: '经典箭头',  icon: '🖱️' },
  carbon:   { name: '碳纤暗影',  icon: '🖤' },
  photon:   { name: '光子棱镜',  icon: '🌈' },
  ember:    { name: '余烬之箭',  icon: '🏹' },
  glitch:   { name: '故障畸变',  icon: '📺' },
  frost:    { name: '冰霜之箭',  icon: '❄️' },
  venom:    { name: '毒液侵蚀',  icon: '🧪' },
  cross:    { name: '像素准星',  icon: '🎯' },
  laser:    { name: '激光瞄准',  icon: '🔴' },
  hacker:   { name: '黑客矩阵',  icon: '💚' },
  ring:     { name: '脉冲波纹',  icon: '🔵' },
  spark:    { name: '电光火花',  icon: '⚡' },
  diamond:  { name: '旋转晶钻',  icon: '💎' },
  flame:    { name: '烈焰之息',  icon: '🔥' },
  ghost:    { name: '幽灵残影',  icon: '👻' },
  void:     { name: '虚空黑洞',  icon: '🕳️' },
  compass:  { name: '指南罗盘',  icon: '🧭' },
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

      if (neonEl) neonEl.style.opacity = ''
      if (arrowEl) arrowEl.style.opacity = ''
      if (tipEl) tipEl.style.opacity = ''
      trails.forEach(t => { t.style.opacity = '' })

      if (this.active === 'classic') {
        if (neonEl) neonEl.style.opacity = '0'
        if (arrowEl) arrowEl.style.opacity = '0'
        if (tipEl) tipEl.style.opacity = '0'
        trails.forEach(t => { t.style.opacity = '0' })
      }
    }
  }
})
