import { defineStore } from 'pinia'

export const useGamesStore = defineStore('games', {
  state: () => ({
    list: [
      { key: 'skyDefense', name: '天空防卫局', icon: '✈️', color: '#3b82f6', cat: '射击', badge: '🛡 射击 · 防御', desc: '操控星际战机，抵御外星入侵者。弹幕射击与策略搭配的经典空战', href: '/game/sky-defense', linkText: '出击 ▶' },
      { key: 'match', name: '深海寻宝', icon: '🐙', color: '#06b6d4', cat: '消除', badge: '🔄 消除 · 益智', desc: '潜入深海世界，匹配相同的海洋生物获取宝藏。简单易上手的消除游戏', href: '/game/match', linkText: '开始 ▶' },
      { key: 'tower', name: '云端筑梦师', icon: '🏗️', color: '#84cc16', cat: '塔防', badge: '🗼 塔防 · 策略', desc: '在云端建造防御塔，阻挡一波波敌人的进攻。考验策略与资源管理', href: '/game/tower', linkText: '开始 ▶' },
      { key: 'typist', name: '极客骇客', icon: '💻', color: '#ef4444', cat: '打字', badge: '⌨ 打字 · 极客', desc: '快速敲击键盘，破解代码防线。测试你的打字速度和准确率', href: '/game/typist', linkText: '开始 ▶' },
      { key: 'beats', name: '光音记忆', icon: '🎵', color: '#d946ef', cat: '音乐', badge: '🎵 音乐 · 节奏', desc: '跟随光影节奏，记忆并重现旋律序列。用视觉与听觉挑战记忆极限', href: '/game/beats', linkText: '开始 ▶' },
      { key: 'particle', name: '星海流沙', icon: '🌌', color: '#2c5364', cat: '沙盒', badge: '✨ 沙盒 · 粒子', desc: '在星海中创造流动的粒子奇观。自由拖拽，感受粒子物理的视觉魅力', href: '/game/particle', linkText: '开始 ▶' },
      { key: 'coop', name: '双子星探险', icon: '👯', color: '#3b82f6', cat: '双人', badge: '👥 联机 · 双子星探险', desc: '创建房间邀请好友，双人协作探索迷宫，收集水晶对抗敌人，实时联机冒险', href: '/game/coop', linkText: '创建房间 ▶' },
      { key: 'snake', name: '贪吃蛇', icon: '🐍', color: '#22c55e', cat: '经典', badge: '🕹 经典 · 贪吃蛇', desc: '经典贪吃蛇玩法，全屏网格战场。吃果实越长越大，挑战最高分！', href: '/game/snake', linkText: '开始游戏 ▶' },
      { key: 'breakout', name: '宝石消消乐', icon: '💎', color: '#a855f7', cat: '消除', badge: '🔄 消除 · 益智', desc: '经典弹球打砖块，消除所有宝石过关。多种道具助你一路通关', href: '/game/breakout', linkText: '开始 ▶' },
    ],
    comments: {},
    playCounts: {}
  }),

  getters: {
    getGame: (state) => (key) => state.list.find(g => g.key === key),
    playCount: (state) => (name) => state.playCounts[name] || 0,
    commentsFor: (state) => (key) => state.comments[key] || []
  },

  actions: {
    loadFromStorage() {
      try { this.comments = JSON.parse(localStorage.getItem('arcadeComments') || '{}') } catch {}
      try { this.playCounts = JSON.parse(localStorage.getItem('arcadePlayCounts') || '{}') } catch {}
    },
    saveComments() {
      localStorage.setItem('arcadeComments', JSON.stringify(this.comments))
    },
    addComment(gameKey, user, text) {
      if (!this.comments[gameKey]) this.comments[gameKey] = []
      const entry = { user, text, time: Date.now() }
      this.comments[gameKey].push(entry)
      this.saveComments()
      if (typeof CloudSync !== 'undefined') CloudSync.addComment(gameKey, user, text)
    },
    deleteComment(gameKey, indexOrId) {
      if (!this.comments[gameKey]) return
      const list = this.comments[gameKey]
      const item = list[indexOrId]
      if (item && item._id && typeof CloudSync !== 'undefined') {
        CloudSync.deleteComment(item._id, gameKey)
      }
      if (typeof indexOrId === 'number') list.splice(indexOrId, 1)
      else this.comments[gameKey] = list.filter(c => c._id !== indexOrId)
      this.saveComments()
    },
    incrementPlayCount(gameKey) {
      const name = this.getGame(gameKey)?.name
      if (!name) return
      if (!this.playCounts[name]) this.playCounts[name] = 0
      this.playCounts[name]++
      localStorage.setItem('arcadePlayCounts', JSON.stringify(this.playCounts))
      if (typeof CloudSync !== 'undefined') CloudSync.incrementPlayCount(gameKey)
    }
  }
})
