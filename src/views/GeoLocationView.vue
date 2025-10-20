<template>
  <div class="container">
    <h1 class="text-lg font-semibold mb-2">Find Youth Mental Health Support</h1>
    <p class="text-sm" style="color:var(--ymh-muted); margin-bottom:12px;">
      Uses your location to list nearby youth mental-health services, sorted by distance.
    </p>

    <div
      id="map"
      class="map card"
      role="img"
      aria-label="Map with your current location and nearby youth mental-health services"
    ></div>

    <label class="sr-only" for="filter">Filter services</label>
    <input
      id="filter"
      v-model.trim="q"
      placeholder="Filter by name…"
      class="border rounded px-2 py-1 mb-2"
      aria-describedby="filter-help"
    />
    <p id="filter-help" class="text-xs" style="color:var(--ymh-muted); margin-top:-6px;">Type to filter by service name or city.</p>

    <ol v-if="sortedStores.length">
      <li v-for="(s, i) in sortedStores" :key="s.name + i" class="py-1">
        <strong>{{ s.name }}</strong> — {{ s.city }}
        <span v-if="s.distKm!=null"> ({{ s.distKm.toFixed(2) }} km)</span>
        <a
          class="ms-2"
          :href="`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.lat+','+s.lng)}`"
          target="_blank" rel="noopener noreferrer"
        >
          Directions
        </a>
      </li>
    </ol>
    <p v-else class="text-sm" style="color:var(--ymh-muted);">No services match your filter.</p>
  </div>
</template>

<script setup>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ref, computed, onMounted, watch } from "vue";

/** 兼容两种 JSON 结构：纯数组 或 { stores: [...] } */
import raw from "../assets/json/bookstores.json";
const ALL_STORES = Array.isArray(raw) ? raw : (Array.isArray(raw?.stores) ? raw.stores : []);

/** 搜索关键字 / 当前位置 */
const q  = ref("");
const me = ref(null); // { lat, lng }

/** 地图与标注句柄 */
let map;
let meMarker;
let storeMarkers = [];

/** Haversine 距离（公里） */
function toRad(v){ return v * Math.PI/180; }
function haversineKm(lat1,lon1,lat2,lon2){
  const R=6371, dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}

/** 计算距离、过滤、排序 */
const withDist = computed(() =>
  (Array.isArray(ALL_STORES) ? ALL_STORES : []).map((s) => {
    if (!me.value) return { ...s, distKm: null };
    const d = haversineKm(me.value.lat, me.value.lng, s.lat, s.lng);
    return { ...s, distKm: d };
  })
);

const filtered = computed(() => {
  const needle = q.value.toLowerCase();
  if (!needle) return withDist.value;
  return withDist.value.filter(
    (s) =>
      String(s.name || "").toLowerCase().includes(needle) ||
      String(s.city || "").toLowerCase().includes(needle)
  );
});

const sortedStores = computed(() =>
  [...filtered.value].sort(
    (a, b) => (a.distKm ?? Number.POSITIVE_INFINITY) - (b.distKm ?? Number.POSITIVE_INFINITY)
  )
);

/** 根据当前列表渲染地图标注 */
function renderStoreMarkers(list) {
  if (!map) return;
  // 清理旧标注
  storeMarkers.forEach((m) => m.remove());
  storeMarkers = [];
  // 添加新标注
  (list || []).forEach((s) => {
    const m = L.marker([s.lat, s.lng], { title: s.name }).addTo(map);
    m.bindPopup(`<b>${s.name}</b><br>${s.city}`);
    storeMarkers.push(m);
  });
}

/** 初始化地图 & 获取位置 */
onMounted(() => {
  // 默认墨尔本（未授权定位也可用）
  map = L.map("map").setView([-37.8136, 144.9631], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map);

  // 在 flex/grid 容器里，初始化后强制一次尺寸计算，避免“空白”
  setTimeout(() => map && map.invalidateSize(true), 0);

  const onReady = () => renderStoreMarkers(sortedStores.value);

  // ❌ 原来写的是 navigator.Geolocation（大写 G）——错误
  // ✅ 正确写法：navigator.geolocation（小写 g）
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        me.value = { lat: latitude, lng: longitude };
        map.setView([latitude, longitude], 14);
        meMarker = L.marker([latitude, longitude], { title: "You are here" }).addTo(map);
        onReady();
      },
      // 拒绝或失败：继续显示默认城市 & 列表
      () => { me.value = null; onReady(); },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
    );
  } else {
    me.value = null; onReady();
  }
});

/** 当过滤/排序结果变化时，更新标注 */
watch(sortedStores, (list) => renderStoreMarkers(list));
</script>

<style scoped>
.map {
  height: 450px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 12px;
}
.sr-only {
  position: absolute;
  width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
}
.border { border:1px solid var(--vt-c-divider-light-1); }
.rounded { border-radius: 10px; }
.px-2 { padding-left:.5rem; padding-right:.5rem; }
.py-1 { padding-top:.25rem; padding-bottom:.25rem; }
.mb-2 { margin-bottom:.5rem; }
.text-xs { font-size: .82rem; }
.ms-2 { margin-left:.5rem; }
</style>
