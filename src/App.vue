<template>
  <router-view />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from './stores/theme.js'
import { useUserStore } from './stores/user.js'
import { useGamesStore } from './stores/games.js'

const router = useRouter()
const theme = useThemeStore()
const user = useUserStore()
const games = useGamesStore()

function handleMessage(e) {
  // 只处理来自 iframe 游戏页面的消息
  if (!e.data || typeof e.data !== 'object') return
  if (e.data.from !== 'web-arcade-game') return

  switch (e.data.type) {
    case 'navigate':
      // iframe 请求导航回大厅
      if (e.data.path) router.push(e.data.path)
      break
    case 'scoreUpdate':
      // iframe 游戏得分后通知刷新
      user.loadFromStorage()
      break
    case 'favUpdate':
      user.loadFromStorage()
      break
  }
}

onMounted(() => {
  theme.apply()
  user.loadFromStorage()
  games.loadFromStorage()
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})
</script>
