<template>
  <router-view />
</template>

<script setup>
import { useThemeStore } from './stores/theme.js'
const theme = useThemeStore()
theme.apply()
</script>
