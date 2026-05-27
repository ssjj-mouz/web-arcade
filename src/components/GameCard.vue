<template>
  <article class="game-card" :data-category="game.cat" @click="$router.push(game.href)">
    <div class="card-cover" :style="{ background: `linear-gradient(135deg, ${game.color}, ${adjustColor(game.color)})` }">
      {{ game.icon }}
    </div>
    <div class="card-info">
      <h2>{{ game.name }}</h2>
      <p>{{ game.desc }}</p>
      <div class="card-footer">
        <div class="tags">
          <span>{{ game.cat }}</span>
          <span>{{ game.name }}</span>
        </div>
        <span class="btn-play" @click.stop="favGame(game.key)">
          {{ isFav ? '★' : '☆' }}
        </span>
        <span class="btn-play">进入</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../stores/user.js'

const props = defineProps({ game: Object })
const user = useUserStore()

const isFav = computed(() => user.myFavorites.includes(props.game.key))

function favGame(key) {
  user.toggleFavorite(key)
}

function adjustColor(hex) {
  // darken for gradient bottom
  return hex.replace(/^#/, '')
    .replace(/../g, c => Math.max(0, parseInt(c, 16) - 50).toString(16).padStart(2, '0'))
}
</script>
