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
                <button class="suggest-btn" @click="pickSuggestion(this)">赛博玩家</button>
                <button class="suggest-btn" @click="pickSuggestion(this)">像素猎人</button>
                <button class="suggest-btn" @click="pickSuggestion(this)">星云旅者</button>
                <button class="suggest-btn" @click="pickSuggestion(this)">霓虹刺客</button>
                <button class="suggest-btn" @click="pickSuggestion(this)">极客迷</button>
                <button class="suggest-btn" @click="pickSuggestion(this)">游戏达人</button>
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
        <div class="carousel-container">
            <canvas id="carouselParticles"></canvas>
            <div class="carousel-slide slide-sky active">
                <div class="slide-overlay"></div>
                <div class="slide-icon">✈️</div>
                <span class="slide-badge">🎯 射击 · 生存</span>
                <h2 class="slide-title">天空防卫局</h2>
                <p class="slide-desc">偏导护盾 + 电磁脉冲，在无尽的陨石雨与敌机中守卫最后防线</p>
                <a @click="router.push('/game/sky-defense')" style="cursor:pointer" class="slide-btn">立即启动 ▶</a>
            </div>

            <div class="carousel-slide slide-match">
                <div class="slide-overlay"></div>
                <div class="slide-icon">🐙</div>
                <span class="slide-badge">🧩 记忆 · 休闲</span>
                <h2 class="slide-title">深海寻宝</h2>
                <p class="slide-desc">翻开神秘卡片，在限定步数内找出所有配对的海底生物</p>
                <a @click="router.push('/game/match')" style="cursor:pointer" class="slide-btn">开始探险 ▶</a>
            </div>

            <div class="carousel-slide slide-tower">
                <div class="slide-overlay"></div>
                <div class="slide-icon">🏗️</div>
                <span class="slide-badge">⚡ 反应 · 物理</span>
                <h2 class="slide-title">云端筑梦师</h2>
                <p class="slide-desc">抓准时机堆叠建筑模块，挑战人类物理学的极限高度</p>
                <a @click="router.push('/game/tower')" style="cursor:pointer" class="slide-btn">开始搭建 ▶</a>
            </div>

            <div class="carousel-slide slide-typist">
                <div class="slide-overlay"></div>
                <div class="slide-icon">💻</div>
                <span class="slide-badge">⌨️ 打字 · 硬核</span>
                <h2 class="slide-title">极客骇客</h2>
                <p class="slide-desc">化身顶级黑客，快速敲击键盘拦截落下的代码病毒</p>
                <a @click="router.push('/game/typist')" style="cursor:pointer" class="slide-btn">入侵系统 ▶</a>
            </div>

            <div class="carousel-slide slide-beats">
                <div class="slide-overlay"></div>
                <div class="slide-icon">🎵</div>
                <span class="slide-badge">🧠 记忆 · 音乐</span>
                <h2 class="slide-title">光音记忆</h2>
                <p class="slide-desc">记住光色与音符的序列，重现完美旋律，挑战你的记忆极限</p>
                <a @click="router.push('/game/beats')" style="cursor:pointer" class="slide-btn">开始挑战 ▶</a>
            </div>

            <div class="carousel-slide slide-particle">
                <div class="slide-overlay"></div>
                <div class="slide-icon">🌌</div>
                <span class="slide-badge">✨ 沙盒 · 解压</span>
                <h2 class="slide-title">星海流沙</h2>
                <p class="slide-desc">6种粒子交互：引力场、银河旋涡、流光拖尾，解压神器</p>
                <a @click="router.push('/game/particle')" style="cursor:pointer" class="slide-btn">进入星海 ▶</a>
            </div>

            <div class="carousel-slide slide-coop">
                <div class="slide-overlay"></div>
                <div class="slide-icon">👯</div>
                <span class="slide-badge">👫 双人 · 迷宫</span>
                <h2 class="slide-title">双子星探险</h2>
                <p class="slide-desc">双人配合穿越随机迷宫，同时抵达传送门才能过关</p>
                <a @click="router.push('/game/coop')" style="cursor:pointer" class="slide-btn">组队出发 ▶</a>
            </div>

            <div class="carousel-slide slide-snake">
                <div class="slide-overlay"></div>
                <div class="slide-icon">🐍</div>
                <span class="slide-badge">🕹 经典 · 贪吃蛇</span>
                <h2 class="slide-title">贪吃蛇</h2>
                <p class="slide-desc">经典贪吃蛇玩法，全屏网格战场。吃果实越长越大，挑战最高分！</p>
                <a @click="router.push('/game/snake')" style="cursor:pointer" class="slide-btn">开始游戏 ▶</a>
            </div>

            <div class="carousel-slide slide-breakout">
                <div class="slide-overlay"></div>
                <div class="slide-icon">💎</div>
                <span class="slide-badge">🔄 消除 · 益智</span>
                <h2 class="slide-title">宝石消消乐</h2>
                <p class="slide-desc">交换相邻宝石凑成三个以上消除，触发华丽级联连消</p>
                <a @click="router.push('/game/breakout')" style="cursor:pointer" class="slide-btn">开始消除 ▶</a>
            </div>

            <div class="carousel-nav">
                <div class="nav-dot active" @click="setSlide(0)"></div>
                <div class="nav-dot" @click="setSlide(1)"></div>
                <div class="nav-dot" @click="setSlide(2)"></div>
                <div class="nav-dot" @click="setSlide(3)"></div>
                <div class="nav-dot" @click="setSlide(4)"></div>
                <div class="nav-dot" @click="setSlide(5)"></div>
                <div class="nav-dot" @click="setSlide(6)"></div>
                <div class="nav-dot" @click="setSlide(7)"></div>
                <div class="nav-dot" @click="setSlide(8)"></div>
            </div>

            <button class="carousel-arrow carousel-arrow-left" @click="prevSlide()" aria-label="上一页">‹</button>
            <button class="carousel-arrow carousel-arrow-right" @click="nextSlide()" aria-label="下一页">›</button>
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

            <article class="game-card" data-category="action" @click="location.href='#!/game/sky-defense'">
                <div class="card-cover cover-sky">✈️</div>
                <div class="card-info">
                    <h2>天空防卫局</h2>
                    <p>利用偏导护盾和电磁脉冲大招抵御不断袭来的外星陨石群。</p>
                    <div class="card-footer"><div class="tags"><span>动作</span> <span>射击</span></div><span class="btn-play">启动</span></div>
                </div>
            </article>

            <article class="game-card" data-category="puzzle" @click="location.href='#!/game/match'">
                <div class="card-cover cover-match">🐙</div>
                <div class="card-info">
                    <h2>深海寻宝</h2>
                    <p>翻开神秘的深海卡片，在限定步数内找出所有配对的海底生物。</p>
                    <div class="card-footer"><div class="tags"><span>记忆</span> <span>休闲</span></div><span class="btn-play">启动</span></div>
                </div>
            </article>

            <article class="game-card" data-category="hardcore puzzle" @click="location.href='#!/game/tower'">
                <div class="card-cover cover-tower">🏗️</div>
                <div class="card-info">
                    <h2>云端筑梦师</h2>
                    <p>抓准时机将建筑模块层层堆叠，挑战人类物理学的极限高度。</p>
                    <div class="card-footer"><div class="tags"><span>反应</span> <span>物理</span></div><span class="btn-play">启动</span></div>
                </div>
            </article>

            <article class="game-card" data-category="hardcore action" @click="location.href='#!/game/typist'">
                <div class="card-cover cover-type">💻</div>
                <div class="card-info">
                    <h2>极客骇客</h2>
                    <p>化身顶级黑客，快速敲击键盘拦截落下的代码病毒。</p>
                    <div class="card-footer"><div class="tags"><span>打字</span> <span>硬核</span></div><span class="btn-play">启动</span></div>
                </div>
            </article>

            <article class="game-card" data-category="hardcore action" @click="location.href='#!/game/beats'">
                <div class="card-cover cover-beat">🎵</div>
                <div class="card-info">
                    <h2>光音记忆</h2>
                    <p>经典 Simon Says 记忆挑战，记住光色与音符序列，重现完美旋律。</p>
                    <div class="card-footer"><div class="tags"><span>记忆</span> <span>音乐</span></div><span class="btn-play">启动</span></div>
                </div>
            </article>

            <article class="game-card" data-category="puzzle" @click="location.href='#!/game/particle'">
                <div class="card-cover cover-sand">🌌</div>
                <div class="card-info">
                    <h2>星海流沙</h2>
                    <p>6种粒子交互：引力场、银河旋涡、粒子烟花、流光拖尾、星空连线、粒子风暴，解压神器。</p>
                    <div class="card-footer"><div class="tags"><span>沙盒</span> <span>6模式</span></div><span class="btn-play">启动</span></div>
                </div>
            </article>

            <article class="game-card" data-category="coop puzzle" @click="location.href='#!/game/coop'">
                <div class="card-cover" style="background: linear-gradient(135deg, #ef4444, #3b82f6);">👯</div>
                <div class="card-info">
                    <h2>双子星探险</h2>
                    <p>双人配合穿越随机迷宫，蓝星和红星必须同时抵达专属传送门才能过关！支持联机远程合作。</p>
                    <div class="card-footer"><div class="tags"><span>联机</span> <span>双人</span> <span>迷宫</span></div><span class="btn-play">启动</span></div>
                </div>
            </article>

            <article class="game-card" data-category="classic casual" @click="location.href='#!/game/snake'">
                <div class="card-cover" style="background: linear-gradient(135deg, #22c55e, #15803d);">🐍</div>
                <div class="card-info">
                    <h2>贪吃蛇</h2>
                    <p>经典贪吃蛇玩法，全屏网格战场。吃果实越长越大，挑战最高分！</p>
                    <div class="card-footer"><div class="tags"><span>经典</span> <span>贪吃蛇</span></div><span class="btn-play">进入</span></div>
                </div>
            </article>

            <article class="game-card" data-category="puzzle" @click="location.href='#!/game/breakout'">
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

import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '../stores/theme.js'
import { useUserStore } from '../stores/user.js'
import { useGamesStore } from '../stores/games.js'

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
  let html = '<table><thead><tr><th>#</th><th>玩家</th><th>总分</th></tr></thead><tbody>';
  users.forEach((u,i) => { html += `<tr><td>${i+1}</td><td>${u.name}</td><td>${u.total}</td></tr>`; });
  html += '</tbody></table>';
  body.innerHTML = html;
}

// Carousel
let currentSlide = 0;
const totalSlides = 9;
let carouselInterval;

function setSlide(i) {
  document.querySelectorAll('.carousel-slide').forEach((s, idx) => s.classList.toggle('active', idx === i));
  document.querySelectorAll('.nav-dot').forEach((d, idx) => d.classList.toggle('active', idx === i));
  currentSlide = i;
}
function nextSlide() { setSlide((currentSlide + 1) % totalSlides); }
function prevSlide() { setSlide((currentSlide - 1 + totalSlides) % totalSlides); }

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

onMounted(() => {
  user.loadFromStorage();
  games.loadFromStorage();
  updateUserDisplay();

  // Boot animation
  const bootScreen = document.getElementById('boot-screen');
  if (bootScreen) {
    const lines = bootScreen.querySelectorAll('.boot-line');
    const progress = document.getElementById('bootProgress');
    const title = document.getElementById('bootTitle');
    let delay = 200;
    lines.forEach((line, i) => {
      setTimeout(() => {
        line.style.opacity = '1';
        if (progress) progress.style.width = ((i + 1) / lines.length) * 100 + '%';
      }, delay * (i + 1));
    });
    setTimeout(() => {
      if (title) title.style.opacity = '1';
      if (progress) progress.style.width = '100%';
    }, delay * (lines.length + 1));
    setTimeout(() => {
      bootScreen.style.opacity = '0';
      setTimeout(() => { bootScreen.style.display = 'none'; }, 800);
    }, delay * (lines.length + 1) + 600);
  }

  // Carousel auto-rotate
  carouselInterval = setInterval(nextSlide, 5000);

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
    setTimeout(() => {
      document.getElementById('login-overlay')?.style.setProperty('display', 'flex');
      document.getElementById('loginInput')?.focus();
    }, 3000);
  }

  // Starfield canvas (original logic preserved)
  initStarfield();
});

function initStarfield() {
  const canvas = document.getElementById('starfieldCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 150; i++) {
    stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 1.5 + 0.5, speed: Math.random() * 0.3 + 0.1, alpha: Math.random() * 0.7 + 0.3 });
  }
  function draw() {
    if (!canvas.isConnected) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.y += s.speed;
      if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

</script>

<style>
@import "../styles/home.css";
</style>
