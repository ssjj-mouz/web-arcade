<template>
  <div class="table-wrap">
    <table v-if="users.length">
      <thead>
        <tr>
          <th>排名</th>
          <th>用户名</th>
          <th v-for="g in games.list" :key="g.key">{{ g.icon }}</th>
          <th>总分</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(u, i) in users" :key="u.name">
          <td :class="rankClass(i)">{{ i < 3 ? medals[i] : i + 1 }}</td>
          <td style="font-weight:600">{{ u.name }}</td>
          <td v-for="g in games.list" :key="g.key" class="score-cell">{{ (u.scores[g.key] || 0) || '-' }}</td>
          <td class="total-cell">{{ u.total }}</td>
        </tr>
      </tbody>
    </table>
    <div v-else class="empty-state">暂无用户数据</div>
  </div>
</template>

<script setup>
import { useGamesStore } from '../stores/games.js'

defineProps({ users: { type: Array, default: () => [] } })

const games = useGamesStore()
const medals = ['🥇', '🥈', '🥉']

function rankClass(i) {
  if (i === 0) return 'rank-gold'
  if (i === 1) return 'rank-silver'
  if (i === 2) return 'rank-bronze'
  return ''
}
</script>
