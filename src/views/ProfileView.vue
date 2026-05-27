<template>
  <nav class="nav">
    <h1>👤 个人中心</h1>
    <div class="nav-actions">
      <button class="btn-nav" @click="router.push('/')">← 返回大厅</button>
      <button class="btn-nav" @click="router.push('/admin')">⚙ 后台</button>
      <select @change="theme.set($event.target.value)" style="padding:6px 8px;border-radius:8px;background:rgba(var(--sr2),var(--sg2),var(--sb2),0.8);color:#fff;border:1px solid rgba(var(--accent-r),var(--accent-g),var(--accent-b),0.25);font-family:inherit;font-size:0.75rem;">
        <option v-for="n in themeNames" :key="n" :value="n" :selected="n === theme.active">{{ themeLabels[n] }}</option>
      </select>
    </div>
  </nav>

  <div class="main">
    <template v-if="user.isLoggedIn">
      <div class="profile-header">
        <div class="ph-avatar">{{ user.username[0] }}</div>
        <div class="ph-info">
          <h1>{{ user.username }}</h1>
          <p>Web Arcade 街机玩家</p>
        </div>
        <button class="btn-logout" @click="user.logout(); router.push('/')">退出登录</button>
      </div>

      <div class="section-title">📊 数据总览</div>
      <div class="stat-grid">
        <div class="stat-card"><div class="s-val">{{ user.totalScore }}</div><div class="s-lbl">总分</div></div>
        <div class="stat-card"><div class="s-val">{{ totalPlays }}</div><div class="s-lbl">游玩次数</div></div>
        <div class="stat-card"><div class="s-val">{{ gameCount }}</div><div class="s-lbl">玩过游戏</div></div>
        <div class="stat-card"><div class="s-val">{{ bestGame }}</div><div class="s-lbl">最佳游戏</div></div>
      </div>

      <div class="section-title">🎯 游戏成绩</div>
      <div class="game-grid">
        <a v-for="(g, i) in games.list" :key="g.key" class="game-card" @click="router.push('/game/' + gameDir(g.key))" style="cursor:pointer">
          <div class="g-rank">#{{ i + 1 }}</div>
          <div class="g-icon">{{ g.icon }}</div>
          <div class="g-name">{{ g.name }}</div>
          <div class="g-score">{{ user.myScores[g.key] || 0 }} 分</div>
          <div class="g-bar"><div class="g-bar-fill" :style="{ width: Math.min(100, user.myScores[g.key]||0) + '%', background: g.color }"></div></div>
        </a>
      </div>

      <div class="section-title">⭐ 收藏游戏</div>
      <div class="fav-grid">
        <template v-if="favGames.length">
          <a v-for="g in favGames" :key="g.key" class="fav-chip" @click="router.push('/game/' + gameDir(g.key))" style="cursor:pointer">{{ g.icon }} {{ g.name }}</a>
        </template>
        <div v-else class="empty-state">暂无收藏游戏</div>
      </div>

      <div class="section-title">📤 数据导出</div>
      <button class="btn-mgmt" @click="exportMyData">📥 导出我的数据 (JSON)</button>
    </template>

    <div v-else class="empty-state" style="padding:80px;text-align:center;">
      <p style="font-size:1.5rem;margin-bottom:16px;">👤 尚未登录</p>
      <button class="btn-mgmt" @click="router.push('/')">返回大厅登录</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import { useGamesStore } from '../stores/games.js'
import { useThemeStore } from '../stores/theme.js'

const router = useRouter()
const user = useUserStore()
const games = useGamesStore()
const theme = useThemeStore()

const themeNames = ['neon','flame','frost','purple','green','light','cybergold','synthwave','matrix','crimson','aurora']
const themeLabels = { neon:'赛博霓虹', flame:'暗夜烈焰', frost:'极地冰霜', purple:'迷幻紫', green:'翡翠丛林', light:'纯净白昼', cybergold:'赛博黄金', synthwave:'合成波浪潮', matrix:'黑客帝国', crimson:'绯红风暴', aurora:'极光幻境' }

const totalPlays = computed(() => {
  let c = 0
  Object.values(user.myScores).forEach(s => { if (s > 0) c++ })
  return c
})
const gameCount = computed(() => Object.keys(user.myScores).filter(k => (user.myScores[k]||0) > 0).length)
const bestGame = computed(() => {
  let max = 0, name = '—'
  games.list.forEach(g => { const s = user.myScores[g.key]||0; if(s>max){max=s;name=g.name} })
  return name
})
const favGames = computed(() => games.list.filter(g => user.myFavorites.includes(g.key)))

function gameDir(k) {
  const m = { skyDefense:'sky-defense', match:'match', tower:'tower', typist:'typist', beats:'beats', particle:'particle', coop:'coop', snake:'snake', breakout:'breakout' }
  return m[k] || k
}

function exportMyData() {
  const data = { username: user.username, scores: user.myScores, favorites: user.myFavorites, totalScore: user.totalScore, exportTime: new Date().toISOString() }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'profile-' + user.username + '-' + new Date().toISOString().slice(0,10) + '.json'
  a.click()
}

onMounted(() => {
  user.loadFromStorage()
  games.loadFromStorage()
})
</script>

<style>
@import '../styles/profile.css';
</style>
