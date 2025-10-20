<template>
  <div class="container">
    <div class="card">
      <header class="bar">
        <h2>Site Analytics</h2>
        <div class="tools">
          <label class="fld">
            <span>Range</span>
            <select v-model.number="days">
              <option :value="7">Last 7 days</option>
              <option :value="30">Last 30 days</option>
              <option :value="90">Last 90 days</option>
            </select>
          </label>
          <button class="btn btn-ghost" @click="load">Reload</button>
        </div>
      </header>

      <div class="muted">Bar chart shows number of resources added per day (Firestore “books”). Hover bars for details.</div>

      <div class="chart-wrap" @mouseleave="hover=null">
        <svg :viewBox="`0 0 ${W} ${H}`" role="img" aria-label="Resources per day chart">
          <!-- axes -->
          <line :x1="M" :y1="H-M" :x2="W-M" :y2="H-M" stroke="#e5e7eb"/>
          <line :x1="M" :y1="M"   :x2="M"   :y2="H-M" stroke="#e5e7eb"/>

          <!-- ticks -->
          <template v-for="(tick,i) in yTicks" :key="i">
            <line :x1="M-4" :y1="tick.y" :x2="M" :y2="tick.y" stroke="#e5e7eb"/>
            <text :x="M-8" :y="tick.y+4" text-anchor="end" class="tick">{{ tick.v }}</text>
          </template>

          <!-- bars -->
          <template v-for="(d,i) in bars" :key="i">
            <rect
              :x="d.x" :y="d.y" :width="d.w" :height="d.h"
              class="bar"
              @mouseenter="hover=d" />
          </template>

          <!-- hover tooltip line -->
          <line v-if="hover" :x1="hover.cx" :x2="hover.cx" :y1="M" :y2="H-M" stroke="#94a3b8" stroke-dasharray="3 3"/>

        </svg>

        <div v-if="hover" class="tip" :style="{ left: `${hover.cx}px`, top: `${M}px` }">
          <div class="tip-title">{{ hover.label }}</div>
          <div class="tip-row"><span>Added</span><strong>{{ hover.value }}</strong></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";

const days = ref(30);
const raw = ref([]); // {dateStr, count}

async function load() {
  const qy = query(collection(db, "books"), orderBy("createdAt", "asc"));
  const snap = await getDocs(qy);
  const rows = snap.docs
    .map(d => d.data())
    .filter(r => r?.createdAt?.seconds)
    .map(r => new Date(r.createdAt.seconds * 1000));
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - days.value + 1);

  // init bins
  const key = d => d.toISOString().slice(0,10);
  const bins = {};
  for (let d = new Date(start); d <= end; d.setDate(d.getDate()+1)) {
    bins[key(d)] = 0;
  }
  rows.forEach(dt => {
    const k = key(dt);
    if (k in bins) bins[k] += 1;
  });
  raw.value = Object.entries(bins).map(([k,v]) => ({ dateStr:k, count:v }));
}
onMounted(load);

/* ----- chart compute (pure SVG, zero依赖) ----- */
const W=760, H=340, M=40;
const maxY = computed(() => Math.max(5, ...raw.value.map(r=>r.count)));
const yTicks = computed(() => {
  const step = Math.max(1, Math.ceil(maxY.value/5));
  const ticks = [];
  for(let v=0; v<=maxY.value; v+=step){
    const y = M + (H-2*M) * (1 - v/maxY.value);
    ticks.push({v,y});
  }
  return ticks;
});
const bars = computed(() => {
  if (!raw.value.length) return [];
  const bw = (W-2*M)/raw.value.length;
  return raw.value.map((r,i) => {
    const h = (H-2*M) * (r.count/maxY.value);
    const x = M + i*bw + 2;
    const y = H-M - h;
    return {
      x, y, w: Math.max(2, bw-4), h: Math.max(0, h),
      cx: M + i*bw + bw/2, value: r.count, label: r.dateStr
    };
  });
});
const hover = ref(null);
</script>

<style scoped>
.card{ background: var(--ymh-surface); border:1px solid var(--vt-c-divider-light-1); border-radius:16px; padding:16px; box-shadow:0 4px 30px rgba(58,70,102,.08);}
.bar{ display:flex; justify-content:space-between; align-items:center; margin-bottom:.5rem;}
.tools{ display:flex; gap:.6rem; align-items:end;}
.fld{ display:flex; flex-direction:column; gap:.2rem;}
.muted{ color: var(--ymh-muted); margin-bottom:.4rem;}
.chart-wrap{ position:relative; overflow:auto; }
svg{ width:100%; height:auto; }
.bar{ fill: url(#g); }
rect.bar{ fill: #8ab4f8; opacity:.9; }
rect.bar:hover{ opacity:1; }
.tick{ fill:#94a3b8; font-size: 10px;}
.tip{ position:absolute; transform: translate(-50%, -8px); background:#111827; color:#fff; border-radius:8px; padding:.4rem .6rem; font-size:.85rem; pointer-events:none;}
.tip-title{ font-weight:700; margin-bottom:.2rem;}
.tip-row{ display:flex; gap:.6rem; align-items:center;}
</style>
