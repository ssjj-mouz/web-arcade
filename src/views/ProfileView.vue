<template>
  <nav class="nav">
    <a class="btn-nav" @click="router.push('/')" style="cursor:pointer">← 大厅</a>
    <h1>👤 个人中心</h1>
    <div class="nav-actions" style="position:relative">
      <button class="btn-nav" id="themeBtn" @click="showThemePanel = !showThemePanel">🎨 主题</button>
      <div class="theme-panel" :class="{ open: showThemePanel }">
        <button v-for="(t, k) in themes" :key="k" class="theme-opt" :class="{ active: k === theme.active }" @click="theme.set(k); showThemePanel = false">
          <span class="theme-swatch" :style="{ background: 'linear-gradient(135deg, rgb('+t.r+','+t.g+','+t.b+'), rgb('+t.r2+','+t.g2+','+t.b2+'))' }"></span>{{ k }}
        </button>
      </div>
      <button class="btn-nav" v-if="user.isLoggedIn" @click="doLogout">退出</button>
    </div>
  </nav>

  <div class="main">
    <template v-if="user.isLoggedIn">
      <!-- User card -->
      <div class="user-card">
        <div class="user-avatar">👾</div>
        <div class="user-info">
          <div class="user-name-display">{{ user.username }}<small id="editNameBtn" @click="showEdit = true">✏️ 修改</small></div>
          <div class="edit-row" :class="{ show: showEdit }">
            <input v-model="editName" maxlength="12" @keydown.enter="saveName">
            <button @click="saveName">保存</button>
            <button @click="showEdit = false; editName = user.username" style="background:transparent;border-color:transparent;color:rgb(var(--mr),var(--mg),var(--mb))">取消</button>
          </div>
        </div>
        <div class="user-stats">
          <div class="user-stat"><div class="val">{{ user.totalScore.toLocaleString() }}</div><div class="lbl">总分</div></div>
          <div class="user-stat"><div class="val">{{ totalPlays }}</div><div class="lbl">游玩次数</div></div>
          <div class="user-stat"><div class="val">{{ gameCount }}/9</div><div class="lbl">游戏数</div></div>
        </div>
      </div>

      <!-- Stat cards -->
      <div class="stat-cards">
        <div class="stat-card"><div class="ico">🏆</div><div class="val">{{ user.totalScore.toLocaleString() }}</div><div class="lbl">累计总分</div></div>
        <div class="stat-card"><div class="ico">🎮</div><div class="val">{{ totalPlays }}</div><div class="lbl">总游玩次数</div></div>
        <div class="stat-card"><div class="ico">❤️</div><div class="val">{{ bestGameIcon }}</div><div class="lbl">最爱游戏{{ bestGameName }}</div></div>
        <div class="stat-card"><div class="ico">⭐</div><div class="val">{{ bestScore.toLocaleString() }}</div><div class="lbl">最高单项分</div></div>
      </div>

      <!-- Game scores -->
      <div class="section-title">🎯 游戏成绩</div>
      <div class="game-grid">
        <a v-for="(g, i) in sortedGames" :key="g.key" class="game-card" @click="router.push('/game/' + gameDir(g.key))">
          <div class="g-rank">#{{ i + 1 }}</div>
          <div class="g-icon">{{ g.icon }}</div>
          <div class="g-name">{{ g.name }}</div>
          <div class="g-score">{{ (user.myScores[g.key] || 0) > 0 ? '最高 ' + (user.myScores[g.key] || 0).toLocaleString() : '<span class="no-score">暂无记录</span>' }}</div>
          <div class="g-plays">{{ (playCounts[g.name] || 0) > 0 ? '玩了 ' + (playCounts[g.name] || 0) + ' 次' : '尚未游玩' }}</div>
        </a>
      </div>

      <!-- Export -->
      <div style="text-align:center;margin-bottom:24px">
        <button class="btn-nav" @click="exportData" style="font-size:0.8rem;padding:8px 18px">📥 导出我的数据</button>
      </div>
    </template>

    <div v-else class="no-user">
      <h2>未登录</h2>
      <p>请先在游戏大厅登录后再进入个人中心</p>
      <a class="btn-nav" @click="router.push('/')" style="cursor:pointer">← 去登录</a>
    </div>
  </div>

  <div class="footer">Web Arcade OS · 数据存储于本地浏览器</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import { useGamesStore } from '../stores/games.js'
import { useThemeStore } from '../stores/theme.js'

const router = useRouter()
const user = useUserStore()
const games = useGamesStore()
const theme = useThemeStore()

const showThemePanel = ref(false)
const showEdit = ref(false)
const editName = ref('')

const themes = {
  neon:{r:0,g:255,b:255,r2:255,g2:0,b2:255},
  flame:{r:255,g:120,b:0,r2:255,g2:50,b2:0},
  frost:{r:120,g:220,b:255,r2:180,g2:200,b2:255},
  purple:{r:180,g:100,b:255,r2:255,g2:80,b2:200},
  green:{r:50,g:255,b:80,r2:0,g2:200,b2:200},
  light:{r:50,g:120,b:255,r2:255,g2:80,b2:180},
  cybergold:{r:255,g:191,b:0,r2:255,g2:80,b2:0},
  synthwave:{r:255,g:50,b:150,r2:0,g2:255,b2:200},
  matrix:{r:0,g:255,b:65,r2:0,g2:200,b2:100},
  crimson:{r:220,g:30,b:30,r2:180,g2:0,b2:80},
  aurora:{r:0,g:255,b:180,r2:150,g2:80,b2:255}
}

const playCounts = computed(() => games.playCounts || {})

const totalPlays = computed(() => {
  let c = 0
  const pc = games.playCounts || {}
  Object.values(pc).forEach(v => { c += v || 0 })
  return c
})

const gameCount = computed(() => {
  const scores = user.myScores || {}
  return Object.keys(scores).filter(k => (scores[k] || 0) > 0).length
})

const bestEntry = computed(() => {
  let max = 0, entry = null
  games.list.forEach(g => {
    const s = user.myScores[g.key] || 0
    if (s > max) { max = s; entry = g }
  })
  return entry
})

const bestGameIcon = computed(() => bestEntry.value ? bestEntry.value.icon : '—')
const bestGameName = computed(() => bestEntry.value ? ' (' + bestEntry.value.name + ')' : '')
const bestScore = computed(() => {
  let max = 0
  games.list.forEach(g => { max = Math.max(max, user.myScores[g.key] || 0) })
  return max
})

const sortedGames = computed(() => {
  return [...games.list].sort((a, b) => (user.myScores[b.key] || 0) - (user.myScores[a.key] || 0))
})

function gameDir(k) {
  const m = { skyDefense:'sky-defense', match:'match', tower:'tower', typist:'typist', beats:'beats', particle:'particle', coop:'coop', snake:'snake', breakout:'breakout' }
  return m[k] || k
}

function saveName() {
  const newName = editName.value.trim()
  if (!newName || newName === user.username) { showEdit.value = false; return }
  const profiles = JSON.parse(localStorage.getItem('arcadeProfiles') || '{}')
  if (profiles[user.username]) {
    profiles[newName] = profiles[user.username]
    delete profiles[user.username]
    localStorage.setItem('arcadeProfiles', JSON.stringify(profiles))
  }
  localStorage.setItem('arcadeUser', newName)
  user.username = newName
  showEdit.value = false
}

function doLogout() {
  user.logout()
  router.push('/')
}

function exportData() {
  const data = {
    user: user.username,
    scores: user.myScores,
    playCounts: games.playCounts,
    exportedAt: new Date().toISOString()
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'arcade-profile-' + user.username + '.json'
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  user.loadFromStorage()
  games.loadFromStorage()
  editName.value = user.username
  // Click outside theme panel
  document.addEventListener('click', e => {
    if (!e.target.closest('#themeBtn') && !e.target.closest('.theme-panel')) showThemePanel.value = false
  })
})
</script>

<style>
@import '../styles/profile.css';
</style>
