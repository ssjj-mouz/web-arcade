import { defineStore } from 'pinia'

const THEMES = {
  neon: { r: 0, g: 255, b: 255, r2: 255, g2: 0, b2: 255, bg1: '#0a0f2e', bg2: '#03050b', l1: '#fff', l2: '#0ff', l3: '#a0f', sr: 10, sg: 15, sb: 46, sr2: 5, sg2: 8, sb2: 30, tr: 238, tg: 245, tb: 255, mr: 148, mg: 163, mb: 184, ca: 0.3 },
  flame: { r: 255, g: 120, b: 0, r2: 255, g2: 50, b2: 0, bg1: '#2e1208', bg2: '#140603', l1: '#fff', l2: '#ff7800', l3: '#f30', sr: 46, sg: 18, sb: 10, sr2: 30, sg2: 10, sb2: 5, tr: 238, tg: 245, tb: 255, mr: 200, mg: 170, mb: 150, ca: 0.3 },
  frost: { r: 120, g: 220, b: 255, r2: 180, g2: 200, b2: 255, bg1: '#082438', bg2: '#030d18', l1: '#fff', l2: '#78dcff', l3: '#b4c8ff', sr: 10, sg: 24, sb: 42, sr2: 6, sg2: 12, sb2: 26, tr: 238, tg: 245, tb: 255, mr: 148, mg: 200, mb: 220, ca: 0.3 },
  purple: { r: 180, g: 100, b: 255, r2: 255, g2: 80, b2: 200, bg1: '#1e0838', bg2: '#0c0318', l1: '#fff', l2: '#b464ff', l3: '#ff50c8', sr: 20, sg: 10, sb: 44, sr2: 12, sg2: 5, sb2: 26, tr: 238, tg: 245, tb: 255, mr: 190, mg: 170, mb: 210, ca: 0.3 },
  green: { r: 50, g: 255, b: 80, r2: 0, g2: 200, b2: 200, bg1: '#0a1e0a', bg2: '#030b03', l1: '#fff', l2: '#50ff80', l3: '#00c8c8', sr: 12, sg: 30, sb: 15, sr2: 6, sg2: 16, sb2: 8, tr: 238, tg: 245, tb: 255, mr: 150, mg: 200, mb: 160, ca: 0.3 },
  light: { r: 50, g: 120, b: 255, r2: 255, g2: 80, b2: 180, bg1: '#f0f4f8', bg2: '#e2e8f0', l1: '#1a202c', l2: '#3278ff', l3: '#e050a0', sr: 255, sg: 255, sb: 255, sr2: 240, sg2: 244, sb2: 248, tr: 26, tg: 32, tb: 44, mr: 100, mg: 116, mb: 139, ca: 0.15 },
  cybergold: { r: 255, g: 191, b: 0, r2: 255, g2: 80, b2: 0, bg1: '#1a1200', bg2: '#0a0800', l1: '#fff', l2: '#ffbf00', l3: '#ff5000', sr: 26, sg: 18, sb: 0, sr2: 16, sg2: 10, sb2: 0, tr: 255, tg: 248, tb: 230, mr: 180, mg: 160, mb: 120, ca: 0.3 },
  synthwave: { r: 255, g: 50, b: 150, r2: 0, g2: 255, b2: 200, bg1: '#1a0520', bg2: '#0d0210', l1: '#fff', l2: '#ff3296', l3: '#00ffc8', sr: 30, sg: 8, sb: 36, sr2: 18, sg2: 4, sb2: 22, tr: 250, tg: 240, tb: 255, mr: 200, mg: 150, mb: 200, ca: 0.3 },
  matrix: { r: 0, g: 255, b: 65, r2: 0, g2: 200, b2: 100, bg1: '#001000', bg2: '#000500', l1: '#00ff41', l2: '#00cc32', l3: '#008a20', sr: 0, sg: 18, sb: 0, sr2: 0, sg2: 10, sb2: 0, tr: 180, tg: 255, tb: 180, mr: 0, mg: 180, mb: 60, ca: 0.25 },
  crimson: { r: 220, g: 30, b: 30, r2: 180, g2: 0, b2: 80, bg1: '#1a0505', bg2: '#0d0202', l1: '#fff', l2: '#ff3030', l3: '#b00050', sr: 30, sg: 8, sb: 8, sr2: 18, sg2: 4, sb2: 4, tr: 255, tg: 220, tb: 220, mr: 180, mg: 120, mb: 120, ca: 0.3 },
  aurora: { r: 0, g: 255, b: 180, r2: 150, g2: 80, b2: 255, bg1: '#061a1a', bg2: '#020a0a', l1: '#fff', l2: '#00ffb4', l3: '#9650ff', sr: 8, sg: 26, sb: 26, sr2: 4, sg2: 16, sb2: 16, tr: 220, tg: 255, tb: 250, mr: 120, mg: 200, mb: 190, ca: 0.3 }
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    active: localStorage.getItem('arcadeTheme') || 'neon'
  }),

  getters: {
    current: (state) => THEMES[state.active] || THEMES.neon,
    names: () => Object.keys(THEMES)
  },

  actions: {
    set(name) {
      if (!THEMES[name]) return
      this.active = name
      localStorage.setItem('arcadeTheme', name)
      this.apply()
    },
    apply() {
      const t = THEMES[this.active]
      if (!t) return
      const root = document.documentElement
      root.setAttribute('data-theme', this.active)
      const vars = {
        '--accent-r': t.r, '--accent-g': t.g, '--accent-b': t.b,
        '--accent2-r': t.r2, '--accent2-g': t.g2, '--accent2-b': t.b2,
        '--bg1': t.bg1, '--bg2': t.bg2, '--lo1': t.l1, '--lo2': t.l2, '--lo3': t.l3,
        '--sr': t.sr, '--sg': t.sg, '--sb': t.sb, '--sr2': t.sr2, '--sg2': t.sg2, '--sb2': t.sb2,
        '--tr': t.tr, '--tg': t.tg, '--tb': t.tb, '--mr': t.mr, '--mg': t.mg, '--mb': t.mb, '--ca': t.ca
      }
      Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
    }
  }
})
