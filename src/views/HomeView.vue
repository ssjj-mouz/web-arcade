<template>
<!-- 动态星空背景 -->
    <canvas id="starfieldCanvas"></canvas>

    <!-- OS 开机启动序列动画 -->
    <div id="boot-screen">
        <div class="boot-lines">
            <div class="boot-line">> SYSTEM BOOT SEQUENCE INITIATED...</div>
            <div class="boot-line">> LOADING <span class="highlight">KERNEL MODULES</span> <span class="ok">[OK]</span></div>
            <div class="boot-line">> MOUNTING <span class="highlight">NEON INTERFACE</span> <span class="ok">[OK]</span></div>
            <div class="boot-line">> CALIBRATING <span class="highlight">HOLOGRAPHIC DISPLAY</span> <span class="ok">[OK]</span></div>
            <div class="boot-line">> INITIALIZING <span class="highlight">GAME ENGINES</span> <span class="ok">[OK]</span></div>
            <div class="boot-line">> ESTABLISHING <span class="highlight">ARCADE NETWORK</span> <span class="ok">[OK]</span></div>
            <div class="boot-line">> SYNCING <span class="highlight">PLAYER PROFILES</span> <span class="ok">[OK]</span></div>
            <div class="boot-line">> <span class="warn">WARNING:</span> <span style="color:#888">NEON CORE OVERCLOCK AT 112%</span></div>
            <div class="boot-line">> <span class="highlight">SYSTEM READY</span> <span class="ok">[OK]</span></div>
        </div>
        <div class="boot-progress"><div class="boot-progress-bar" id="bootProgress"></div></div>
        <div class="boot-title" id="bootTitle">⚡ WEB ARCADE OS</div>
    </div>

    <!-- 动态光标 -->
    <div id="cursor-neon"></div>
    <svg class="cursor-arrow" id="cursorArrow" width="22" height="30" viewBox="0 0 22 30">
        <polygon points="2,2 18,16 12,16 15,26 11,27 8,18 2,22"
                 fill="rgba(var(--accent-r),var(--accent-g),var(--accent-b),0.2)"
                 stroke="rgb(var(--accent-r),var(--accent-g),var(--accent-b))"
                 stroke-width="1.2" stroke-linejoin="round"/>
        <polygon points="4,5 14,14 10,14 12,21 10,22 8,16 4,18"
                 fill="rgb(var(--accent-r),var(--accent-g),var(--accent-b))"
                 opacity="0.4"/>
    </svg>
    <div class="cursor-tip" id="cursorTip"></div>

    <!-- 用户登录遮罩 -->
    <div id="login-overlay">
        <div class="login-card">
            <h1>Web Arcade OS</h1>
            <p class="sub">谁在玩游戏？输入昵称开始</p>
            <div class="login-input-wrap">
                <span class="login-icon">👾</span>
                <input type="text" id="loginInput" placeholder="输入你的昵称..." maxlength="12" autocomplete="off">
            </div>
            <div class="login-suggestions">
                <button class="suggest-btn" @click="pickSuggestion($event.target)">赛博玩家</button>
                <button class="suggest-btn" @click="pickSuggestion($event.target)">像素猎人</button>
                <button class="suggest-btn" @click="pickSuggestion($event.target)">星云旅者</button>
                <button class="suggest-btn" @click="pickSuggestion($event.target)">霓虹刺客</button>
                <button class="suggest-btn" @click="pickSuggestion($event.target)">极客迷</button>
                <button class="suggest-btn" @click="pickSuggestion($event.target)">游戏达人</button>
            </div>
            <button class="login-btn" @click="doLogin()">进入游戏厅</button>
        </div>
    </div>

    <!-- 排行榜 -->
    <div id="leaderboard-overlay">
        <div class="lb-card">
            <div class="lb-header">
                <h2>🏆 成就排行榜</h2>
                <button class="lb-close" @click="hideLeaderboard()">✕</button>
            </div>
            <div class="lb-body" id="lbBody">
                <div class="lb-loading">加载中...</div>
            </div>
        </div>
    </div>

    <header>
        <div class="logo">⚡ Web Arcade OS</div>
        <div class="header-right">
            <div style="position:relative;">
                <button class="hdr-icon-btn" id="themeBtn" @click="toggleThemePanel()" title="换肤">🎨</button>
                <div class="theme-panel" id="themePanel">
                    <button class="theme-opt active" data-theme-val="neon" @click="setTheme('neon')">
                        <span class="theme-swatch" style="background:linear-gradient(135deg,#0ff,#f0f);"></span>
                        赛博霓虹
                    </button>
                    <button class="theme-opt" data-theme-val="flame" @click="setTheme('flame')">
                        <span class="theme-swatch" style="background:linear-gradient(135deg,#ff7800,#ff3300);"></span>
                        暗夜烈焰
                    </button>
                    <button class="theme-opt" data-theme-val="frost" @click="setTheme('frost')">
                        <span class="theme-swatch" style="background:linear-gradient(135deg,#78dcff,#b4c8ff);"></span>
                        极地冰霜
                    </button>
                    <button class="theme-opt" data-theme-val="purple" @click="setTheme('purple')">
                        <span class="theme-swatch" style="background:linear-gradient(135deg,#b464ff,#ff50c8);"></span>
                        迷幻紫
                    </button>
                    <button class="theme-opt" data-theme-val="green" @click="setTheme('green')">
                        <span class="theme-swatch" style="background:linear-gradient(135deg,#50ff80,#00c8c8);"></span>
                        翡翠丛林
                    </button>
                    <button class="theme-opt" data-theme-val="light" @click="setTheme('light')">
                        <span class="theme-swatch" style="background:linear-gradient(135deg,#e2e8f0,#ffffff);border-color:#94a3b8;"></span>
                        纯净白昼 ☀️
                    </button>
                    <button class="theme-opt" data-theme-val="cybergold" @click="setTheme('cybergold')">
                        <span class="theme-swatch" style="background:linear-gradient(135deg,#ffbf00,#ff5000);"></span>
                        赛博黄金
                    </button>
                    <button class="theme-opt" data-theme-val="synthwave" @click="setTheme('synthwave')">
                        <span class="theme-swatch" style="background:linear-gradient(135deg,#ff3296,#00ffc8);"></span>
                        合成波浪潮
                    </button>
                    <button class="theme-opt" data-theme-val="matrix" @click="setTheme('matrix')">
                        <span class="theme-swatch" style="background:linear-gradient(135deg,#00ff41,#008a20);"></span>
                        黑客帝国
                    </button>
                    <button class="theme-opt" data-theme-val="crimson" @click="setTheme('crimson')">
                        <span class="theme-swatch" style="background:linear-gradient(135deg,#ff3030,#b00050);"></span>
                        绯红风暴
                    </button>
                    <button class="theme-opt" data-theme-val="aurora" @click="setTheme('aurora')">
                        <span class="theme-swatch" style="background:linear-gradient(135deg,#00ffb4,#9650ff);"></span>
                        极光幻境
                    </button>
                </div>
            </div>
            <button class="hdr-icon-btn" id="leaderboardBtn" @click="showLeaderboard()" title="排行榜">🏆</button>
            <a @click="router.push('/profile')" style="cursor:pointer" class="hdr-icon-btn" title="个人中心">👤</a>
            <a @click="router.push('/admin')" class="hdr-icon-btn" title="后台管理" style="opacity:0.55;cursor:pointer">⚙️</a>
            <div class="user-pill" id="userPill">
                <div class="avatar">👾</div>
                <span class="user-name" id="userNameDisplay">游客</span>
                <span class="pill-score" id="global-score">0</span>
                <button class="pill-logout" id="logoutBtn" @click="logoutUser()" style="display:none" title="退出登录">✕</button>
            </div>
        </div>
    </header>

    <main>
        <!-- 3D 全息轮播 -->
        <div class="carousel-container" :class="{ 'legacy-carousel': carouselMode === 'legacy' }">
            <canvas id="carouselParticles"></canvas>

            <!-- 轮播样式切换按钮 -->
            <button class="carousel-mode-toggle" @click="toggleCarouselMode()" :title="carouselMode==='swiper' ? '切换到旧版平行四边形轮播' : '切换到新版Coverflow轮播'">
                {{ carouselMode === 'swiper' ? '◇' : '◆' }}
            </button>

            <!-- Swiper Coverflow 新版 -->
            <template v-if="carouselMode === 'swiper'">
                <swiper
                    :modules="[EffectCoverflow, Navigation, Pagination, Autoplay]"
                    :effect="'coverflow'"
                    :centered-slides="true"
                    :slides-per-view="3"
                    :coverflow-effect="{ rotate: 5, stretch: -20, depth: 280, modifier: 1, slideShadows: false }"
                    :navigation="{ nextEl: '.carousel-arrow-right', prevEl: '.carousel-arrow-left' }"
                    :pagination="{ el: '.carousel-nav', clickable: true }"
                    :autoplay="{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }"
                    :loop="true"
                    :speed="700"
                    :loop-additional-slides="3"
                    :allow-touch-move="true"
                    class="carousel-swiper"
                >
                    <swiper-slide v-for="s in carouselSlides" :key="s.id" :class="'carousel-slide slide-' + s.id">
                        <div class="slide-overlay"></div>
                        <div class="slide-icon">{{ s.icon }}</div>
                        <span class="slide-badge">{{ s.badge }}</span>
                        <h2 class="slide-title">{{ s.title }}</h2>
                        <p class="slide-desc">{{ s.desc }}</p>
                        <a @click="router.push(s.link)" style="cursor:pointer" class="slide-btn">{{ s.btn }}</a>
                    </swiper-slide>
                </swiper>
                <div class="carousel-nav"></div>
            </template>

            <!-- 平行四边形 3D 旧版 -->
            <template v-if="carouselMode === 'legacy'">
                <div v-for="s in carouselSlides" :key="s.id" :class="'carousel-slide-legacy slide-' + s.id" :data-slide-id="s.id">
                    <div class="slide-overlay"></div>
                    <div class="slide-icon">{{ s.icon }}</div>
                    <span class="slide-badge">{{ s.badge }}</span>
                    <h2 class="slide-title">{{ s.title }}</h2>
                    <p class="slide-desc">{{ s.desc }}</p>
                    <a @click="router.push(s.link)" style="cursor:pointer" class="slide-btn">{{ s.btn }}</a>
                </div>
                <div class="carousel-nav">
                    <div v-for="(s, i) in carouselSlides" :key="s.id" class="nav-dot" :class="{ active: i === currentSlide }" @click="setSlide(i)"></div>
                </div>
            </template>

            <button class="carousel-arrow carousel-arrow-left" @click="carouselMode==='swiper' ? null : prevSlide()" aria-label="上一页">‹</button>
            <button class="carousel-arrow carousel-arrow-right" @click="carouselMode==='swiper' ? null : nextSlide()" aria-label="下一页">›</button>
        </div>


        <h2 class="section-title">游戏大厅列表</h2>

        <div class="filter-bar">
            <button class="filter-btn active" data-filter="all">全部展示</button>
            <button class="filter-btn" data-filter="action">射击/动作</button>
            <button class="filter-btn" data-filter="puzzle">休闲/解谜</button>
            <button class="filter-btn" data-filter="coop">双人/合作</button>
            <button class="filter-btn" data-filter="hardcore">硬核/反应</button>
            <button class="filter-btn fav-filter" data-filter="favorites" id="favFilterBtn">❤️ 收藏</button>
        </div>

        <!-- 炫酷检索 -->
        <div class="search-bar" id="searchBar">
            <span class="search-icon">🔍</span>
            <input type="text" id="searchInput" placeholder="搜索游戏名称、标签..." autocomplete="off">
            <span class="search-count" id="searchCount"></span>
            <button class="search-clear" id="searchClear">✕</button>
        </div>

        <div class="game-grid" id="game-grid">

            <article class="game-card" data-category="action" @click="router.push('/game/sky-defense')">
                <div class="card-cover cover-sky">✈️</div>
                <div class="card-info">
                    <h2>天空防卫局</h2>
                    <p>利用偏导护盾和电磁脉冲大招抵御不断袭来的外星陨石群。</p>
                    <div class="card-footer"><div class="tags"><span>动作</span> <span>射击</span></div><span class="btn-play">启动</span></div>
                </div>
            </article>

            <article class="game-card" data-category="puzzle" @click="router.push('/game/match')">
                <div class="card-cover cover-match">🐙</div>
                <div class="card-info">
                    <h2>深海寻宝</h2>
                    <p>翻开神秘的深海卡片，在限定步数内找出所有配对的海底生物。</p>
                    <div class="card-footer"><div class="tags"><span>记忆</span> <span>休闲</span></div><span class="btn-play">启动</span></div>
                </div>
            </article>

            <article class="game-card" data-category="hardcore puzzle" @click="router.push('/game/tower')">
                <div class="card-cover cover-tower">🏗️</div>
                <div class="card-info">
                    <h2>云端筑梦师</h2>
                    <p>抓准时机将建筑模块层层堆叠，挑战人类物理学的极限高度。</p>
                    <div class="card-footer"><div class="tags"><span>反应</span> <span>物理</span></div><span class="btn-play">启动</span></div>
                </div>
            </article>

            <article class="game-card" data-category="hardcore action" @click="router.push('/game/typist')">
                <div class="card-cover cover-type">💻</div>
                <div class="card-info">
                    <h2>极客骇客</h2>
                    <p>化身顶级黑客，快速敲击键盘拦截落下的代码病毒。</p>
                    <div class="card-footer"><div class="tags"><span>打字</span> <span>硬核</span></div><span class="btn-play">启动</span></div>
                </div>
            </article>

            <article class="game-card" data-category="hardcore action" @click="router.push('/game/beats')">
                <div class="card-cover cover-beat">🎵</div>
                <div class="card-info">
                    <h2>光音记忆</h2>
                    <p>经典 Simon Says 记忆挑战，记住光色与音符序列，重现完美旋律。</p>
                    <div class="card-footer"><div class="tags"><span>记忆</span> <span>音乐</span></div><span class="btn-play">启动</span></div>
                </div>
            </article>

            <article class="game-card" data-category="puzzle" @click="router.push('/game/particle')">
                <div class="card-cover cover-sand">🌌</div>
                <div class="card-info">
                    <h2>星海流沙</h2>
                    <p>6种粒子交互：引力场、银河旋涡、粒子烟花、流光拖尾、星空连线、粒子风暴，解压神器。</p>
                    <div class="card-footer"><div class="tags"><span>沙盒</span> <span>6模式</span></div><span class="btn-play">启动</span></div>
                </div>
            </article>

            <article class="game-card" data-category="coop puzzle" @click="router.push('/game/coop')">
                <div class="card-cover" style="background: linear-gradient(135deg, #ef4444, #3b82f6);">👯</div>
                <div class="card-info">
                    <h2>双子星探险</h2>
                    <p>双人配合穿越随机迷宫，蓝星和红星必须同时抵达专属传送门才能过关！支持联机远程合作。</p>
                    <div class="card-footer"><div class="tags"><span>联机</span> <span>双人</span> <span>迷宫</span></div><span class="btn-play">启动</span></div>
                </div>
            </article>

            <article class="game-card" data-category="classic casual" @click="router.push('/game/snake')">
                <div class="card-cover" style="background: linear-gradient(135deg, #22c55e, #15803d);">🐍</div>
                <div class="card-info">
                    <h2>贪吃蛇</h2>
                    <p>经典贪吃蛇玩法，全屏网格战场。吃果实越长越大，挑战最高分！</p>
                    <div class="card-footer"><div class="tags"><span>经典</span> <span>贪吃蛇</span></div><span class="btn-play">进入</span></div>
                </div>
            </article>

            <article class="game-card" data-category="puzzle" @click="router.push('/game/breakout')">
                <div class="card-cover" style="background: linear-gradient(135deg, #ec4899, #a855f7);">💎</div>
                <div class="card-info">
                    <h2>宝石消消乐</h2>
                    <p>交换相邻宝石凑成三个以上消除，巧妙布局触发华丽级联连消！</p>
                    <div class="card-footer"><div class="tags"><span>消除</span> <span>益智</span></div><span class="btn-play">启动</span></div>
                </div>
            </article>

        </div>
        <!-- 嵌入跑酷迷你游戏 -->
        <div class="mini-runner">
            <canvas id="homeRunner" width="1200" height="120"></canvas>
        </div>
    </main>
</template>

<script setup>

import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '../stores/theme.js'
import { useUserStore } from '../stores/user.js'
import { useGamesStore } from '../stores/games.js'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { EffectCoverflow, Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const router = useRouter()
const theme = useThemeStore()
const user = useUserStore()
const games = useGamesStore()

// One-time reset
if (!localStorage.getItem('arcadeDataReset_v2')) {
  localStorage.removeItem('arcadeProfiles');
  ['skyDefenseHighScore','matchHighScore','towerHighScore','typistHighScore','beatsHighScore','coopHighScore','breakoutHighScore','drawGuessBest','arcadeUser','arcadeRatings','arcadeFavorites'].forEach(k => localStorage.removeItem(k));
  localStorage.setItem('arcadeDataReset_v2', '1');
}

function toggleThemePanel() {
  document.getElementById('themePanel')?.classList.toggle('open');
}
function setTheme(name) {
  theme.set(name);
  document.querySelectorAll('.theme-opt').forEach(el => el.classList.remove('active'));
  document.querySelector(`[data-theme-val="${name}"]`)?.classList.add('active');
}
function doLogin() {
  const input = document.getElementById('loginInput');
  const name = input?.value?.trim();
  if (!name) return;
  user.login(name);
  document.getElementById('login-overlay').style.display = 'none';
  updateUserDisplay();
}
function pickSuggestion(btn) {
  const input = document.getElementById('loginInput');
  if (input && btn) input.value = btn.textContent;
}
function logoutUser() {
  user.logout();
  updateUserDisplay();
}
function updateUserDisplay() {
  const nameEl = document.getElementById('userNameDisplay');
  const scoreEl = document.getElementById('global-score');
  const logoutBtn = document.getElementById('logoutBtn');
  if (nameEl) nameEl.textContent = user.username || '游客';
  if (scoreEl) scoreEl.textContent = user.totalScore;
  if (logoutBtn) logoutBtn.style.display = user.isLoggedIn ? '' : 'none';
}
function showLeaderboard() {
  document.getElementById('leaderboard-overlay').style.display = 'flex';
  renderLeaderboard();
}
function hideLeaderboard() {
  document.getElementById('leaderboard-overlay').style.display = 'none';
}
function renderLeaderboard() {
  const body = document.getElementById('lbBody');
  if (!body) return;
  const users = Object.entries(user.allProfiles)
    .map(([name, scores]) => ({ name, total: Object.values(scores).reduce((s,v)=>s+v,0) }))
    .sort((a,b) => b.total - a.total);
  const maxScore = users.length ? Math.max(users[0].total, 1) : 1;
  let html = '<table><thead><tr><th>#</th><th>玩家</th><th>总分</th></tr></thead><tbody>';
  users.forEach((u,i) => {
    const medal = i===0 ? '🥇' : i===1 ? '🥈' : i===2 ? '🥉' : '';
    const barW = Math.max(2, (u.total / maxScore) * 100);
    html += `<tr><td>${i+1}</td><td>${medal} ${u.name}<div class="lb-bar"><div class="lb-bar-fill" style="width:${barW}%"></div></div></td><td>${u.total}</td></tr>`;
  });
  html += '</tbody></table>';
  body.innerHTML = html;
}

// Carousel slides data
const carouselSlides = [
  { id:'sky',  icon:'✈️', badge:'🎯 射击 · 生存', title:'天空防卫局', desc:'偏导护盾 + 电磁脉冲，在无尽的陨石雨与敌机中守卫最后防线', link:'/game/sky-defense', btn:'立即启动 ▶' },
  { id:'match',  icon:'🐙', badge:'🧩 记忆 · 休闲', title:'深海寻宝', desc:'翻开神秘卡片，在限定步数内找出所有配对的海底生物', link:'/game/match', btn:'开始探险 ▶' },
  { id:'tower',  icon:'🏗️', badge:'⚡ 反应 · 物理', title:'云端筑梦师', desc:'抓准时机堆叠建筑模块，挑战人类物理学的极限高度', link:'/game/tower', btn:'开始搭建 ▶' },
  { id:'typist', icon:'💻', badge:'⌨️ 打字 · 硬核', title:'极客骇客', desc:'化身顶级黑客，快速敲击键盘拦截落下的代码病毒', link:'/game/typist', btn:'入侵系统 ▶' },
  { id:'beats',  icon:'🎵', badge:'🧠 记忆 · 音乐', title:'光音记忆', desc:'记住光色与音符的序列，重现完美旋律，挑战你的记忆极限', link:'/game/beats', btn:'开始挑战 ▶' },
  { id:'particle', icon:'🌌', badge:'✨ 沙盒 · 解压', title:'星海流沙', desc:'6种粒子交互：引力场、银河旋涡、流光拖尾，解压神器', link:'/game/particle', btn:'进入星海 ▶' },
  { id:'coop',  icon:'👯', badge:'👫 双人 · 迷宫', title:'双子星探险', desc:'双人配合穿越随机迷宫，同时抵达传送门才能过关', link:'/game/coop', btn:'组队出发 ▶' },
  { id:'snake',  icon:'🐍', badge:'🕹 经典 · 贪吃蛇', title:'贪吃蛇', desc:'经典贪吃蛇玩法，全屏网格战场。吃果实越长越大，挑战最高分！', link:'/game/snake', btn:'开始游戏 ▶' },
  { id:'breakout', icon:'💎', badge:'🔄 消除 · 益智', title:'宝石消消乐', desc:'交换相邻宝石凑成三个以上消除，触发华丽级联连消', link:'/game/breakout', btn:'开始消除 ▶' },
]

// Carousel mode
const carouselMode = ref(localStorage.getItem('carouselMode') || 'swiper')
function toggleCarouselMode() {
  carouselMode.value = carouselMode.value === 'swiper' ? 'legacy' : 'swiper'
  localStorage.setItem('carouselMode', carouselMode.value)
  if (carouselMode.value === 'legacy') {
    nextTick(() => { updateCarouselLegacy(); startLegacyAutoplay(); })
  } else {
    stopLegacyAutoplay()
  }
}

// Legacy carousel
let currentSlide = 0
const totalSlides = 9
let carouselInterval = null
let isTransitioning = false

function getCarouselOffset(i) {
  let d = i - currentSlide
  if (d > totalSlides / 2) d -= totalSlides
  if (d < -totalSlides / 2) d += totalSlides
  return d
}
function posClass(offset) {
  if (offset === 0) return 'pos-current'
  if (offset === -1) return 'pos-prev'
  if (offset === 1) return 'pos-next'
  if (offset === -2) return 'pos-far-prev'
  if (offset === 2) return 'pos-far-next'
  return 'pos-hidden'
}
function updateCarouselLegacy() {
  const slides = document.querySelectorAll('.carousel-slide-legacy')
  slides.forEach((s, i) => {
    s.classList.remove('pos-current', 'pos-prev', 'pos-next', 'pos-far-prev', 'pos-far-next', 'pos-hidden')
    s.classList.add(posClass(getCarouselOffset(i)))
  })
  document.querySelectorAll('.carousel-nav .nav-dot').forEach((d, i) => d.classList.toggle('active', i === currentSlide))
}
function setSlide(i) {
  if (isTransitioning || i === currentSlide) return
  isTransitioning = true
  currentSlide = i
  updateCarouselLegacy()
  if (carouselInterval) { clearInterval(carouselInterval); carouselInterval = setInterval(nextSlide, 5000) }
  setTimeout(() => { isTransitioning = false }, 750)
}
function nextSlide() { setSlide((currentSlide + 1) % totalSlides) }
function prevSlide() { setSlide((currentSlide - 1 + totalSlides) % totalSlides) }
function startLegacyAutoplay() { stopLegacyAutoplay(); carouselInterval = setInterval(nextSlide, 5000) }
function stopLegacyAutoplay() { if (carouselInterval) { clearInterval(carouselInterval); carouselInterval = null } }

// Search & filter
function applySearchAndFilter() {
  const query = document.getElementById('searchInput')?.value?.toLowerCase() || '';
  const activeFilter = document.querySelector('.filter-btn.active')?.dataset?.filter || 'all';
  const cards = document.querySelectorAll('#game-grid .game-card');
  const countEl = document.getElementById('searchCount');
  let count = 0;
  cards.forEach(card => {
    const cat = card.dataset.category || '';
    const text = card.textContent?.toLowerCase() || '';
    let show = true;
    if (activeFilter !== 'all') {
      if (activeFilter === 'favorites') {
        show = card.dataset.fav === 'true';
      } else {
        show = cat.includes(activeFilter);
      }
    }
    if (query) show = show && text.includes(query);
    card.style.display = show ? '' : 'none';
    if (show) count++;
  });
  if (countEl) countEl.textContent = query ? count + ' 款游戏' : '';
}

// Expose for onclick
window.doLogin = doLogin;
window.pickSuggestion = pickSuggestion;
window.logoutUser = logoutUser;
window.showLeaderboard = showLeaderboard;
window.hideLeaderboard = hideLeaderboard;
window.setTheme = setTheme;
window.toggleThemePanel = toggleThemePanel;
window.setSlide = setSlide;
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.toggleCarouselMode = toggleCarouselMode;

// ========== 共享 canvas 变量 ==========
let starCanvas, starCtx, meteors, sparkParticles, bgStars, floatParticles, starW, starH, mouseX, mouseY;
let starRafId, cursorRafId, runnerRafId;
let starResizeHandler, starMouseMoveHandler, starMouseLeaveHandler;
let cursorMouseMoveHandler, cursorMouseDownHandler;
let bootTimeouts = [], loginTimeout, entranceTimeouts = [];
let cursorTrailDots = [];

onMounted(() => {
  user.loadFromStorage();
  games.loadFromStorage();
  updateUserDisplay();

  // Boot animation
  const bootScreen = document.getElementById('boot-screen');
  if (bootScreen) {
    const loginOverlay = document.getElementById('login-overlay');
    if (user.isLoggedIn) {
      bootScreen.remove();
    } else {
      const lines = bootScreen.querySelectorAll('.boot-line');
      const progress = document.getElementById('bootProgress');
      const title = document.getElementById('bootTitle');
      const delay = 80, step = 280;
      lines.forEach((line, i) => {
        bootTimeouts.push(setTimeout(() => {
          line.style.opacity = '1';
          line.style.transition = 'opacity 0.2s';
          if (progress) progress.style.width = Math.min(Math.round(((i+1)/lines.length)*95), 95) + '%';
        }, delay + i * step));
      });
      const totalDur = delay + lines.length * step;
      bootTimeouts.push(setTimeout(() => {
        if (progress) progress.style.width = '100%';
        if (title) { title.style.opacity = '1'; title.style.transition = 'opacity 0.6s'; }
      }, totalDur));
      bootTimeouts.push(setTimeout(() => {
        bootScreen.style.opacity = '0';
        bootTimeouts.push(setTimeout(() => {
          bootScreen.remove();
          if (loginOverlay) loginOverlay.classList.add('show');
          document.getElementById('loginInput')?.focus();
        }, 800));
      }, totalDur + 900));
    }
  }

  // Search/filter listeners
  document.getElementById('searchInput')?.addEventListener('input', applySearchAndFilter);
  document.getElementById('searchClear')?.addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    applySearchAndFilter();
  });
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      applySearchAndFilter();
    });
  });

  // Check if user needs login
  if (!user.isLoggedIn) {
    loginTimeout = setTimeout(() => {
      document.getElementById('login-overlay')?.style.setProperty('display', 'flex');
      document.getElementById('loginInput')?.focus();
    }, 3000);
  }

  // Leaderboard overlay click-outside
  document.getElementById('leaderboard-overlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) hideLeaderboard();
  });

  initStarfield();
  initCursor();
  initHomeRunner();
  initEntrance();

  // Init legacy carousel if mode is legacy
  if (carouselMode.value === 'legacy') {
    nextTick(() => { updateCarouselLegacy(); startLegacyAutoplay(); })
  }
});

// ========== 混沌流星背景 ==========
function initStarfield() {
  starCanvas = document.getElementById('starfieldCanvas');
  if (!starCanvas) return;
  starCtx = starCanvas.getContext('2d');
  meteors = []; sparkParticles = []; bgStars = []; floatParticles = [];
  mouseX = -1000; mouseY = -1000;

  function resize() { starW = starCanvas.width = window.innerWidth; starH = starCanvas.height = window.innerHeight; }
  resize();
  starResizeHandler = () => { resize(); initStars(); initFloatParticles(); meteors = []; sparkParticles = []; };
	  window.addEventListener('resize', starResizeHandler);

  function initStars() {
    bgStars = [];
    const count = Math.floor((starW * starH) / 2000);
    for (let i = 0; i < count; i++) {
      bgStars.push({
        x: Math.random() * starW, y: Math.random() * starH,
        r: Math.random() * 1.5 + 0.2,
        twinkleSpeed: 0.002 + Math.random() * 0.025,
        twinkleOffset: Math.random() * Math.PI * 2,
        hue: Math.random() < 0.25 ? 'accent' : (Math.random() < 0.12 ? 'accent2' : 'white')
      });
    }
  }

  function initFloatParticles() {
    floatParticles = [];
    const count = Math.floor((starW * starH) / 14000);
    for (let i = 0; i < count; i++) {
      floatParticles.push({
        x: Math.random() * starW, y: Math.random() * starH,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25 - 0.1,
        r: 0.4 + Math.random() * 1.6, phase: Math.random() * Math.PI * 2,
        speed: 0.003 + Math.random() * 0.01,
        hue: Math.random() < 0.2 ? 'accent' : (Math.random() < 0.1 ? 'accent2' : 'white')
      });
    }
  }

  function spawnMeteor() {
    const edge = Math.floor(Math.random() * 4);
    let x, y, baseAngle;
    const margin = 30;
    switch (edge) {
      case 0: x = Math.random() * starW; y = -margin; baseAngle = Math.PI * 0.35 + Math.random() * Math.PI * 0.3; break;
      case 1: x = starW + margin; y = Math.random() * starH; baseAngle = Math.PI * 0.55 + Math.random() * Math.PI * 0.4; break;
      case 2: x = Math.random() * starW; y = starH + margin; baseAngle = Math.PI * 1.35 + Math.random() * Math.PI * 0.3; break;
      default: x = -margin; y = Math.random() * starH; baseAngle = Math.PI * 1.65 + Math.random() * Math.PI * 0.4; break;
    }
    const angle = baseAngle + (Math.random() - 0.5) * Math.PI * 0.5;
    const speed = 3 + Math.random() * 14;
    const vx = Math.cos(angle) * speed, vy = Math.sin(angle) * speed;
    const len = 40 + Math.random() * 200;
    const hue = Math.random() < 0.35 ? 'accent' : (Math.random() < 0.55 ? 'accent2' : 'white');
    return { x, y, vx, vy, life: 1, decay: 0.002 + Math.random() * 0.012, len, hue, headR: 1 + Math.random() * 3.5, sparkTimer: 0, sparkInterval: 0.3 + Math.random() * 0.6, curve: (Math.random() - 0.5) * 0.04 };
  }

  function spawnSparks(mx, my, vx, vy, hue) {
    const count = 1 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      sparkParticles.push({
        x: mx, y: my, vx: vx * 0.3 + (Math.random() - 0.5) * 2, vy: vy * 0.3 + (Math.random() - 0.5) * 2,
        life: 0.15 + Math.random() * 0.35, decay: 0.015 + Math.random() * 0.04, r: 0.3 + Math.random() * 1.2, hue
      });
    }
  }

  initStars();
  initFloatParticles();
  starMouseMoveHandler = e => { mouseX = e.clientX; mouseY = e.clientY; };
  starMouseLeaveHandler = () => { mouseX = -1000; mouseY = -1000; };
  document.addEventListener('mousemove', starMouseMoveHandler);
  document.addEventListener('mouseleave', starMouseLeaveHandler);

  function drawStarfield(time) {
    if (!starCanvas.isConnected) return;
    starCtx.clearRect(0, 0, starW, starH);
    const style = getComputedStyle(document.documentElement);
    const ar = style.getPropertyValue('--accent-r').trim(), ag = style.getPropertyValue('--accent-g').trim(), ab = style.getPropertyValue('--accent-b').trim();
    const a2r = style.getPropertyValue('--accent2-r').trim(), a2g = style.getPropertyValue('--accent2-g').trim(), a2b = style.getPropertyValue('--accent2-b').trim();

    bgStars.forEach(s => {
      const alpha = 0.12 + Math.sin(time * s.twinkleSpeed + s.twinkleOffset) * 0.25;
      if (s.hue === 'accent') starCtx.fillStyle = `rgba(${ar},${ag},${ab},${Math.max(0.03,alpha)})`;
      else if (s.hue === 'accent2') starCtx.fillStyle = `rgba(${a2r},${a2g},${a2b},${Math.max(0.03,alpha)})`;
      else starCtx.fillStyle = `rgba(255,255,255,${Math.max(0.03,alpha)})`;
      starCtx.beginPath(); starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2); starCtx.fill();
    });

    if (Math.random() < 0.025 + Math.sin(time * 0.0003) * 0.01) meteors.push(spawnMeteor());
    if (meteors.length > 12) meteors.splice(0, meteors.length - 12);

    for (let i = sparkParticles.length - 1; i >= 0; i--) {
      const sp = sparkParticles[i];
      sp.x += sp.vx; sp.y += sp.vy; sp.vy += 0.01; sp.life -= sp.decay;
      if (sp.life <= 0) { sparkParticles.splice(i, 1); continue; }
      let sr, sg, sb;
      if (sp.hue === 'accent') { sr = ar; sg = ag; sb = ab; }
      else if (sp.hue === 'accent2') { sr = a2r; sg = a2g; sb = a2b; }
      else { sr = 255; sg = 255; sb = 255; }
      starCtx.fillStyle = `rgba(${sr},${sg},${sb},${sp.life})`;
      starCtx.shadowColor = `rgba(${sr},${sg},${sb},${sp.life * 0.5})`; starCtx.shadowBlur = 3;
      starCtx.beginPath(); starCtx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2); starCtx.fill();
    }
    starCtx.shadowBlur = 0;

    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx; m.y += m.vy; m.vx += m.curve; m.life -= m.decay;
      if (m.life <= 0 || m.x < -300 || m.x > starW + 300 || m.y < -300 || m.y > starH + 300) { meteors.splice(i, 1); continue; }
      m.sparkTimer += 1;
      if (m.sparkTimer >= m.sparkInterval * 60) { m.sparkTimer = 0; spawnSparks(m.x, m.y, m.vx, m.vy, m.hue); }
      const alpha = Math.min(1, m.life * 1.5), tailLen = m.len * (0.5 + m.life * 0.5);
      const tailX = m.x - m.vx * tailLen * 0.05, tailY = m.y - m.vy * tailLen * 0.05;
      let r, g, b;
      if (m.hue === 'accent') { r = ar; g = ag; b = ab; }
      else if (m.hue === 'accent2') { r = a2r; g = a2g; b = a2b; }
      else { r = 255; g = 255; b = 255; }
      const grad = starCtx.createLinearGradient(m.x, m.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
      grad.addColorStop(0.15, `rgba(${r},${g},${b},${alpha})`);
      grad.addColorStop(0.6, `rgba(${r},${g},${b},${alpha * 0.4})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      starCtx.strokeStyle = grad; starCtx.lineWidth = m.headR * 2.5; starCtx.lineCap = 'round';
      starCtx.shadowColor = `rgba(${r},${g},${b},${alpha * 0.5})`; starCtx.shadowBlur = 14;
      starCtx.beginPath(); starCtx.moveTo(m.x, m.y); starCtx.lineTo(tailX, tailY); starCtx.stroke();
      starCtx.shadowBlur = 0; starCtx.fillStyle = `rgba(255,255,255,${alpha})`;
      starCtx.shadowColor = `rgba(${r},${g},${b},${alpha})`; starCtx.shadowBlur = 18;
      starCtx.beginPath(); starCtx.arc(m.x, m.y, m.headR * 1.5, 0, Math.PI * 2); starCtx.fill();
      starCtx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.5})`;
      starCtx.beginPath(); starCtx.arc(m.x, m.y, m.headR * 3, 0, Math.PI * 2); starCtx.fill();
      starCtx.shadowBlur = 0;
    }

    for (let i = 0; i < floatParticles.length; i++) {
      const fp = floatParticles[i];
      fp.x += fp.vx + Math.sin(time * fp.speed + fp.phase) * 0.18;
      fp.y += fp.vy + Math.cos(time * fp.speed + fp.phase + 1) * 0.15;
      const dx = mouseX - fp.x, dy = mouseY - fp.y;
      const distToMouse = Math.sqrt(dx * dx + dy * dy);
      if (distToMouse < 250 && distToMouse > 1) { fp.x += dx / distToMouse * 0.28; fp.y += dy / distToMouse * 0.28; }
      if (fp.x < -20) fp.x = starW + 20; if (fp.x > starW + 20) fp.x = -20;
      if (fp.y < -20) fp.y = starH + 20; if (fp.y > starH + 20) fp.y = -20;
      const pulse = 0.5 + Math.sin(time * 0.002 + fp.phase) * 0.5;
      const falpha = 0.15 + pulse * 0.35;
      let fr, fg, fb;
      if (fp.hue === 'accent') { fr = ar; fg = ag; fb = ab; }
      else if (fp.hue === 'accent2') { fr = a2r; fg = a2g; fb = a2b; }
      else { fr = 255; fg = 255; fb = 255; }
      const glowGrad = starCtx.createRadialGradient(fp.x, fp.y, 0, fp.x, fp.y, fp.r * 3);
      glowGrad.addColorStop(0, `rgba(${fr},${fg},${fb},${falpha})`);
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      starCtx.fillStyle = glowGrad; starCtx.beginPath(); starCtx.arc(fp.x, fp.y, fp.r * 3, 0, Math.PI * 2); starCtx.fill();
      starCtx.fillStyle = `rgba(${fr},${fg},${fb},${falpha * 1.4})`;
      starCtx.beginPath(); starCtx.arc(fp.x, fp.y, fp.r * 0.7, 0, Math.PI * 2); starCtx.fill();
      for (let j = i + 1; j < floatParticles.length; j++) {
        const fp2 = floatParticles[j];
        const ldx = fp.x - fp2.x, ldy = fp.y - fp2.y;
        const dist = Math.sqrt(ldx * ldx + ldy * ldy);
        if (dist < 150) {
          const lineAlpha = (1 - dist / 150) * 0.12 * Math.min(falpha, 0.18 + Math.sin(time * 0.002 + fp2.phase) * 0.5 + 0.5);
          starCtx.strokeStyle = `rgba(${fr},${fg},${fb},${lineAlpha})`; starCtx.lineWidth = 0.3;
          starCtx.beginPath(); starCtx.moveTo(fp.x, fp.y); starCtx.lineTo(fp2.x, fp2.y); starCtx.stroke();
        }
      }
    }
    starRafId = requestAnimationFrame(drawStarfield);
  }
  starRafId = requestAnimationFrame(drawStarfield);
}

// ========== 赛博光标 ==========
function initCursor() {
  // Clean up any leftover trail dots from previous mounts
  cursorTrailDots.forEach(d => d.remove());
  cursorTrailDots = [];

  const neonCursor = document.getElementById('cursor-neon');
  const cursorArrow = document.getElementById('cursorArrow');
  const cursorTip = document.getElementById('cursorTip');
  let mx = 0, my = 0, cx = 0, cy = 0, rx = 0, ry = 0, dx = 0, dy = 0;
  const trail = [];
  const TRAIL_COUNT = 12;

  for (let i = 0; i < TRAIL_COUNT; i++) {
    const dot = document.createElement('div');
    dot.className = 'cursor-trail';
    const size = 3 + Math.random() * 5;
    dot.style.width = size + 'px';
    dot.style.height = size + 'px';
    document.body.appendChild(dot);
    cursorTrailDots.push(dot);
    trail.push({ el: dot, x: 0, y: 0, size, life: 0 });
  }

  cursorMouseMoveHandler = e => { mx = e.clientX; my = e.clientY; };
  document.addEventListener('mousemove', cursorMouseMoveHandler);

  cursorMouseDownHandler = e => {
    const count = 6 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'click-particle';
      const s = 2 + Math.random() * 6;
      p.style.width = s + 'px'; p.style.height = s + 'px';
      p.style.background = 'rgb(var(--accent-r),var(--accent-g),var(--accent-b))';
      p.style.left = e.clientX + 'px'; p.style.top = e.clientY + 'px';
      p.style.boxShadow = '0 0 6px rgba(var(--accent-r),var(--accent-g),var(--accent-b),0.8)';
      document.body.appendChild(p);
      const angle = Math.random() * Math.PI * 2;
      const vel = 40 + Math.random() * 80;
      const vx = Math.cos(angle) * vel, vy = Math.sin(angle) * vel;
      let life = 1;
      const animP = () => {
        life -= 0.025;
        if (life <= 0) { p.remove(); return; }
        p.style.left = (parseFloat(p.style.left) + vx * 0.016) + 'px';
        p.style.top = (parseFloat(p.style.top) + vy * 0.016) + 'px';
        p.style.opacity = life;
        p.style.transform = 'translate(-50%,-50%) scale(' + life + ')';
        requestAnimationFrame(animP);
      };
      requestAnimationFrame(animP);
    }
    if (cursorArrow) {
      cursorArrow.style.transition = 'transform 0.06s';
      cursorArrow.style.transform = 'translate(-2px,-2px) scale(0.85)';
      setTimeout(() => { if (cursorArrow) cursorArrow.style.transform = ''; }, 80);
    }
  };
  document.addEventListener('mousedown', cursorMouseDownHandler);

  function smoothFollow() {
    cx += (mx - cx) * 0.12; cy += (my - cy) * 0.12;
    rx += (mx - rx) * 0.25; ry += (my - ry) * 0.25;
    dx += (mx - dx) * 0.5; dy += (my - dy) * 0.5;
    if (neonCursor) { neonCursor.style.left = cx + 'px'; neonCursor.style.top = cy + 'px'; }
    if (cursorArrow) { cursorArrow.style.left = (rx - 2) + 'px'; cursorArrow.style.top = (ry - 2) + 'px'; }
    if (cursorTip) { cursorTip.style.left = dx + 'px'; cursorTip.style.top = dy + 'px'; }
    trail.unshift({ x: mx, y: my, life: 1 });
    if (trail.length > TRAIL_COUNT) trail.pop();
    trail.forEach((t, i) => {
      if (t.el) {
        t.el.style.left = t.x + 'px'; t.el.style.top = t.y + 'px';
        const alpha = Math.max(0, 1 - i / TRAIL_COUNT) * 0.7;
        const s = Math.max(0, 1 - i / TRAIL_COUNT);
        t.el.style.opacity = alpha;
        t.el.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
        t.el.style.background = 'rgb(var(--accent-r),var(--accent-g),var(--accent-b))';
        t.el.style.boxShadow = '0 0 ' + (4 + i * 2) + 'px rgba(var(--accent-r),var(--accent-g),var(--accent-b),' + (0.5 * (1 - i / TRAIL_COUNT)) + ')';
      }
    });
    cursorRafId = requestAnimationFrame(smoothFollow);
  }
  smoothFollow();
}

// ========== 嵌入跑酷迷你游戏 ==========
function initHomeRunner() {
  const c = document.getElementById('homeRunner');
  if (!c) return;
  const ctx = c.getContext('2d');
  const W = 1200, H = 120, GROUND = 100, GRAVITY = 0.55, JUMP_F = -8.5, PW = 18, PH = 26;

  function ac(a) {
    const s = getComputedStyle(document.documentElement);
    return `rgba(${s.getPropertyValue('--accent-r').trim()},${s.getPropertyValue('--accent-g').trim()},${s.getPropertyValue('--accent-b').trim()},${a??1})`;
  }
  function mc() {
    const s = getComputedStyle(document.documentElement);
    return `rgb(${s.getPropertyValue('--muted-r').trim()},${s.getPropertyValue('--muted-g').trim()},${s.getPropertyValue('--muted-b').trim()})`;
  }

  let state = 'idle', score = 0, hs = parseInt(localStorage.getItem('homeSprintHigh')||'0');
  let speed = 2, frame = 0, obs = [], spawnT = 0;
  let p = { x: 50, y: GROUND-PH, vy: 0, vx: 0, j: false, rf: 0 };

  function start() { state='playing'; score=0; frame=0; speed=2; obs=[]; spawnT=90; p.y=GROUND-PH; p.vy=0; p.vx=0; p.j=false; p.rf=0; }
  function spawn() { const types=[{w:14,h:22},{w:18,h:30},{w:12,h:26},{w:28,h:20}]; const t=types[Math.random()*4|0]; obs.push({x:W+10,w:t.w,h:t.h,y:GROUND-t.h}); }

  function update() {
    frame++; p.rf += speed*0.06;
    if (p.j) { p.vy+=GRAVITY; p.y+=p.vy; p.x+=p.vx; p.vx*=0.96; if(p.y+PH>=GROUND){p.y=GROUND-PH;p.vy=0;p.vx=0;p.j=false;} }
    else { p.x += (50-p.x)*0.03; }
    if(frame%3===0) score++;
    speed = Math.min(5,2+score*0.001);
    spawnT -= speed*0.3;
    if(spawnT<=0){spawn();spawnT=Math.max(50,90-score*0.03)+Math.random()*40;}
    for(let i=obs.length-1;i>=0;i--){
      const o=obs[i]; o.x-=speed;
      if(o.x+o.w<-20){obs.splice(i,1);continue;}
      if(p.x+2<o.x+o.w-2&&p.x+PW-4>o.x+2&&p.y+2<o.y+o.h-2&&p.y+PH-4>o.y+2){
        if(score>hs){hs=score;localStorage.setItem('homeSprintHigh',String(hs));}
        obs=[];p.y=GROUND-PH;p.vy=0;p.j=false;state='idle';return;
      }
    }
  }

  function draw() {
    const accent=ac(), muted=mc();
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='rgba(128,128,128,0.04)';ctx.lineWidth=1;
    for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    ctx.strokeStyle=ac(0.15);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,GROUND);ctx.lineTo(W,GROUND);ctx.stroke();
    const cols=['#ff4444','#ff00ff','#00ffff','#ff8800'];
    for(const o of obs){
      const ci=Math.floor(o.x/80)%4;
      ctx.shadowColor=cols[ci];ctx.shadowBlur=8;ctx.fillStyle=cols[ci];
      ctx.fillRect(o.x,o.y,o.w,o.h);
      ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(o.x+2,o.y+3,o.w-4,2);
    }
    ctx.shadowBlur=0;
    const bob=p.j?0:Math.sin(p.rf)*1.2, by=p.y+bob;
    ctx.shadowColor=accent;ctx.shadowBlur=10;ctx.fillStyle=accent;
    ctx.fillRect(p.x,by,PW,PH-6);
    ctx.beginPath();ctx.arc(p.x+PW/2,by-2,7,0,6.28);ctx.fill();
    ctx.shadowBlur=0;ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(p.x+PW/2+3,by-4,2,0,6.28);ctx.fill();
    ctx.fillStyle='#111';ctx.beginPath();ctx.arc(p.x+PW/2+4,by-4,1,0,6.28);ctx.fill();
    if(!p.j){
      const leg=Math.floor(p.rf*0.5)%2;
      ctx.fillStyle=accent;ctx.fillRect(p.x+3,by+PH-6,5,leg?6:3);ctx.fillRect(p.x+10,by+PH-6,5,leg?3:6);
    }
    ctx.shadowBlur=0;
    ctx.font='600 13px "Segoe UI",sans-serif';ctx.textAlign='right';
    ctx.fillStyle='rgb(var(--text-r),var(--text-g),var(--text-b))';ctx.fillText(`🏃 ${score}`,W-16,22);
    ctx.font='400 10px "Segoe UI",sans-serif';ctx.fillStyle=muted;ctx.fillText(`最高 ${hs}`,W-16,38);ctx.textAlign='left';
    if(state==='idle'){
      ctx.fillStyle='rgba(255,255,255,0.12)';ctx.font='500 13px "Segoe UI",sans-serif';ctx.textAlign='center';
      ctx.fillText('点击奔跑 →',W/2,GROUND-40);ctx.textAlign='left';
    }
  }

  function click() { if(state==='idle'){start();return;} if(p.j)return; p.vy=JUMP_F; p.y+=p.vy; p.j=true; p.rf=0; p.vx=3.5; }
  c.addEventListener('click', click);
  c.addEventListener('touchstart', e=>{e.preventDefault();click();});

  (function loop(){if(state==='playing')update();draw();runnerRafId=requestAnimationFrame(loop);})();
}

// ========== 入场动画 ==========
function initEntrance() {
  const targets = ['header', '.carousel-container', '.section-title', '.filter-bar', '.search-bar', '.mini-runner'];
  targets.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) el.classList.add('entrance-waiting');
  });
  document.querySelectorAll('.game-card').forEach(c => c.classList.add('entrance-waiting'));
  entranceTimeouts.push(setTimeout(() => {
    document.querySelectorAll('.entrance-waiting').forEach((el, i) => {
      entranceTimeouts.push(setTimeout(() => { el.classList.remove('entrance-waiting'); el.classList.add('entrance-done'); }, i * 60));
    });
  }, 400));
}

onUnmounted(() => {
  stopLegacyAutoplay();
  if (starRafId) cancelAnimationFrame(starRafId);
  if (cursorRafId) cancelAnimationFrame(cursorRafId);
  if (runnerRafId) cancelAnimationFrame(runnerRafId);
  if (starResizeHandler) window.removeEventListener('resize', starResizeHandler);
  if (starMouseMoveHandler) document.removeEventListener('mousemove', starMouseMoveHandler);
  if (starMouseLeaveHandler) document.removeEventListener('mouseleave', starMouseLeaveHandler);
  if (cursorMouseMoveHandler) document.removeEventListener('mousemove', cursorMouseMoveHandler);
  if (cursorMouseDownHandler) document.removeEventListener('mousedown', cursorMouseDownHandler);
  bootTimeouts.forEach(t => clearTimeout(t));
  bootTimeouts = [];
  if (loginTimeout) clearTimeout(loginTimeout);
  entranceTimeouts.forEach(t => clearTimeout(t));
  entranceTimeouts = [];
  cursorTrailDots.forEach(d => d.remove());
  cursorTrailDots = [];
});

</script>

<style>
@import "../styles/home.css";
</style>
