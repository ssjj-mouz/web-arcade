import { createRouter, createWebHashHistory } from 'vue-router'

const BASE = import.meta.env.BASE_URL

const GameFrame = { template: '<iframe :src="src" style="position:fixed;inset:0;width:100%;height:100%;border:none;z-index:50" allow="autoplay"></iframe>', props: { src: String } }

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/admin', name: 'admin', component: () => import('../views/AdminView.vue') },
  { path: '/profile', name: 'profile', component: () => import('../views/ProfileView.vue') },
  { path: '/game/snake', name: 'snake', component: GameFrame, props: { src: BASE + 'games/snake/index.html' } },
  { path: '/game/coop', name: 'coop', component: GameFrame, props: { src: BASE + 'games/coop/index.html' } },
  { path: '/game/breakout', name: 'breakout', component: GameFrame, props: { src: BASE + 'games/breakout/index.html' } },
  { path: '/game/sky-defense', name: 'skyDefense', component: GameFrame, props: { src: BASE + 'games/sky-defense/index.html' } },
  { path: '/game/match', name: 'match', component: GameFrame, props: { src: BASE + 'games/match/index.html' } },
  { path: '/game/tower', name: 'tower', component: GameFrame, props: { src: BASE + 'games/tower/index.html' } },
  { path: '/game/typist', name: 'typist', component: GameFrame, props: { src: BASE + 'games/typist/index.html' } },
  { path: '/game/beats', name: 'beats', component: GameFrame, props: { src: BASE + 'games/beats/index.html' } },
  { path: '/game/particle', name: 'particle', component: GameFrame, props: { src: BASE + 'games/particle/index.html' } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
