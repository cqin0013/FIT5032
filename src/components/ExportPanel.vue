<template>
  <section aria-labelledby="exp-title">
    <h3 id="exp-title" class="font-semibold">Export</h3>
    <div class="flex gap-2 mt-2">
      <button class="px-3 py-1 border rounded" @click="toCSV">CSV</button>
      <button class="px-3 py-1 border rounded" @click="toJSON">JSON</button>
      <button class="px-3 py-1 border rounded" @click="toPDF">PDF</button>
    </div>
  </section>
</template>

<script setup>
import { exportToCSV, exportToJSON, exportToPDF } from '@/utils/export'

const props = defineProps({
  rows: { type: Array, required: true },
  columns: { type: Array, required: true }, // keys
  fileBase: { type: String, default: 'export' }
})

const toCSV = () => exportToCSV(props.fileBase, props.rows, props.columns)
const toJSON = () => exportToJSON(props.fileBase, props.rows)
const toPDF = () => exportToPDF(props.fileBase, props.columns, props.rows)
</script>
