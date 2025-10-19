<template>
  <section aria-labelledby="tbl-title">
    <header class="mb-3 flex items-center gap-3">
      <h2 id="tbl-title" class="m-0 text-lg font-semibold">{{ title }}</h2>
      <label class="sr-only" :for="searchId">Search</label>
      <input
        :id="searchId"
        v-model.trim="q"
        type="search"
        placeholder="Search…"
        class="border rounded px-2 py-1"
        :aria-label="`Search ${title}`"
      />
    </header>

    <div class="overflow-x-auto">
      <table class="min-w-full border border-gray-300" role="table">
        <thead>
          <tr role="row" class="bg-gray-50">
            <th
              v-for="c in columns"
              :key="c.key"
              scope="col"
              role="columnheader"
              class="px-3 py-2 text-left border-b cursor-pointer select-none"
              :aria-sort="ariaSort(c.key)"
              @click="toggleSort(c.key)"
              :title="`Sort by ${c.label}`"
            >
              {{ c.label }}
              <span v-if="sort.key === c.key">
                {{ sort.direction === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in pagedRows" :key="r.__rowKey" role="row" class="odd:bg-white even:bg-gray-50">
            <td v-for="c in columns" :key="c.key" role="cell" class="px-3 py-2 border-b align-top">
              <slot :name="`cell-${c.key}`" :row="r">
                {{ formatCell(r[c.key]) }}
              </slot>
            </td>
          </tr>
          <tr v-if="pagedRows.length === 0">
            <td :colspan="columns.length" class="px-3 py-6 text-center text-gray-500">No results</td>
          </tr>
        </tbody>
      </table>
    </div>

    <nav class="mt-3 flex items-center gap-2" aria-label="Pagination">
      <button class="px-2 py-1 border rounded" :disabled="page===1" @click="page--">Prev</button>
      <span class="px-2">Page {{ page }} / {{ totalPages }}</span>
      <button class="px-2 py-1 border rounded" :disabled="page===totalPages" @click="page++">Next</button>

      <label class="ml-4">
        <span class="sr-only">Rows per page</span>
        <select v-model.number="pageSize" class="border rounded px-2 py-1" aria-label="Rows per page">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
      </label>
    </nav>
  </section>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Table' },
  rows:  { type: Array,  required: true },
  columns: { type: Array, required: true }, // [{key,label}]
  defaultSortKey: { type: String, default: '' },
  defaultSortDir: { type: String, default: 'asc' }, // 'asc'|'desc'
})

const q = ref('')
const page = ref(1)
const pageSize = ref(10)
const sort = ref({ key: props.defaultSortKey, direction: props.defaultSortDir })

const searchId = 'search-' + Math.random().toString(36).slice(2,8)

const normalized = computed(() =>
  (props.rows || []).map((r, i) => ({ __rowKey: r.id ?? i, ...r }))
)

const filtered = computed(() => {
  if (!q.value) return normalized.value
  const needle = q.value.toLowerCase()
  return normalized.value.filter(r =>
    props.columns.some(c => String(r[c.key] ?? '').toLowerCase().includes(needle))
  )
})

const sorted = computed(() => {
  if (!sort.value.key) return filtered.value
  const { key, direction } = sort.value
  return [...filtered.value].sort((a, b) => {
    const av = a[key] ?? ''
    const bv = b[key] ?? ''
    if (av < bv) return direction === 'asc' ? -1 : 1
    if (av > bv) return direction === 'asc' ? 1 : -1
    return 0
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(sorted.value.length / pageSize.value)))
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return sorted.value.slice(start, start + pageSize.value)
})

watch([q, pageSize, sorted], () => { page.value = 1 })

function toggleSort(key) {
  if (sort.value.key !== key) sort.value = { key, direction: 'asc' }
  else sort.value.direction = sort.value.direction === 'asc' ? 'desc' : 'asc'
}

function ariaSort(key) {
  if (sort.value.key !== key) return 'none'
  return sort.value.direction === 'asc' ? 'ascending' : 'descending'
}

function formatCell(v) {
  if (v?.seconds && v?.nanoseconds) {
    const d = new Date(v.seconds * 1000)
    return d.toLocaleString()
  }
  return v
}

onMounted(() => {
  if (props.defaultSortKey) sort.value.key = props.defaultSortKey
})
</script>

<style scoped>
.sr-only{ position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
</style>
