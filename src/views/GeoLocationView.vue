<template>
  <div>
    <h1 class="text-lg font-semibold mb-2">Nearby Bookstores</h1>
    <p class="text-sm text-gray-600 mb-2">
      Uses browser Geolocation + Leaflet map. Shows distance and sorts by nearest.
    </p>

    <div
      id="map"
      class="map"
      role="img"
      aria-label="Map with your current location and nearby bookstores"
    ></div>

    <label class="sr-only" for="filter">Filter stores</label>
    <input
      id="filter"
      v-model.trim="q"
      placeholder="Filter by name…"
      class="border rounded px-2 py-1 mb-2"
    />

    <ol>
      <li v-for="s in sortedStores" :key="s.name" class="py-1">
        <strong>{{ s.name }}</strong> — {{ s.city }}
        <span v-if="s.distKm != null"> ({{ s.distKm.toFixed(2) }} km)</span>
        <a
          class="ms-2"
          :href="`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.lat+','+s.lng)}`"
          target="_blank"
          rel="noopener"
        >Directions</a>
      </li>
    </ol>
  </div>
</template>

<script setup>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ref, computed, onMounted, watch } from "vue";

// ✅ 兼容两种 JSON 结构：纯数组 或 { stores: [...] }
import raw from "../assets/json/bookstores.json";
const ALL_STORES = Array.isArray(raw) ? raw : (Array.isArray(raw?.stores) ? raw.stores : []);

// 搜索关键字 / 当前位置
const q = ref("");
const me = ref(null); // { lat, lng }

// 地图与标注
let map;
let meMarker;
let storeMarkers = [];

// --- 工具：两点距离（公里） ---
function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// 计算每个门店与我的距离（允许 null）
const withDist = computed(() =>
  (Array.isArray(ALL_STORES) ? ALL_STORES : []).map((s) => {
    if (!me.value) return { ...s, distKm: null };
    const d = haversineKm(me.value.lat, me.value.lng, s.lat, s.lng);
    return { ...s, distKm: d };
  })
);

// 关键字过滤
const filtered = computed(() => {
  const needle = q.value.toLowerCase();
  if (!needle) return withDist.value;
  return withDist.value.filter(
    (s) =>
      String(s.name || "").toLowerCase().includes(needle) ||
      String(s.city || "").toLowerCase().includes(needle)
  );
});

// 距离升序
const sortedStores = computed(() =>
  [...filtered.value].sort(
    (a, b) => (a.distKm ?? Number.POSITIVE_INFINITY) - (b.distKm ?? Number.POSITIVE_INFINITY)
  )
);

// 根据当前列表渲染地图标注
function renderStoreMarkers(list) {
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

// 初始化地图 & 获取位置
onMounted(() => {
  // 默认墨尔本，未授权定位亦可用
  map = L.map("map").setView([-37.8136, 144.9631], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map);

  const onReady = () => renderStoreMarkers(sortedStores.value);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        me.value = { lat: latitude, lng: longitude };
        map.setView([latitude, longitude], 14);
        meMarker = L.marker([latitude, longitude], { title: "You are here" }).addTo(map);
        onReady();
      },
      () => {
        me.value = null;
        onReady();
      },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
    );
  } else {
    me.value = null;
    onReady();
  }
});

// 当过滤/排序结果变化时，更新标注
watch(sortedStores, (list) => {
  if (map) renderStoreMarkers(list);
});
</script>

<style scoped>
.map {
  height: 400px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 12px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
