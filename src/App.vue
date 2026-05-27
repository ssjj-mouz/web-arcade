<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useThemeStore } from './stores/theme.js'
import { useUserStore } from './stores/user.js'
import { useGamesStore } from './stores/games.js'

const theme = useThemeStore()
const user = useUserStore()
const games = useGamesStore()

onMounted(() => {
  theme.apply()
  user.loadFromStorage()
  games.loadFromStorage()
})
</script>
