<template>
  <div class="container">
    <div class="card" style="padding:0;">
      <InteractiveTable
        title="Coping Tips"
        :rows="rows"
        :columns="cols"
        default-sort-key="name"
      />
    </div>
  </div>
</template>

<script setup>
import InteractiveTable from "../components/InteractiveTable.vue";
// 仍复用现有示例 JSON：src/assets/json/authors.json
import authors from "../assets/json/authors.json";

/* 直接映射已有字段，便于你后续把 JSON 换成真正的 tips 数据结构 */
const cols = [
  { key:"name",  label:"Tip" },        // 旧 name → 技巧名称
  { key:"genre", label:"Category" },   // 旧 genre → 分类（如 Relaxation/Mindfulness）
  { key:"born",  label:"Source" },     // 旧 born → 来源（先用数字站位，可换为出处）
];

const rows = authors
  .filter(a => a && a.name && (a.genre || a.genres))
  .map((a, i) => ({
    id: i,
    name: a.name,
    genre: Array.isArray(a.genres) ? a.genres[0] : (a.genre ?? "General"),
    born: a.born ?? a.birthYear ?? ""
  }));
</script>
