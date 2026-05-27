<template>
<div class="game-header">
        <h1>💎 宝石消消乐</h1>
        <div class="header-stat">分数: <span id="score-display">0</span></div>
        <div class="header-stat" style="color:#a78bfa;font-size:0.9rem;" id="combo-display"></div>
    </div>

    <div class="canvas-container">
        <canvas id="gameCanvas" width="520" height="600"></canvas>
        <div class="overlay" id="overlay">
            <h2 id="msg-title" style="color:#fcd34d;">🎉 太棒了！</h2>
            <p id="msg-desc">最终得分: 0</p>
            <button id="msg-btn">再来一局 🔄</button>
        </div>
    </div>

    <div class="controls">
        <button class="btn-back" onclick="location.NaN">返回大厅</button>
        <span class="hint-text">按 <kbd style="background:#334155;padding:2px 8px;border-radius:4px;font-size:0.8rem;">R</kbd> 重新开始</span>
    </div>
    <div class="rules">
        <span>🎯 点击相邻两颗宝石交换</span>
        <span>✨ 凑齐 <strong>3颗或以上</strong> 同行/同列即可消除</span>
        <span>🔥 连续消除触发 <strong>连消倍率</strong>，分数暴涨</span>
        <span>💡 无可消除组合时游戏结束</span>
    </div>

    

<!-- ====================== COMMENT WIDGET ====================== -->
<style>
.cmt-trigger{position:fixed;bottom:20px;right:20px;z-index:9998;width:42px;height:42px;border-radius:50%;background:rgba(6,8,16,0.85);backdrop-filter:blur(8px);border:1px solid rgba(0,255,200,0.15);color:#00ffc8;font-size:1.2rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:0.25s;box-shadow:0 4px 20px rgba(0,0,0,0.4)}
.cmt-trigger:hover{transform:scale(1.1);box-shadow:0 0 25px rgba(0,255,200,0.15);border-color:rgba(0,255,200,0.3)}
.cmt-trigger .badge{position:absolute;top:-5px;right:-5px;min-width:16px;height:16px;border-radius:8px;background:#ff40c8;color:#fff;font-size:0.6rem;display:flex;align-items:center;justify-content:center;padding:0 4px;font-weight:700}
.cmt-panel{position:fixed;bottom:0;left:0;right:0;z-index:9997;background:rgba(8,12,22,0.97);backdrop-filter:blur(16px);border-top:1px solid rgba(0,255,200,0.1);transform:translateY(100%);transition:transform 0.35s cubic-bezier(0.22,1,0.36,1);max-height:55vh;display:flex;flex-direction:column;box-shadow:0 -20px 60px rgba(0,0,0,0.5)}
.cmt-panel.open{transform:translateY(0)}
.cmt-panel-header{display:flex;justify-content:space-between;align-items:center;padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:0.78rem;font-weight:700;color:#00ffc8;letter-spacing:1px}
.cmt-panel-header button{background:none;border:none;color:#6a7a9a;font-size:1rem;cursor:pointer;padding:4px 8px;transition:0.2s}
.cmt-panel-header button:hover{color:#ff4050}
.cmt-list{flex:1;overflow-y:auto;padding:8px 16px;min-height:60px;max-height:35vh}
.cmt-item{display:flex;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.03);font-size:0.78rem}
.cmt-item .avatar{width:26px;height:26px;border-radius:50%;flex-shrink:0;background:rgba(0,255,200,0.1);display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:#00ffc8}
.cmt-item .body{flex:1;min-width:0}
.cmt-item .uname{font-weight:600;color:#00ffc8;font-size:0.7rem}
.cmt-item .text{color:#c0d0e0;line-height:1.4;word-break:break-word;margin-top:2px;font-size:0.72rem}
.cmt-item .time{font-size:0.6rem;color:#4a5a7a}
.cmt-empty{text-align:center;color:#4a5a7a;padding:16px 0;font-size:0.72rem}
.cmt-input-row{display:flex;gap:8px;padding:10px 16px;border-top:1px solid rgba(255,255,255,0.04)}
.cmt-input-row input{flex:1;padding:8px 12px;font-size:0.75rem;font-family:inherit;background:rgba(255,255,255,0.04);color:#e0e8ff;border:1px solid rgba(0,255,200,0.1);border-radius:8px;outline:none;transition:0.2s}
.cmt-input-row input:focus{border-color:rgba(0,255,200,0.3)}
.cmt-input-row input::placeholder{color:rgba(255,255,255,0.15)}
.cmt-input-row button{padding:8px 16px;font-size:0.72rem;font-weight:700;font-family:inherit;background:rgba(0,255,200,0.1);color:#00ffc8;border:1px solid rgba(0,255,200,0.2);border-radius:8px;cursor:pointer;white-space:nowrap;transition:0.2s}
.cmt-input-row button:hover{background:rgba(0,255,200,0.2)}
</style>
<div class="cmt-trigger" id="cmtTrigger" onclick="toggleComments()" title="评论">💬<span class="badge" id="cmtBadge" style="display:none">0</span></div>
<div class="cmt-panel" id="cmtPanel">
<div class="cmt-panel-header"><span>💬 宝石消消乐 · 玩家评论</span><button onclick="toggleComments()">✕</button></div>
<div class="cmt-list" id="cmtList"></div>
<div class="cmt-input-row"><input id="cmtInput" placeholder="写下你的评价..." maxlength="200" onkeydown="if(event.key==='Enter')addComment()"><button onclick="addComment()">发送</button></div>
</div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue"
import { useRouter } from "vue-router"
const router = useRouter()
const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreEl = document.getElementById('score-display');
        const comboEl = document.getElementById('combo-display');
        const overlay = document.getElementById('overlay');

        // ========== 常量 ==========
        const COLS = 8, ROWS = 8, TILE_TYPES = 7;
        const TILE_SIZE = 52, PADDING = 3, RADIUS = 8;
        const GRID_LEFT = Math.floor((canvas.width - COLS * TILE_SIZE) / 2);
        const GRID_TOP = 52;

        const COLORS = [
            '#ef4444', '#f97316', '#fcd34d', '#22c55e',
            '#3b82f6', '#a855f7', '#ec4899'
        ];
        const EMOJIS = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '💗'];

        // ========== 游戏状态 ==========
        let grid = [];
        let score = 0;
        let combo = 0;
        let selected = null; // { row, col }
        let state = 'idle'; // idle | animating
        let animQueue = [];
        let animProgress = 0;
        let canInteract = true;

        // ========== 棋盘 ==========

        function createBoard() {
            grid = [];
            for (let r = 0; r < ROWS; r++) {
                grid[r] = [];
                for (let c = 0; c < COLS; c++) {
                    let type;
                    do {
                        type = Math.floor(Math.random() * TILE_TYPES);
                    } while (wouldMatch(r, c, type));
                    grid[r][c] = type;
                }
            }
            // 确保有可用移动
            if (!hasValidMoves()) createBoard();
        }

        function wouldMatch(row, col, type) {
            if (col >= 2 && grid[row][col - 1] === type && grid[row][col - 2] === type) return true;
            if (row >= 2 && grid[row - 1][col] === type && grid[row - 2][col] === type) return true;
            return false;
        }

        // ========== 匹配检测 ==========

        function findMatches() {
            const matched = new Set();
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS - 2; c++) {
                    const t = grid[r][c];
                    if (t >= 0 && t === grid[r][c + 1] && t === grid[r][c + 2]) {
                        let end = c + 2;
                        while (end + 1 < COLS && grid[r][end + 1] === t) end++;
                        for (let cc = c; cc <= end; cc++) matched.add(`${r},${cc}`);
                        c = end;
                    }
                }
            }
            for (let c = 0; c < COLS; c++) {
                for (let r = 0; r < ROWS - 2; r++) {
                    const t = grid[r][c];
                    if (t >= 0 && t === grid[r + 1][c] && t === grid[r + 2][c]) {
                        let end = r + 2;
                        while (end + 1 < ROWS && grid[end + 1][c] === t) end++;
                        for (let rr = r; rr <= end; rr++) matched.add(`${rr},${c}`);
                        r = end;
                    }
                }
            }
            return [...matched].map(s => {
                const [r, c] = s.split(',').map(Number);
                return { row: r, col: c };
            });
        }

        // ========== 重力 & 填充 ==========

        function applyGravity() {
            const newTiles = [];
            for (let c = 0; c < COLS; c++) {
                let writeRow = ROWS - 1;
                for (let r = ROWS - 1; r >= 0; r--) {
                    if (grid[r][c] >= 0) {
                        if (writeRow !== r) {
                            grid[writeRow][c] = grid[r][c];
                            grid[r][c] = -1;
                        }
                        writeRow--;
                    }
                }
                for (let r = writeRow; r >= 0; r--) {
                    grid[r][c] = Math.floor(Math.random() * TILE_TYPES);
                    newTiles.push({ row: r, col: c });
                }
            }
            return newTiles;
        }

        // ========== 消消乐核心逻辑 ==========

        function processMatches(isCascade = false) {
            if (!isCascade) combo = 0;
            canInteract = false;

            function step() {
                const matches = findMatches();
                if (matches.length === 0) {
                    if (!hasValidMoves()) {
                        showGameOver();
                        return;
                    }
                    canInteract = true;
                    return;
                }

                combo++;
                if (combo > 1) {
                    comboEl.textContent = `🔥 ${combo}连消!`;
                    comboEl.style.color = combo >= 3 ? '#ef4444' : '#fcd34d';
                }

                // 消除匹配的方块并加分
                for (const m of matches) {
                    grid[m.row][m.col] = -1;
                }
                const matchCount = matches.length;
                const bonus = combo >= 2 ? Math.floor(combo * 1.5) : 1;
                score += matchCount * 10 * bonus;
                scoreEl.textContent = score;

                applyGravity();
                draw();

                // 延迟后检测新的匹配（级联消除）
                setTimeout(step, 300);
            }

            step();
        }

        // ========== 交换逻辑 ==========

        function trySwap(r1, c1, r2, c2) {
            if (!canInteract) return;

            // 交换
            [grid[r1][c1], grid[r2][c2]] = [grid[r2][c2], grid[r1][c1]];

            const matches = findMatches();
            if (matches.length === 0) {
                // 无效交换，换回来
                [grid[r1][c1], grid[r2][c2]] = [grid[r2][c2], grid[r1][c1]];
                draw();
                shakeAnimation(r1, c1, r2, c2);
                return;
            }

            selected = null;
            combo = 0;
            comboEl.textContent = '';
            processMatches();
        }

        function shakeAnimation(r1, c1, r2, c2) {
            // 简单的视觉反馈：画X标记
            ctx.save();
            const x1 = GRID_LEFT + c1 * TILE_SIZE;
            const y1 = GRID_TOP + r1 * TILE_SIZE;
            const x2 = GRID_LEFT + c2 * TILE_SIZE;
            const y2 = GRID_TOP + r2 * TILE_SIZE;

            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x1 + 4, y1 + 4); ctx.lineTo(x1 + TILE_SIZE - 4, y1 + TILE_SIZE - 4);
            ctx.moveTo(x1 + TILE_SIZE - 4, y1 + 4); ctx.lineTo(x1 + 4, y1 + TILE_SIZE - 4);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x2 + 4, y2 + 4); ctx.lineTo(x2 + TILE_SIZE - 4, y2 + TILE_SIZE - 4);
            ctx.moveTo(x2 + TILE_SIZE - 4, y2 + 4); ctx.lineTo(x2 + 4, y2 + TILE_SIZE - 4);
            ctx.stroke();
            ctx.restore();

            setTimeout(() => { draw(); }, 300);
        }

        // ========== 可用移动检测 ==========

        function hasValidMoves() {
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    // 向右交换
                    if (c + 1 < COLS) {
                        [grid[r][c], grid[r][c + 1]] = [grid[r][c + 1], grid[r][c]];
                        if (findMatches().length > 0) {
                            [grid[r][c], grid[r][c + 1]] = [grid[r][c + 1], grid[r][c]];
                            return true;
                        }
                        [grid[r][c], grid[r][c + 1]] = [grid[r][c + 1], grid[r][c]];
                    }
                    // 向下交换
                    if (r + 1 < ROWS) {
                        [grid[r][c], grid[r + 1][c]] = [grid[r + 1][c], grid[r][c]];
                        if (findMatches().length > 0) {
                            [grid[r][c], grid[r + 1][c]] = [grid[r + 1][c], grid[r][c]];
                            return true;
                        }
                        [grid[r][c], grid[r + 1][c]] = [grid[r + 1][c], grid[r][c]];
                    }
                }
            }
            return false;
        }

        // ========== 交互 ==========

        function getTileFromClick(clientX, clientY) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const mx = (clientX - rect.left) * scaleX;
            const my = (clientY - rect.top) * scaleY;

            const col = Math.floor((mx - GRID_LEFT) / TILE_SIZE);
            const row = Math.floor((my - GRID_TOP) / TILE_SIZE);
            if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return null;
            if (grid[row][col] < 0) return null;
            return { row, col };
        }

        function isAdjacent(a, b) {
            return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
        }

        canvas.addEventListener('click', (e) => {
            if (!canInteract) return;
            const tile = getTileFromClick(e.clientX, e.clientY);
            if (!tile) return;

            if (!selected) {
                selected = tile;
                draw();
                return;
            }

            if (selected.row === tile.row && selected.col === tile.col) {
                selected = null;
                draw();
                return;
            }

            if (isAdjacent(selected, tile)) {
                trySwap(selected.row, selected.col, tile.row, tile.col);
            } else {
                selected = tile;
                draw();
            }
        });

        // ========== 游戏结束 ==========

        function showGameOver() {
            overlay.style.display = 'flex';
            document.getElementById('msg-title').textContent = '🎉 游戏结束！';
            document.getElementById('msg-desc').textContent = `最终得分: ${score}`;
            document.getElementById('msg-btn').onclick = () => {
                overlay.style.display = 'none';
                initGame();
            };
            // 保存最高分
            const hs = parseInt(localStorage.getItem('breakoutHighScore') || '0');
            if (score > hs) {
                if (typeof window._syncScore === 'function') _syncScore('breakout', score);
                document.getElementById('msg-title').textContent = '🏆 新纪录！';
            }
        }

        // ========== 绘制 ==========

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 背景装饰
            const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            grad.addColorStop(0, '#1a1028');
            grad.addColorStop(1, '#0f0a1a');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 网格背景
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    const x = GRID_LEFT + c * TILE_SIZE;
                    const y = GRID_TOP + r * TILE_SIZE;
                    ctx.fillStyle = 'rgba(255,255,255,0.04)';
                    roundRect(ctx, x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2, 6);
                    ctx.fill();
                }
            }

            // 方块
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    const type = grid[r][c];
                    if (type < 0) continue;
                    const x = GRID_LEFT + c * TILE_SIZE;
                    const y = GRID_TOP + r * TILE_SIZE;
                    const isSelected = selected && selected.row === r && selected.col === c;

                    // 选中高亮
                    if (isSelected) {
                        ctx.shadowColor = '#fcd34d';
                        ctx.shadowBlur = 18;
                    }

                    // 宝石背景
                    const color = COLORS[type % COLORS.length];
                    const grad2 = ctx.createRadialGradient(x + 10, y + 10, 2, x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE / 2);
                    grad2.addColorStop(0, lightenColor(color, 40));
                    grad2.addColorStop(1, color);
                    ctx.fillStyle = grad2;
                    roundRect(ctx, x + PADDING, y + PADDING, TILE_SIZE - PADDING * 2, TILE_SIZE - PADDING * 2, RADIUS);
                    ctx.fill();

                    ctx.shadowBlur = 0;

                    // 高光
                    ctx.fillStyle = 'rgba(255,255,255,0.2)';
                    roundRect(ctx, x + PADDING + 4, y + PADDING + 3, TILE_SIZE - PADDING * 2 - 8, (TILE_SIZE - PADDING * 2) / 3, 4);
                    ctx.fill();

                    // Emoji
                    ctx.font = '26px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(EMOJIS[type % EMOJIS.length], x + TILE_SIZE / 2, y + TILE_SIZE / 2 + 1);

                    // 选中边框
                    if (isSelected) {
                        ctx.strokeStyle = '#fcd34d';
                        ctx.lineWidth = 2.5;
                        roundRect(ctx, x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4, RADIUS + 1);
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    }
                }
            }

            // 剩余步数提示（显示是否有可用移动）
            const validMoves = hasValidMoves();
            ctx.font = '13px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = validMoves ? 'rgba(148,163,184,0.6)' : 'rgba(239,68,68,0.6)';
            ctx.fillText(validMoves ? '还有可消除的组合 ✓' : '没有可消除的组合 ✗', canvas.width / 2, GRID_TOP + ROWS * TILE_SIZE + 12);
        }

        function roundRect(ctx, x, y, w, h, r) {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
        }

        function lightenColor(hex, amt) {
            let c = parseInt(hex.slice(1), 16);
            let r = Math.min(255, (c >> 16) + amt);
            let g = Math.min(255, ((c >> 8) & 0xff) + amt);
            let b = Math.min(255, (c & 0xff) + amt);
            return `rgb(${r},${g},${b})`;
        }

        // ========== 初始化 ==========

        function initGame() {
            score = 0;
            combo = 0;
            selected = null;
            canInteract = true;
            comboEl.textContent = '';
            scoreEl.textContent = '0';
            createBoard();
            draw();
        }

        initGame();

        // ========== 键盘快捷键 ==========
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyR') initGame();
        });
    

try {
    const _user = localStorage.getItem('arcadeUser');
    if (_user) {
        window._syncScore = function(game, score) {
            try {
                const all = JSON.parse(localStorage.getItem('arcadeProfiles') || '{}');
                if (!all[_user]) all[_user] = {};
                if (!all[_user][game] || score > all[_user][game]) {
                    all[_user][game] = score;
                    localStorage.setItem('arcadeProfiles', JSON.stringify(all));
                }
            } catch(e){}
        };
    }
} catch(e){}


(function(){
var GK='breakout';
window.toggleComments=function(){var p=document.getElementById('cmtPanel');p.classList.toggle('open');if(p.classList.contains('open'))loadComments();};
function gc(){try{return JSON.parse(localStorage.getItem('arcadeComments')||'{}')}catch(e){return{}}}
function sc(c){localStorage.setItem('arcadeComments',JSON.stringify(c))}
window.addComment=function(){var t=document.getElementById('cmtInput').value.trim();if(!t)return;var u=localStorage.getItem('arcadeUser')||'匿名玩家';var c=gc();if(!c[GK])c[GK]=[];c[GK].push({user:u,text:t,time:Date.now()});sc(c);if(typeof CloudSync!=='undefined')CloudSync.addComment(GK,u,t);document.getElementById('cmtInput').value='';loadComments()};
window.loadComments=function(){var c=gc();var l=c[GK]||[];var h='';if(l.length===0){h='<div class="cmt-empty">还没有评论，来说两句吧</div>'}else{for(var i=l.length-1;i>=0;i--){var o=l[i];var d=new Date(o.time);var ts=d.toLocaleDateString('zh-CN')+' '+d.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});h+='<div class="cmt-item"><div class="avatar">'+o.user[0]+'</div><div class="body"><span class="uname">'+o.user+'</span> <span class="time">'+ts+'</span><div class="text">'+o.text+'</div></div></div>'}}document.getElementById('cmtList').innerHTML=h;var b=document.getElementById('cmtBadge');b.textContent=l.length;b.style.display=l.length>0?'flex':'none'};
var ic=gc();var il=ic[GK]||[];if(il.length>0){var b=document.getElementById('cmtBadge');b.textContent=il.length;b.style.display='flex'}
})();
</script>

<style scoped>
* { box-sizing: border-box; }
        body {
            margin: 0; min-height: 100vh;
            background: radial-gradient(circle at 30% 20%, #1e1b4b, #0f0c1a);
            color: #f8fafc; font-family: 'Segoe UI', sans-serif;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            overflow: hidden;
        }

        .game-header {
            display: flex; justify-content: space-between; align-items: center;
            width: 540px; padding: 12px 20px; margin-bottom: 16px;
            background: rgba(255,255,255,0.05); backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.1); border-radius: 16px;
        }
        .game-header h1 {
            margin: 0; font-size: 1.3rem;
            background: linear-gradient(135deg, #fcd34d, #f472b6);
            -webkit-background-clip: text; color: transparent;
        }
        .header-stat { font-weight: bold; font-size: 1.1rem; color: #fcd34d; }

        .canvas-container {
            position: relative;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08);
            overflow: hidden;
        }
        canvas { display: block; cursor: pointer; background: #0f0a1a; }

        .controls {
            margin-top: 16px; display: flex; gap: 14px; align-items: center;
        }
        button {
            padding: 10px 22px; font-size: 0.95rem; font-weight: bold;
            background: linear-gradient(135deg, #fcd34d, #f59e0b); color: #000;
            border: none; border-radius: 10px; cursor: pointer; transition: 0.2s;
        }
        button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(245,158,11,0.4); }
        .btn-back { background: #475569; color: white; }
        .btn-back:hover { background: #64748b; box-shadow: none; }

        .hint-text { color: #64748b; font-size: 0.85rem; }

        .rules {
            margin-top: 10px; display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;
            padding: 10px 20px;
            background: rgba(255,255,255,0.03);
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.06);
            max-width: 540px;
        }
        .rules span {
            color: #94a3b8; font-size: 0.82rem;
        }
        .rules strong { color: #fcd34d; }

        .overlay {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(15, 10, 26, 0.92); backdrop-filter: blur(6px);
            display: none; flex-direction: column; justify-content: center; align-items: center;
            z-index: 10;
        }
        .overlay h2 { font-size: 2.4rem; margin-bottom: 8px; }
        .overlay p { color: #94a3b8; margin-bottom: 20px; font-size: 1.1rem; }
</style>
