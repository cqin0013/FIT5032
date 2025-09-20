<!-- src/components/Rating.vue -->
<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { ref as dbRef, onValue, set } from 'firebase/database'
import { auth, rtdb } from '../firebase'

const props = defineProps({ itemId: { type: String, required: true } })

// 我当前的评分
const myScore = ref(0)
// 所有用户的评分 { uid: score }
const scores = ref({})

// 计算平均分
const avg = computed(() => {
  const vals = Object.values(scores.value).map(Number)
  if (!vals.length) return '—'
  const m = vals.reduce((a, b) => a + b, 0) / vals.length
  return `${m.toFixed(1)} / 5（${vals.length}人）`
})

// 评分
const setScore = async (n) => {
  const user = auth.currentUser
  if (!user) {
    alert('请先登录')
    return
  }
  await set(dbRef(rtdb, `ratings/${props.itemId}/${user.uid}`), n)
  myScore.value = n
}

let off = null
onMounted(() => {
  // 实时监听该条目的所有评分
  off = onValue(dbRef(rtdb, `ratings/${props.itemId}`), (snap) => {
    const data = snap.val() || {}
    scores.value = data
    const uid = auth.currentUser?.uid
    myScore.value = uid && data[uid] ? Number(data[uid]) : 0
  })
})

onBeforeUnmount(() => off && off())
</script>

<template>
  <div>
    <div>
      <button
        v-for="n in 5"
        :key="n"
        @click="setScore(n)"
        :aria-label="`rate ${n}`"
        title="点击评分"
      >
        {{ n <= myScore ? '★' : '☆' }}
      </button>
    </div>

    <div style="margin-top:8px;">average：{{ avg }}</div>
  </div>
</template>

<style scoped>
button {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: #999;
}
button:hover { transform: scale(1.05); }
</style>
