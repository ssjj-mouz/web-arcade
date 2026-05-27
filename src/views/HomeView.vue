<template>
  <!-- Boot screen -->
  <div id="boot-screen" v-if="showBoot">
    <div class="boot-lines" ref="bootLines"></div>
    <div class="boot-progress"><div class="boot-progress-bar" :style="{ width: bootProgress + '%' }"></div></div>
    <div class="boot-title" :style="{ opacity: bootTitleOpacity }">Web Arcade OS</div>
  </div>

  <!-- Login overlay -->
  <div class="login-overlay" id="login-overlay" v-if="showLogin">
    <div class="login-box">
      <div class="login-glow"></div>
      <h1>欢迎来到街机厅</h1>
      <p>输入你的代号，开启游戏之旅</p>
      <form @submit.prevent="doLogin">
        <input v-model="loginName" type="text" maxlength="12" placeholder="输入昵称..." autocomplete="off" ref="loginInput" />
        <button type="submit">进入大厅</button>
      </form>
      <div class="login-hint">按 Enter 快速进入</div>
    </div>
  </div>

  <!-- Leaderboard overlay -->
  <div class="lb-overlay" :class="{ show: showLb }" @click.self="showLb = false">
    <div class="lb-card">
      <div class="lb-header">
        <h2>🏆 成就排行榜</h2>
        <button class="lb-close" @click="showLb = false">✕</button>
      </div>
      <div class="lb-body">
        <Leaderboard :users="leaderboardUsers" />
      </div>
    </div>
  </div>

  <!-- Header -->
  <header>
    <div class="logo">⚡ Web Arcade OS</div>
    <div class="header-right">
      <div style="position:relative;">
        <button class="hdr-icon-btn" @click="showThemePanel = !showThemePanel" title="换肤">🎨</button>
        <div class="theme-panel" :class="{ open: showThemePanel }">
          <button
            v-for="name in ['neon','flame','frost','purple','green','light','cybergold','synthwave','matrix','crimson','aurora']"
            :key="name"
            :class="['theme-opt', { active: theme.active === name }]"
            @click="theme.set(name); showThemePanel = false"
          >
            <span class="theme-swatch" :style="{ background: themeSwatch(name) }"></span>
            {{ themeLabel(name) }}
          </button>
        </div>
      </div>
      <button class="hdr-icon-btn" @click="showLb = true" title="排行榜">🏆</button>
      <router-link to="/profile" class="hdr-icon-btn" title="个人中心">👤</router-link>
      <router-link to="/admin" class="hdr-icon-btn" title="后台管理" style="opacity:0.55;">⚙️</router-link>
      <div class="user-pill">
        <div class="avatar">👾</div>
        <span class="user-name">{{ user.username || '游客' }}</span>
        <span class="pill-score">{{ user.totalScore }}</span>
        <button v-if="user.isLoggedIn" class="pill-logout" @click="user.logout()" title="退出登录">✕</button>
      </div>
    </div>
  </header>

  <main>
    <!-- Carousel -->
    <div class="carousel-container">
      <canvas id="carouselParticles"></canvas>
      <div
        v-for="(g, i) in carouselGames"
        :key="g.key"
        :class="['carousel-slide', 'slide-' + g.key, { active: currentSlide === i }]"
      >
        <div class="slide-overlay"></div>
        <div class="slide-icon">{{ g.icon }}</div>
        <span class="slide-badge">{{ g.badge }}</span>
        <h2 class="slide-title">{{ g.name }}</h2>
        <p class="slide-desc">{{ g.desc }}</p>
        <router-link :to="g.href" class="slide-btn">{{ g.linkText }}</router-link>
      </div>

      <div class="carousel-nav">
        <div
          v-for="(g, i) in carouselGames"
          :key="'dot' + i"
          :class="['nav-dot', { active: currentSlide === i }]"
          @click="setSlide(i)"
        ></div>
      </div>

      <button class="carousel-arrow carousel-arrow-left" @click="prevSlide">‹</button>
      <button class="carousel-arrow carousel-arrow-right" @click="nextSlide">›</button>
    </div>

    <h2 class="section-title">游戏大厅列表</h2>

    <!-- Filter bar -->
    <div class="filter-bar">
      <button
        v-for="f in filters"
        :key="f.key"
        :class="['filter-btn', f.key === 'favorites' ? 'fav-filter' : '', { active: activeFilter === f.key }]"
        @click="setFilter(f.key)"
      >{{ f.label }}</button>
    </div>

    <!-- Search -->
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input type="text" v-model="searchQuery" placeholder="搜索游戏名称、标签..." autocomplete="off" />
      <span class="search-count" v-if="searchQuery">{{ filteredGames.length }} 款游戏</span>
      <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">✕</button>
    </div>

    <!-- Game grid -->
    <div class="game-grid">
      <GameCard v-for="g in filteredGames" :key="g.key" :game="g" />
    </div>

    <!-- Mini runner canvas -->
    <div class="mini-runner">
      <canvas id="homeRunner" width="1200" height="120"></canvas>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useGamesStore } from '../stores/games.js'
import { useUserStore } from '../stores/user.js'
import { useThemeStore } from '../stores/theme.js'
import GameCard from '../components/GameCard.vue'
import Leaderboard from '../components/Leaderboard.vue'

const games = useGamesStore()
const user = useUserStore()
const theme = useThemeStore()

// Boot animation
const showBoot = ref(true)
const showLogin = ref(false)
const loginName = ref('')
const bootProgress = ref(0)
const bootTitleOpacity = ref(0)
const bootLines = ref(null)

// UI state
const showThemePanel = ref(false)
const showLb = ref(false)
const searchQuery = ref('')
const activeFilter = ref('all')
const currentSlide = ref(0)

const loginInput = ref(null)

const carouselGames = computed(() => [
  games.getGame('skyDefense'), games.getGame('match'), games.getGame('tower'),
  games.getGame('typist'), games.getGame('beats'), games.getGame('particle'),
  games.getGame('coop'), games.getGame('snake'), games.getGame('breakout')
].filter(Boolean).map(g => ({
  ...g,
  badge: g.badge || g.name,
  desc: g.desc || '',
  linkText: g.linkText || '开始 ▶'
})))

const filters = [
  { key: 'all', label: '全部展示' },
  { key: 'action', label: '射击/动作' },
  { key: 'puzzle', label: '休闲/解谜' },
  { key: 'coop', label: '双人/合作' },
  { key: 'hardcore', label: '硬核/反应' },
  { key: 'favorites', label: '❤️ 收藏' }
]

const filteredGames = computed(() => {
  let list = games.list
  if (activeFilter.value === 'favorites') {
    list = list.filter(g => user.myFavorites.includes(g.key))
  } else if (activeFilter.value !== 'all') {
    list = list.filter(g => {
      const cat = g.cat || ''
      return cat.includes(activeFilter.value)
    })
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(g => g.name.includes(q) || (g.cat || '').includes(q) || (g.desc || '').includes(q))
  }
  return list
})

const leaderboardUsers = computed(() => {
  return Object.entries(user.allProfiles)
    .map(([name, scores]) => ({
      name,
      scores,
      total: Object.values(scores).reduce((s, v) => s + v, 0)
    }))
    .sort((a, b) => b.total - a.total)
})

function setSlide(i) { currentSlide.value = i }
function prevSlide() { currentSlide.value = (currentSlide.value - 1 + carouselGames.value.length) % carouselGames.value.length }
function nextSlide() { currentSlide.value = (currentSlide.value + 1) % carouselGames.value.length }

function setFilter(key) { activeFilter.value = key }

function doLogin() {
  const name = loginName.value.trim()
  if (!name) return
  user.login(name)
  showLogin.value = false
}

// Boot animation
onMounted(async () => {
  user.loadFromStorage()
  games.loadFromStorage()

  // Boot sequence
  const bootLines = [
    { text: '[OK] Initializing Web Arcade OS kernel...', cls: 'ok' },
    { text: '[OK] Loading core modules...', cls: 'ok' },
    { text: 'System check: Memory <span class="highlight">128TB</span> available', cls: '' },
    { text: 'GPU renderer: <span class="highlight">CyberVision X9000</span>', cls: '' },
    { text: 'Security layer: <span class="warn">ACTIVE</span>', cls: '' },
    { text: '[OK] Establishing network link...', cls: 'ok' },
  ]

  await nextTick()
  const container = bootLines.value
  if (container) {
    for (let i = 0; i < bootLines.length; i++) {
      const div = document.createElement('div')
      div.className = 'boot-line'
      div.innerHTML = bootLines[i].text
      container.appendChild(div)
      await delay(180)
      div.style.opacity = '1'
      bootProgress.value = ((i + 1) / bootLines.length) * 100
    }
  }

  bootTitleOpacity.value = 1
  await delay(400)
  bootProgress.value = 100
  await delay(500)

  // Start carousel auto-rotate
  setInterval(() => nextSlide(), 5000)

  // Check if user needs to login
  if (!user.isLoggedIn) {
    showBoot.value = false
    showLogin.value = true
    await nextTick()
    loginInput.value?.focus()
  } else {
    showBoot.value = false
  }

  // Init carousel particles canvas
  initCarouselParticles()
})

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

function themeSwatch(name) {
  const map = {
    neon: 'linear-gradient(135deg,#0ff,#f0f)', flame: 'linear-gradient(135deg,#ff7800,#ff3300)',
    frost: 'linear-gradient(135deg,#78dcff,#b4c8ff)', purple: 'linear-gradient(135deg,#b464ff,#ff50c8)',
    green: 'linear-gradient(135deg,#50ff80,#00c8c8)', light: 'linear-gradient(135deg,#e2e8f0,#ffffff)',
    cybergold: 'linear-gradient(135deg,#ffbf00,#ff5000)', synthwave: 'linear-gradient(135deg,#ff3296,#00ffc8)',
    matrix: 'linear-gradient(135deg,#00ff41,#008a20)', crimson: 'linear-gradient(135deg,#ff3030,#b00050)',
    aurora: 'linear-gradient(135deg,#00ffb4,#9650ff)'
  }
  return map[name] || '#333'
}

function themeLabel(name) {
  const map = { neon:'赛博霓虹', flame:'暗夜烈焰', frost:'极地冰霜', purple:'迷幻紫', green:'翡翠丛林',
    light:'纯净白昼 ☀️', cybergold:'赛博黄金', synthwave:'合成波浪潮', matrix:'黑客帝国', crimson:'绯红风暴', aurora:'极光幻境' }
  return map[name] || name
}

function initCarouselParticles() {
  const canvas = document.getElementById('carouselParticles')
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  let particles = []
  const maxP = 50

  function resize() {
    const parent = canvas.parentElement
    if (parent) { canvas.width = parent.offsetWidth; canvas.height = parent.offsetHeight }
  }
  resize()
  window.addEventListener('resize', resize)

  for (let i = 0; i < maxP; i++) {
    particles.push({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 1, alpha: Math.random() * 0.5 + 0.1
    })
  }

  function draw() {
    if (!canvas.isConnected) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy
      if (p.x < 0) p.x = canvas.width
      if (p.x > canvas.width) p.x = 0
      if (p.y < 0) p.y = canvas.height
      if (p.y > canvas.height) p.y = 0
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${getComputedStyle(document.documentElement).getPropertyValue('--accent-r')},${getComputedStyle(document.documentElement).getPropertyValue('--accent-g')},${getComputedStyle(document.documentElement).getPropertyValue('--accent-b')},${p.alpha})`
      ctx.fill()
    })
    // draw lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 100) {
          ctx.strokeStyle = `rgba(${getComputedStyle(document.documentElement).getPropertyValue('--accent-r')},${getComputedStyle(document.documentElement).getPropertyValue('--accent-g')},${getComputedStyle(document.documentElement).getPropertyValue('--accent-b')},${0.1 * (1 - dist / 100)})`
          ctx.lineWidth = 0.5
          ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke()
        }
      }
    }
    requestAnimationFrame(draw)
  }
  draw()
}
</script>
