/**
 * CloudSync — CloudBase 直连数据库同步模块
 * 所有数据优先读写 CloudBase，localStorage 作为离线缓存
 */
(function () {
  'use strict';

  const ENV_ID = 'games-d3g5ler2z3252069c';
  let app = null, db = null, _ = null;
  let ready = false;
  let readyPromise = null;

  // ====================== 初始化 ======================
  function init() {
    if (readyPromise) return readyPromise;
    readyPromise = new Promise((resolve) => {
      if (typeof cloudbase === 'undefined') {
        console.warn('[CloudSync] CloudBase SDK 未加载，使用 localStorage 模式');
        resolve(false);
        return;
      }
      try {
        app = cloudbase.init({ env: ENV_ID });
        db = app.database();
        _ = db.command;
        app.auth().signInAnonymously()
          .then(() => {
            ready = true;
            console.log('[CloudSync] CloudBase 直连已就绪');
            resolve(true);
          })
          .catch((e) => {
            console.warn('[CloudSync] 匿名登录失败，使用 localStorage 模式', e.message);
            resolve(false);
          });
      } catch (e) {
        console.warn('[CloudSync] 初始化失败，使用 localStorage 模式', e.message);
        resolve(false);
      }
    });
    return readyPromise;
  }

  function ensureReady() { return ready && db && _; }

  // ====================== 用户档案 ======================
  async function saveProfile(username, scores, favorites, theme) {
    // 始终保存到 localStorage
    try {
      const all = JSON.parse(localStorage.getItem('arcadeProfiles') || '{}');
      all[username] = scores || {};
      localStorage.setItem('arcadeProfiles', JSON.stringify(all));
      if (favorites !== undefined) localStorage.setItem('arcadeFavorites', JSON.stringify(favorites));
      if (theme !== undefined) localStorage.setItem('arcadeTheme', theme);
    } catch (e) { /* ignore */ }

    // 直连写入 CloudBase
    if (!ensureReady()) return;
    try {
      const doc = { scores: scores || {}, favorites: favorites || [], theme: theme || 'neon', updatedAt: Date.now() };
      const { data } = await db.collection('user_data').doc(username).get();
      if (data && data[0]) {
        await db.collection('user_data').doc(username).update(doc);
      } else {
        await db.collection('user_data').doc(username).set({ ...doc, createdAt: Date.now() });
      }
    } catch (e) {
      console.warn('[CloudSync] 档案写入云端失败:', e.message);
    }
  }

  async function loadAllProfiles() {
    if (!ensureReady()) {
      try { return JSON.parse(localStorage.getItem('arcadeProfiles') || '{}'); } catch (e) { return {}; }
    }
    try {
      const { data } = await db.collection('user_data').limit(200).get();
      const profiles = {};
      (data || []).forEach(p => { profiles[p._id] = p.scores || {}; });
      if (Object.keys(profiles).length > 0) {
        localStorage.setItem('arcadeProfiles', JSON.stringify(profiles));
        return profiles;
      }
    } catch (e) {
      console.warn('[CloudSync] 云端档案加载失败:', e.message);
    }
    try { return JSON.parse(localStorage.getItem('arcadeProfiles') || '{}'); } catch (e) { return {}; }
  }

  async function deleteProfile(username) {
    try {
      const all = JSON.parse(localStorage.getItem('arcadeProfiles') || '{}');
      delete all[username];
      localStorage.setItem('arcadeProfiles', JSON.stringify(all));
    } catch (e) { /* ignore */ }

    if (!ensureReady()) return;
    try {
      await db.collection('user_data').doc(username).remove();
    } catch (e) {
      console.warn('[CloudSync] 删除云端档案失败:', e.message);
    }
  }

  // ====================== 评论 ======================
  async function addComment(gameKey, user, text) {
    try {
      const comments = JSON.parse(localStorage.getItem('arcadeComments') || '{}');
      if (!comments[gameKey]) comments[gameKey] = [];
      comments[gameKey].push({ user, text, time: Date.now() });
      localStorage.setItem('arcadeComments', JSON.stringify(comments));
    } catch (e) { /* ignore */ }

    if (!ensureReady()) return;
    try {
      await db.collection('comments').add({ gameKey, user, text, time: Date.now() });
    } catch (e) {
      console.warn('[CloudSync] 评论写入云端失败:', e.message);
    }
  }

  async function loadComments(gameKey) {
    if (!ensureReady()) {
      try {
        const all = JSON.parse(localStorage.getItem('arcadeComments') || '{}');
        return gameKey ? (all[gameKey] || []) : all;
      } catch (e) { return gameKey ? [] : {}; }
    }
    try {
      let query = db.collection('comments');
      if (gameKey) query = query.where({ gameKey });
      const { data } = await query.orderBy('time', 'desc').limit(200).get();
      const comments = data || [];
      const grouped = {};
      comments.forEach(c => {
        if (!grouped[c.gameKey]) grouped[c.gameKey] = [];
        grouped[c.gameKey].push({ user: c.user, text: c.text, time: c.time, _id: c._id });
      });
      localStorage.setItem('arcadeComments', JSON.stringify(grouped));
      if (gameKey) return grouped[gameKey] || [];
      return grouped;
    } catch (e) {
      console.warn('[CloudSync] 云端评论加载失败:', e.message);
    }
    try {
      const all = JSON.parse(localStorage.getItem('arcadeComments') || '{}');
      return gameKey ? (all[gameKey] || []) : all;
    } catch (e) { return gameKey ? [] : {}; }
  }

  async function deleteComment(commentId, gameKey) {
    try {
      const comments = JSON.parse(localStorage.getItem('arcadeComments') || '{}');
      if (comments[gameKey]) {
        comments[gameKey] = comments[gameKey].filter(c => c._id !== commentId);
        localStorage.setItem('arcadeComments', JSON.stringify(comments));
      }
    } catch (e) { /* ignore */ }

    if (!ensureReady()) return;
    try {
      await db.collection('comments').doc(commentId).remove();
    } catch (e) {
      console.warn('[CloudSync] 删除云端评论失败:', e.message);
    }
  }

  // ====================== 游玩统计 ======================
  async function incrementPlayCount(gameKey) {
    try {
      const counts = JSON.parse(localStorage.getItem('arcadePlayCounts') || '{}');
      counts[gameKey] = (counts[gameKey] || 0) + 1;
      localStorage.setItem('arcadePlayCounts', JSON.stringify(counts));
    } catch (e) { /* ignore */ }

    if (!ensureReady()) return;
    try {
      const { data } = await db.collection('play_counts').doc(gameKey).get();
      if (data && data[0]) {
        await db.collection('play_counts').doc(gameKey).update({ count: _.inc(1) });
      } else {
        await db.collection('play_counts').doc(gameKey).set({ count: 1 });
      }
    } catch (e) {
      console.warn('[CloudSync] 统计写入云端失败:', e.message);
    }
  }

  async function loadPlayCounts() {
    if (!ensureReady()) {
      try { return JSON.parse(localStorage.getItem('arcadePlayCounts') || '{}'); } catch (e) { return {}; }
    }
    try {
      const { data } = await db.collection('play_counts').get();
      const counts = {};
      (data || []).forEach(s => { counts[s._id] = s.count || 0; });
      if (Object.keys(counts).length > 0) {
        localStorage.setItem('arcadePlayCounts', JSON.stringify(counts));
        return counts;
      }
    } catch (e) {
      console.warn('[CloudSync] 云端统计加载失败:', e.message);
    }
    try { return JSON.parse(localStorage.getItem('arcadePlayCounts') || '{}'); } catch (e) { return {}; }
  }

  // ====================== 导出 ======================
  window.CloudSync = {
    init,
    saveProfile,
    loadAllProfiles,
    deleteProfile,
    addComment,
    loadComments,
    deleteComment,
    incrementPlayCount,
    loadPlayCounts
  };

  init();
})();
