import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/admin', name: 'admin', component: () => import('../views/AdminView.vue') },
  { path: '/profile', name: 'profile', component: () => import('../views/ProfileView.vue') },
  { path: '/game/snake', name: 'snake', component: () => import('../views/games/SnakeView.vue') },
  { path: '/game/coop', name: 'coop', component: () => import('../views/games/CoopView.vue') },
  { path: '/game/breakout', name: 'breakout', component: () => import('../views/games/BreakoutView.vue') },
  { path: '/game/sky-defense', name: 'skyDefense', component: () => import('../views/games/SkyDefenseView.vue') },
  { path: '/game/match', name: 'match', component: () => import('../views/games/MatchView.vue') },
  { path: '/game/tower', name: 'tower', component: () => import('../views/games/TowerView.vue') },
  { path: '/game/typist', name: 'typist', component: () => import('../views/games/TypistView.vue') },
  { path: '/game/beats', name: 'beats', component: () => import('../views/games/BeatsView.vue') },
  { path: '/game/particle', name: 'particle', component: () => import('../views/games/ParticleView.vue') },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
