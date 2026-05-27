<template>
<!-- ========== 暗号验证门 ========== -->
<div id="authGate">
  <div class="auth-box">
    <span class="glyph">⛛</span>
    <h1>ACCESS RESTRICTED</h1>
    <p class="tagline">后台管理 · 请输入暗号</p>
    <form class="auth-input-wrap" onsubmit="checkPasscode(event)">
      <input type="password" id="authInput" placeholder="········" maxlength="20" autocomplete="off">
      <button type="submit">验证</button>
    </form>
    <div class="auth-error" id="authError"></div>
    <div class="auth-hint">[ SYS::GATE — CLEARANCE REQUIRED ]</div>
  </div>
</div>

<!-- ========== 主内容（验证后显示） ========== -->
<div id="mainContent" style="display:none">

<nav class="nav">
  <h1>⛛ 后台管理面板</h1>
  <div class="nav-actions">
    <a @click="router.push('/')" style="cursor:pointer" class="btn-nav">← 返回大厅</a>
    <a @click="router.push('/profile')" style="cursor:pointer" class="btn-nav">👤 个人中心</a>
    <button class="btn-nav danger" @click="lockGate()">🔒 锁定</button>
  </div>
</nav>

<div class="main">

  <!-- 仪表盘 -->
  <div class="dash-grid">
    <div class="dash-card"><div class="ico">👥</div><div class="val" id="dashUserCount">0</div><div class="lbl">注册用户总数</div></div>
    <div class="dash-card"><div class="ico">🎮</div><div class="val" id="dashPlayCount">0</div><div class="lbl">总游玩次数</div></div>
    <div class="dash-card"><div class="ico">🔥</div><div class="val" id="dashHotGame">—</div><div class="lbl">最热游戏</div></div>
    <div class="dash-card"><div class="ico">👑</div><div class="val" id="dashTopPlayer">—</div><div class="lbl">最高分玩家</div></div>
  </div>

  <!-- 用户排行榜 -->
  <div class="section">
    <h2 class="section-title">🏆 用户排行榜</h2>
    <div class="table-wrap" id="userTableWrap">
      <div class="empty-state">加载中...</div>
    </div>
  </div>

  <!-- 游戏统计 & 评论区 -->
  <div class="section">
    <h2 class="section-title">📊 游戏统计 & 社区评论</h2>
    <div class="game-stats-grid" id="gameStatsGrid">
      <div class="empty-state">加载中...</div>
    </div>
  </div>

  <!-- 数据管理 -->
  <div class="section">
    <h2 class="section-title">🗄️ 数据管理</h2>
    <div class="mgmt-row">
      <button class="btn-mgmt" @click="exportAllData()">📥 导出全部数据 (JSON)</button>
      <button class="btn-mgmt" @click="showClearUser()">🗑️ 清除指定用户</button>
      <button class="btn-nav danger" @click="showResetAll()">⚠️ 重置所有数据</button>
    </div>
  </div>
</div>

</div><!-- /mainContent -->

<!-- 清除用户确认 -->
<div class="confirm-overlay" id="clearUserOverlay">
  <div class="confirm-box">
    <h2>清除用户数据</h2>
    <p>选择要清除的用户，此操作不可撤销。</p>
    <select id="clearUserSelect" style="width:100%;padding:8px 12px;margin-bottom:14px;background:rgba(var(--sr2),var(--sg2),var(--sb2),0.8);color:#fff;border:1px solid rgba(var(--accent-r),var(--accent-g),var(--accent-b),0.25);border-radius:8px;font-family:inherit;font-size:0.85rem"></select>
    <div class="confirm-btns">
      <button class="btn-confirm-cancel" @click="hideClearUser()">取消</button>
      <button class="btn-confirm-danger" @click="doClearUser()">确认清除</button>
    </div>
  </div>
</div>

<!-- 重置所有数据确认 -->
<div class="confirm-overlay" id="resetAllOverlay">
  <div class="confirm-box">
    <h2>⚠️ 重置所有数据</h2>
    <p>这将清除所有用户档案、分数、游玩记录、收藏、评论和主题数据。此操作不可撤销！</p>
    <div class="confirm-btns">
      <button class="btn-confirm-cancel" @click="hideResetAll()">取消</button>
      <button class="btn-confirm-danger" @click="doResetAll()">确认重置全部</button>
    </div>
  </div>
</div>
</template>

<script setup>

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '../stores/admin.js'
import { useUserStore } from '../stores/user.js'
import { useGamesStore } from '../stores/games.js'

const router = useRouter()
const admin = useAdminStore()
const user = useUserStore()
const games = useGamesStore()

const passcode = ref('')
const authError = ref('')
const checking = ref(false)

function lockGate() {
  admin.lock();
  document.getElementById('authGate').style.display = '';
  document.getElementById('mainContent').style.display = 'none';
}

async function checkPasscode(e) {
  e.preventDefault();
  const val = passcode.value.trim();
  if (!val) return;
  authError.value = '';
  checking.value = true;
  try {
    const ok = await admin.verifyPasscode(val);
    if (ok) {
      document.getElementById('authGate').style.display = 'none';
      document.getElementById('mainContent').style.display = '';
      renderAll();
    } else {
      authError.value = '✦ 暗号错误 · ACCESS DENIED';
      passcode.value = '';
    }
  } catch { authError.value = '✦ 验证服务不可用，请稍后重试'; }
  checking.value = false;
}

// Auto-auth
if (admin.isAuthed) {
  setTimeout(() => {
    document.getElementById('authGate') && (document.getElementById('authGate').style.display = 'none');
    document.getElementById('mainContent') && (document.getElementById('mainContent').style.display = '');
    renderAll();
  }, 100);
}

// Data access
function getAllProfiles() { return user.allProfiles; }
function getPlayCounts() { return games.playCounts; }
function getComments() { return games.comments; }
function saveComments(c) { games.comments = c; games.saveComments(); }

function calcUserTotal(scores) { return Object.values(scores).reduce((s,v)=>s+v,0); }

function renderDashboard() {
  const profiles = getAllProfiles();
  const users = Object.keys(profiles);
  document.getElementById('dashUserCount').textContent = users.length;
  let totalPlays = 0;
  Object.values(games.playCounts).forEach(v => totalPlays += v);
  document.getElementById('dashPlayCount').textContent = totalPlays;
  let hotGame='—', hotCount=0;
  games.list.forEach(g => { const c = games.playCounts[g.name]||0; if(c>hotCount){hotCount=c;hotGame=g.name;} });
  document.getElementById('dashHotGame').textContent = hotGame;
  let topPlayer='—', topScore=0;
  users.forEach(u => { const t=calcUserTotal(profiles[u]); if(t>topScore){topScore=t;topPlayer=u;} });
  document.getElementById('dashTopPlayer').textContent = topPlayer;
}

function renderUserTable() {
  const profiles = getAllProfiles();
  const users = Object.entries(profiles).map(([name,scores])=>({name,total:calcUserTotal(scores),scores}));
  users.sort((a,b)=>b.total-a.total);
  if(users.length===0){ document.getElementById('userTableWrap').innerHTML='<div class="empty-state">暂无用户数据</div>'; return; }
  let html='<table><thead><tr><th>排名</th><th>用户名</th>';
  games.list.forEach(g=>html+='<th>'+g.icon+'</th>');
  html+='<th>总分</th></tr></thead><tbody>';
  const medals=['🥇','🥈','🥉'];
  users.forEach((u,i)=>{
    const rc=i===0?'rank-gold':i===1?'rank-silver':i===2?'rank-bronze':'';
    html+='<tr><td class="'+rc+'">'+(i<3?medals[i]:i+1)+'</td><td style="font-weight:600">'+u.name+'</td>';
    games.list.forEach(g=>{ html+='<td class="score-cell">'+(u.scores[g.key]||'-')+'</td>'; });
    html+='<td class="total-cell">'+u.total+'</td></tr>';
  });
  html+='</tbody></table>';
  document.getElementById('userTableWrap').innerHTML=html;
}

function renderGameStats() {
  const profiles = getAllProfiles();
  const users = Object.keys(profiles);
  let html='';
  games.list.forEach(g=>{
    let totalScore=0,best=0,players=0;
    users.forEach(u=>{ const s=profiles[u][g.key]||0; if(s>0){players++;totalScore+=s;if(s>best)best=s;} });
    const plays = games.playCounts[g.name]||0;
    const avg = players>0?Math.round(totalScore/players):0;
    html+='<div class="game-stat-card"><div class="gname"><span style="font-size:1.3rem">'+g.icon+'</span> '+g.name+'</div>';
    html+='<div class="gstat">游玩次数: <b>'+plays+'</b> &nbsp;|&nbsp; 玩家数: <b>'+players+'</b> &nbsp;|&nbsp; 平均分: <b>'+avg+'</b> &nbsp;|&nbsp; 最高分: <b>'+best+'</b></div>';
    html+=renderComments(g.key);
    html+='</div>';
  });
  document.getElementById('gameStatsGrid').innerHTML=html;
}

function renderComments(gameKey) {
  const comments = getComments();
  const list = comments[gameKey] || [];
  let html='<div class="comments-section"><div class="cmt-title">💬 玩家评论 ('+list.length+')</div><div class="comment-list">';
  if(list.length===0){ html+='<div class="cmt-empty">暂无评论，来说两句吧</div>'; }
  else {
    list.forEach((c,i)=>{
      const d=new Date(c.time);
      const ts=d.toLocaleDateString('zh-CN')+' '+d.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});
      html+='<div class="comment-item"><div class="cmt-avatar">'+(c.user||'匿')[0]+'</div>';
      html+='<div class="cmt-body"><span class="cmt-user">'+c.user+'</span> <span class="cmt-time">'+ts+'</span><div class="cmt-text">'+c.text+'</div></div>';
      html+='<button class="cmt-del" onclick="deleteCommentAdmin(\''+gameKey+'\','+(c._id?"'"+c._id+"'":i)+')">✕</button></div>';
    });
  }
  html+='</div><div class="cmt-input-row"><input id="cmt-input-'+gameKey+'" placeholder="写下你对 '+g.name+' 的评价..." maxlength="200" onkeydown="if(event.key===\'Enter\')addCommentAdmin(\''+gameKey+'\')"><button onclick="addCommentAdmin(\''+gameKey+'\')">发送</button></div></div>';
  return html;
}

function addCommentAdmin(gameKey) {
  const input = document.getElementById('cmt-input-'+gameKey);
  const text = input?.value?.trim();
  if(!text) return;
  const name = user.username || '匿名';
  games.addComment(gameKey, name, text);
  if(input) input.value = '';
  renderGameStats();
}

function deleteCommentAdmin(gameKey, indexOrId) {
  games.deleteComment(gameKey, indexOrId);
  renderGameStats();
}

function renderAll() {
  renderDashboard();
  renderUserTable();
  renderGameStats();
}

// Data management
function exportAllData() {
  const data={ exportTime:new Date().toISOString(), profiles:getAllProfiles(), playCounts:getPlayCounts(), favorites:JSON.parse(localStorage.getItem('arcadeFavorites')||'[]'), theme:localStorage.getItem('arcadeTheme')||'neon', comments:getComments() };
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='arcade-backup-'+new Date().toISOString().slice(0,10)+'.json'; a.click(); URL.revokeObjectURL(a.href);
}

function showClearUser() {
  const profiles=getAllProfiles();
  const sel=document.getElementById('clearUserSelect');
  sel.innerHTML=Object.keys(profiles).map(u=>'<option value="'+u+'">'+u+'</option>').join('');
  if(!Object.keys(profiles).length) sel.innerHTML='<option>暂无用户</option>';
  document.getElementById('clearUserOverlay').classList.add('show');
}
function hideClearUser(){ document.getElementById('clearUserOverlay').classList.remove('show'); }
function doClearUser(){
  const name=document.getElementById('clearUserSelect').value;
  if(!name)return;
  user.deleteUser(name);
  hideClearUser();
  renderAll();
}
function showResetAll(){ document.getElementById('resetAllOverlay').classList.add('show'); }
function hideResetAll(){ document.getElementById('resetAllOverlay').classList.remove('show'); }
function doResetAll(){
  user.resetAll();
  hideResetAll();
  renderAll();
}

// Expose
window.checkPasscode = checkPasscode;
window.lockGate = lockGate;
window.exportAllData = exportAllData;
window.showClearUser = showClearUser;
window.hideClearUser = hideClearUser;
window.doClearUser = doClearUser;
window.showResetAll = showResetAll;
window.hideResetAll = hideResetAll;
window.doResetAll = doResetAll;
window.addCommentAdmin = addCommentAdmin;
window.deleteCommentAdmin = deleteCommentAdmin;

onMounted(() => {
  user.loadFromStorage();
  games.loadFromStorage();
  document.getElementById('authInput')?.focus();
  document.getElementById('clearUserOverlay')?.addEventListener('click',e=>{if(e.target===e.currentTarget)hideClearUser();});
  document.getElementById('resetAllOverlay')?.addEventListener('click',e=>{if(e.target===e.currentTarget)hideResetAll();});
  if (admin.isAuthed) renderAll();
  // Refresh from cloud
  if (typeof CloudSync !== 'undefined') {
    Promise.all([CloudSync.loadAllProfiles(), CloudSync.loadPlayCounts(), CloudSync.loadComments()])
      .then(() => { user.loadFromStorage(); games.loadFromStorage(); renderAll(); })
      .catch(() => {});
  }
});

</script>

<style>
@import "../styles/admin.css";
</style>
