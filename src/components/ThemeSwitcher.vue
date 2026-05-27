<template>
  <div class="theme-picker">
    <button
      v-for="name in theme.names"
      :key="name"
      :class="['theme-dot', { active: name === theme.active }]"
      :style="{ background: getSwatch(name) }"
      :title="name"
      @click="theme.set(name)"
    ></button>
  </div>
</template>

<script setup>
import { useThemeStore } from '../stores/theme.js'

const theme = useThemeStore()

const swatches = {
  neon: 'linear-gradient(135deg, #0ff, #a0f)',
  flame: 'linear-gradient(135deg, #ff7800, #f30)',
  frost: 'linear-gradient(135deg, #78dcff, #b4c8ff)',
  purple: 'linear-gradient(135deg, #b464ff, #ff50c8)',
  green: 'linear-gradient(135deg, #50ff80, #00c8c8)',
  light: 'linear-gradient(135deg, #3278ff, #e050a0)',
  cybergold: 'linear-gradient(135deg, #ffbf00, #ff5000)',
  synthwave: 'linear-gradient(135deg, #ff3296, #00ffc8)',
  matrix: 'linear-gradient(135deg, #00ff41, #008a20)',
  crimson: 'linear-gradient(135deg, #ff3030, #b00050)',
  aurora: 'linear-gradient(135deg, #00ffb4, #9650ff)'
}

function getSwatch(name) {
  return swatches[name] || '#333'
}
</script>
