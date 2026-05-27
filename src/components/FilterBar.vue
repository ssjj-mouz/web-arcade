<template>
  <div class="filter-bar">
    <div class="filter-inner">
      <input
        v-model="search"
        type="text"
        class="filter-search"
        placeholder="搜索游戏..."
        @input="$emit('update:search', search)"
      />
      <span class="filter-count" v-if="count !== null">{{ count }} 款游戏</span>
      <div class="filter-tags">
        <button
          v-for="cat in categories"
          :key="cat"
          :class="['filter-tag', { active: active === cat }]"
          @click="$emit('filter', cat); active = cat"
        >{{ cat }}</button>
        <button :class="['filter-tag', { active: active === 'all' }]" @click="$emit('filter', 'all'); active = 'all'">全部</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  categories: { type: Array, default: () => [] },
  count: { type: Number, default: null }
})

defineEmits(['update:search', 'filter'])

const search = ref('')
const active = ref('all')
</script>
