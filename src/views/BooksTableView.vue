<template>
  <div class="container">
    <div class="card" style="padding: 0;">
      <InteractiveTable
        title="Youth Self-Help Resources (Firestore)"
        :rows="rows"
        :columns="cols"
        default-sort-key="createdAt"
        default-sort-dir="desc"
      />
    </div>

    <ExportPanel class="mt-4 card" :rows="exportRows" :columns="exportCols" file-base="resources"/>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import InteractiveTable from "@/components/InteractiveTable.vue";
import ExportPanel from "@/components/ExportPanel.vue";

const rows = ref([]);
const cols = [
  { key: "name", label: "Resource Name" },
  { key: "isbn", label: "Resource ID" },
  { key: "createdAt", label: "Added" },
];

onMounted(async () => {
  const q = query(collection(db, "books"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  rows.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
});

const exportCols = ["createdAt", "isbn", "name"];
const exportRows = computed(() =>
  rows.value.map(r => ({
    createdAt: r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toISOString() : "",
    isbn: r.isbn ?? "",
    name: r.name ?? ""
  }))
);
</script>

<style scoped>
.mt-4 { margin-top: 1rem; }
</style>
