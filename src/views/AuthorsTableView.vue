<template>
  <InteractiveTable
    title="Authors (Local JSON)"
    :rows="rows"
    :columns="cols"
    default-sort-key="name"
  />
</template>

<script setup>
import InteractiveTable from "../components/InteractiveTable.vue";
// 放一个示例 JSON：src/assets/json/authors.json
import authors from "../assets/json/authors.json";

const cols = [
  { key:"name",  label:"Name" },
  { key:"born",  label:"Born" },
  { key:"genre", label:"Genre" },
];
const rows = authors.map((a, i) => ({ id:i, ...a }));
</script>
