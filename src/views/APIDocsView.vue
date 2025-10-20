<script setup>
import { ref } from "vue";

const BASE = import.meta.env.VITE_PUBLIC_API_BASE || "";
const res1 = ref(""), res2 = ref(""), err1 = ref(""), err2 = ref("");

async function tryResources() {
  err1.value = ""; res1.value = "Loading…";
  try {
    const r = await fetch(`${BASE}/api/resources`);
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    res1.value = JSON.stringify(await r.json(), null, 2);
  } catch (e) { err1.value = String(e); res1.value = ""; }
}
async function tryCount() {
  err2.value = ""; res2.value = "Loading…";
  try {
    const r = await fetch(`${BASE}/api/resources/count`);
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    res2.value = JSON.stringify(await r.json(), null, 2);
  } catch (e) { err2.value = String(e); res2.value = ""; }
}
</script>

<template>
  <section class="wrap card">
    <h2>Public API</h2>
    <p class="muted">Third parties can fetch public data via REST endpoints.</p>

    <div class="blk">
      <code>GET {{ BASE }}/api/resources</code>
      <button class="btn" @click="tryResources">Try it</button>
      <pre v-if="err1" class="err">{{ err1 }}</pre>
      <pre v-else-if="res1">{{ res1 }}</pre>
    </div>

    <div class="blk">
      <code>GET {{ BASE }}/api/resources/count</code>
      <button class="btn" @click="tryCount">Try it</button>
      <pre v-if="err2" class="err">{{ err2 }}</pre>
      <pre v-else-if="res2">{{ res2 }}</pre>
    </div>
  </section>
</template>

<style scoped>
.wrap { max-width: 980px; margin: 0 auto; }
.card { background:#fff; border-radius:16px; box-shadow:0 8px 28px rgba(0,0,0,.06); padding:20px; margin:18px 0; }
.muted { color:#666; }
.blk { margin:14px 0; }
code { display:block; background:#0b1020; color:#e9f1ff; padding:.6rem; border-radius:8px; }
pre { background:#0b1020; color:#e9f1ff; padding:.6rem; border-radius:8px; overflow:auto; }
.err { color:#ffb4b4; }
.btn { margin:.5rem 0; padding:.4rem .9rem; border-radius:999px; border:1px solid #d7d7d7; background:#fafafa; cursor:pointer; }
</style>
