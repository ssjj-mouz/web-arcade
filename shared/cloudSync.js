/**
 * CloudSync — CloudBase 数据同步模块
 * 所有数据优先读写 CloudBase，localStorage 作为离线缓存
 */
(function () {
  'use strict';

  const ENV_ID = 'games-d3g5ler2z3252069c';
  let app = null;
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
        app.auth().signInAnonymously()
          .then(() => {
            ready = true;
            console.log('[CloudSync] CloudBase 已连接');
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

  async function callCF(action, data) {
    await init();
    if (!app || !ready) throw new Error('CloudBase 不可用');
    const res = await app.callFunction({ name: 'gameApi', data: { action, ...data } });
    if (!res || !res.result) throw new Error('响应为空');
    if (res.result.error) throw new Error(res.result.error);
    return res.result;
  }

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

    // 同步到 CloudBase
    try {
      await callCF('profile.save', { username, scores, favorites, theme });
    } catch (e) {
      console.warn('[CloudSync] 档案保存到云端失败:', e.message);
    }
  }

  async function loadAllProfiles() {
    try {
      const result = await callCF('profile.list');
      const profiles = {};
      (result.profiles || []).forEach(p => {
        profiles[p._id] = p.scores || {};
      });
      if (Object.keys(profiles).length > 0) {
        localStorage.setItem('arcadeProfiles', JSON.stringify(profiles));
        return profiles;
      }
    } catch (e) {
      console.warn('[CloudSync] 从云端加载档案失败:', e.message);
    }
    // Fallback to localStorage
    try { return JSON.parse(localStorage.getItem('arcadeProfiles') || '{}'); } catch (e) { return {}; }
  }

  async function deleteProfile(username) {
    try {
      const all = JSON.parse(localStorage.getItem('arcadeProfiles') || '{}');
      delete all[username];
      localStorage.setItem('arcadeProfiles', JSON.stringify(all));
    } catch (e) { /* ignore */ }

    try {
      await callCF('profile.delete', { username });
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

    try {
      await callCF('comment.add', { gameKey, user, text });
    } catch (e) {
      console.warn('[CloudSync] 评论同步到云端失败:', e.message);
    }
  }

  async function loadComments(gameKey) {
    try {
      const result = await callCF('comment.list', gameKey ? { gameKey } : {});
      const comments = result.comments || [];
      // Update localStorage cache
      const grouped = {};
      comments.forEach(c => {
        if (!grouped[c.gameKey]) grouped[c.gameKey] = [];
        grouped[c.gameKey].push({ user: c.user, text: c.text, time: c.time, _id: c._id });
      });
      // Don't replace entire localStorage, just this game's data
      if (comments.length > 0) {
        localStorage.setItem('arcadeComments', JSON.stringify(grouped));
      }
      if (gameKey) return grouped[gameKey] || [];
      return grouped;
    } catch (e) {
      console.warn('[CloudSync] 加载云端评论失败:', e.message);
    }
    // Fallback
    try {
      const all = JSON.parse(localStorage.getItem('arcadeComments') || '{}');
      if (gameKey) return all[gameKey] || [];
      return all;
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

    try {
      await callCF('comment.delete', { commentId });
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

    try {
      await callCF('stats.update', { gameKey });
    } catch (e) {
      console.warn('[CloudSync] 统计同步到云端失败:', e.message);
    }
  }

  async function loadPlayCounts() {
    try {
      const result = await callCF('stats.list');
      const counts = {};
      (result.stats || []).forEach(s => {
        counts[s._id] = s.count || 0;
      });
      if (Object.keys(counts).length > 0) {
        localStorage.setItem('arcadePlayCounts', JSON.stringify(counts));
        return counts;
      }
    } catch (e) {
      console.warn('[CloudSync] 加载云端统计失败:', e.message);
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

  // 自动初始化
  init();
})();
