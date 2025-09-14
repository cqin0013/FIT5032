<script setup>
import { ref, onMounted, computed } from "vue";
import { ref as dbRef, set, get } from "firebase/database";
import { auth, db } from "../firebase";

const props = defineProps({ itemId: { type: String, required: true } });

const myScore = ref(0);
const scores = ref({}); // { uid: score }

const avg = computed(() => {
  const vals = Object.values(scores.value).map(Number);
  if (!vals.length) return "—";
  const m = vals.reduce((a, b) => a + b, 0) / vals.length;
  return `${m.toFixed(1)} / 5（${vals.length} 人）`;
});

const setScore = async (n) => {
  const user = auth.currentUser;
  if (!user) return alert("Login first");
  myScore.value = n;
  await set(dbRef(db, `ratings/${props.itemId}/${user.uid}`), n);
  await loadScores();
};

const loadScores = async () => {
  const snap = await get(dbRef(db, `ratings/${props.itemId}`));
  scores.value = snap.exists() ? snap.val() : {};
};

onMounted(loadScores);
</script>

<template>
  <div>
    <div>
      <button v-for="n in 5" :key="n" @click="setScore(n)">{{ n <= myScore ? "★" : "☆" }}</button>
    </div>
    <div style="margin-top:8px;">AVERAGE：{{ avg }}</div>
  </div>
</template>
