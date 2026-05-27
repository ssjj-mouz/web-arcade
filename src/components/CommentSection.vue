<template>
  <div class="comments-section">
    <div class="cmt-title">💬 玩家评论 ({{ list.length }})</div>
    <div class="comment-list">
      <div v-if="list.length === 0" class="cmt-empty">暂无评论，来说两句吧</div>
      <div v-for="(c, i) in list" :key="i" class="comment-item">
        <div class="cmt-avatar">{{ (c.user || '匿')[0] }}</div>
        <div class="cmt-body">
          <span class="cmt-user">{{ c.user }}</span>
          <span class="cmt-time">{{ formatTime(c.time) }}</span>
          <div class="cmt-text">{{ c.text }}</div>
        </div>
        <button class="cmt-del" :title="canDelete(c, i) ? '删除' : ''" @click="canDelete(c, i) && doDelete(c, i)">{{ canDelete(c, i) ? '✕' : '' }}</button>
      </div>
    </div>
    <div class="cmt-input-row">
      <input
        v-model="text"
        :placeholder="`写下你对 ${gameName} 的评价...`"
        maxlength="200"
        @keydown.enter="send"
      />
      <button @click="send">发送</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGamesStore } from '../stores/games.js'
import { useUserStore } from '../stores/user.js'

const props = defineProps({
  gameKey: String,
  admin: { type: Boolean, default: false }
})

const gamesStore = useGamesStore()
const userStore = useUserStore()
const text = ref('')

const list = computed(() => gamesStore.commentsFor(props.gameKey))
const gameName = computed(() => gamesStore.getGame(props.gameKey)?.name || '')

function formatTime(t) {
  const d = new Date(t)
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function canDelete(c, i) {
  if (props.admin) return true
  return c.user === userStore.username
}

function doDelete(c, i) {
  const idx = typeof c._id === 'string' ? c._id : i
  gamesStore.deleteComment(props.gameKey, idx)
}

function send() {
  const v = text.value.trim()
  if (!v) return
  const name = userStore.username || '匿名'
  gamesStore.addComment(props.gameKey, name, v)
  text.value = ''
}
</script>
