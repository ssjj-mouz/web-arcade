<template>
  <!-- Auth Gate -->
  <div id="authGate" v-if="!admin.isAuthed">
    <div class="auth-box">
      <span class="glyph">⛛</span>
      <h1>ACCESS RESTRICTED</h1>
      <p class="tagline">后台管理 · 请输入暗号</p>
      <form class="auth-input-wrap" @submit.prevent="checkPasscode">
        <input type="password" v-model="passcode" placeholder="········" maxlength="20" autocomplete="off" ref="authInput" />
        <button type="submit" :disabled="checking">{{ checking ? '...' : '验证' }}</button>
      </form>
      <div class="auth-error">{{ authError }}</div>
      <div class="auth-hint">[ SYS::GATE — CLEARANCE REQUIRED ]</div>
    </div>
  </div>

  <!-- Main Content -->
  <div v-else>
    <nav class="nav">
      <h1>⛛ 后台管理面板</h1>
      <div class="nav-actions">
        <router-link to="/" class="btn-nav">← 返回大厅</router-link>
        <router-link to="/profile" class="btn-nav">👤 个人中心</router-link>
        <button class="btn-nav danger" @click="admin.lock()">🔒 锁定</button>
      </div>
    </nav>

    <div class="main">
      <!-- Dashboard -->
      <div class="dash-grid">
        <div class="dash-card"><div class="ico">👥</div><div class="val">{{ userCount }}</div><div class="lbl">注册用户总数</div></div>
        <div class="dash-card"><div class="ico">🎮</div><div class="val">{{ totalPlays }}</div><div class="lbl">总游玩次数</div></div>
        <div class="dash-card"><div class="ico">🔥</div><div class="val">{{ hotGame }}</div><div class="lbl">最热游戏</div></div>
        <div class="dash-card"><div class="ico">👑</div><div class="val">{{ topPlayer }}</div><div class="lbl">最高分玩家</div></div>
      </div>

      <!-- User Leaderboard -->
      <div class="section">
        <h2 class="section-title">🏆 用户排行榜</h2>
        <Leaderboard :users="leaderboardUsers" />
      </div>

      <!-- Game Stats & Comments -->
      <div class="section">
        <h2 class="section-title">📊 游戏统计 & 社区评论</h2>
        <div class="game-stats-grid">
          <div v-for="g in games.list" :key="g.key" class="game-stat-card">
            <div class="gname"><span style="font-size:1.3rem">{{ g.icon }}</span> {{ g.name }}</div>
            <div class="gstat">
              游玩次数: <b>{{ games.playCount(g.name) }}</b> &nbsp;|&nbsp;
              玩家数: <b>{{ gamePlayerCount(g.key) }}</b> &nbsp;|&nbsp;
              平均分: <b>{{ gameAvgScore(g.key) }}</b> &nbsp;|&nbsp;
              最高分: <b>{{ gameBestScore(g.key) }}</b>
            </div>
            <CommentSection :game-key="g.key" :admin="true" />
          </div>
        </div>
      </div>

      <!-- Data Management -->
      <div class="section">
        <h2 class="section-title">🗄️ 数据管理</h2>
        <div class="mgmt-row">
          <button class="btn-mgmt" @click="exportAllData">📥 导出全部数据 (JSON)</button>
          <button class="btn-mgmt" @click="showClearUser = true">🗑️ 清除指定用户</button>
          <button class="btn-nav danger" @click="showResetAll = true">⚠️ 重置所有数据</button>
        </div>
      </div>
    </div>

    <!-- Clear User Modal -->
    <div class="confirm-overlay" :class="{ show: showClearUser }" @click.self="showClearUser = false">
      <div class="confirm-box">
        <h2>清除用户数据</h2>
        <p>选择要清除的用户，此操作不可撤销。</p>
        <select v-model="selectedUser" style="width:100%;padding:8px 12px;margin-bottom:14px;background:rgba(var(--sr2),var(--sg2),var(--sb2),0.8);color:#fff;border:1px solid rgba(var(--accent-r),var(--accent-g),var(--accent-b),0.25);border-radius:8px;font-family:inherit;font-size:0.85rem">
          <option v-for="u in userList" :key="u" :value="u">{{ u }}</option>
        </select>
        <div class="confirm-btns">
          <button class="btn-confirm-cancel" @click="showClearUser = false">取消</button>
          <button class="btn-confirm-danger" @click="doClearUser">确认清除</button>
        </div>
      </div>
    </div>

    <!-- Reset All Modal -->
    <div class="confirm-overlay" :class="{ show: showResetAll }" @click.self="showResetAll = false">
      <div class="confirm-box">
        <h2>⚠️ 重置所有数据</h2>
        <p>这将清除所有用户档案、分数、游玩记录、收藏、评论和主题数据。此操作不可撤销！</p>
        <div class="confirm-btns">
          <button class="btn-confirm-cancel" @click="showResetAll = false">取消</button>
          <button class="btn-confirm-danger" @click="doResetAll">确认重置全部</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '../stores/admin.js'
import { useUserStore } from '../stores/user.js'
import { useGamesStore } from '../stores/games.js'
import Leaderboard from '../components/Leaderboard.vue'
import CommentSection from '../components/CommentSection.vue'

const admin = useAdminStore()
const user = useUserStore()
const games = useGamesStore()

const passcode = ref('')
const authError = ref('')
const checking = ref(false)
const authInput = ref(null)

const showClearUser = ref(false)
const showResetAll = ref(false)
const selectedUser = ref('')

const leaderboardUsers = computed(() => {
  return Object.entries(user.allProfiles)
    .map(([name, scores]) => ({
      name, scores,
      total: Object.values(scores).reduce((s, v) => s + v, 0)
    }))
    .sort((a, b) => b.total - a.total)
})

const userCount = computed(() => Object.keys(user.allProfiles).length)
const totalPlays = computed(() => Object.values(games.playCounts).reduce((s, v) => s + v, 0))
const hotGame = computed(() => {
  let max = 0, name = '—'
  games.list.forEach(g => { const c = games.playCounts[g.name] || 0; if (c > max) { max = c; name = g.name } })
  return name
})
const topPlayer = computed(() => {
  let max = 0, name = '—'
  leaderboardUsers.value.forEach(u => { if (u.total > max) { max = u.total; name = u.name } })
  return name
})
const userList = computed(() => Object.keys(user.allProfiles))

function gamePlayerCount(key) {
  const g = games.getGame(key)
  let count = 0
  Object.values(user.allProfiles).forEach(scores => { if ((scores[key] || 0) > 0) count++ })
  return count
}
function gameAvgScore(key) {
  const players = gamePlayerCount(key)
  if (!players) return 0
  let total = 0
  Object.values(user.allProfiles).forEach(scores => { total += scores[key] || 0 })
  return Math.round(total / players)
}
function gameBestScore(key) {
  let max = 0
  Object.values(user.allProfiles).forEach(scores => { if ((scores[key] || 0) > max) max = scores[key] || 0 })
  return max
}

async function checkPasscode() {
  const val = passcode.value.trim()
  if (!val) return
  authError.value = ''
  checking.value = true
  try {
    const ok = await admin.verifyPasscode(val)
    if (!ok) {
      authError.value = '✦ 暗号错误 · ACCESS DENIED'
      passcode.value = ''
    }
  } catch {
    authError.value = '✦ 验证服务不可用，请稍后重试'
  }
  checking.value = false
}

function doClearUser() {
  if (!selectedUser.value) return
  user.deleteUser(selectedUser.value)
  showClearUser.value = false
}
function doResetAll() {
  user.resetAll()
  showResetAll.value = false
}
function exportAllData() {
  const data = {
    exportTime: new Date().toISOString(),
    profiles: user.allProfiles,
    playCounts: games.playCounts,
    favorites: user.myFavorites,
    theme: localStorage.getItem('arcadeTheme') || 'neon',
    comments: games.comments
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `arcade-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

onMounted(() => {
  user.loadFromStorage()
  games.loadFromStorage()
  if (admin.isAuthed) {
    // Refresh from cloud
    if (typeof CloudSync !== 'undefined') {
      Promise.all([CloudSync.loadAllProfiles(), CloudSync.loadPlayCounts(), CloudSync.loadComments()])
        .then(() => { user.loadFromStorage(); games.loadFromStorage() })
        .catch(() => {})
    }
  }
  authInput.value?.focus()
})
</script>

<style>
@import './admin.css';
</style>
