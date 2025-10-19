<template>
  <div>
    <InteractiveTable
      title="Books (Firestore)"
      :rows="rows"
      :columns="cols"
      default-sort-key="createdAt"
      default-sort-dir="desc"
    />
    <ExportPanel class="mt-4" :rows="exportRows" :columns="exportCols" file-base="books"/>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

// 兼容你项目的 firebase 导出方式：既支持默认导出，也支持命名导出 db
import * as firebaseInit from "../firebase";
const db = firebaseInit.db || firebaseInit.default || firebaseInit;

import InteractiveTable from "../components/InteractiveTable.vue";
import ExportPanel from "../components/ExportPanel.vue";

const cols = [
  { key:"createdAt", label:"Created At" },
  { key:"isbn",      label:"ISBN" },
  { key:"name",      label:"Name" },
];
const rows = ref([]);

onMounted(async () => {
  // 如果你 AddBook 用的字段不是 createdAt，请改成实际字段
  const q = query(collection(db,"books"), orderBy("createdAt","desc"));
  const snap = await getDocs(q);
  rows.value = snap.docs.map(d => ({ id:d.id, ...d.data() }));
});

const exportCols = ["createdAt","isbn","name"];
const exportRows = computed(() =>
  rows.value.map(r => ({
    createdAt: r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toISOString() : "",
    isbn: r.isbn,
    name: r.name
  }))
);
</script>
