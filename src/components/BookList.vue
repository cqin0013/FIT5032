<template>
  <section>
    <div class="d-flex align-items-center gap-2 mb-3">
      <h2 class="m-0">Books</h2>
      <button class="btn btn-outline-secondary btn-sm" @click="loadDefault" :disabled="loading">
        orderBy(createdAt desc) + limit(20)
      </button>
      <button class="btn btn-outline-secondary btn-sm" @click="loadWhere" :disabled="loading">
        where(isbn &gt; 1000) + orderBy(isbn asc)
      </button>
      <button class="btn btn-outline-secondary btn-sm" @click="reload" :disabled="loading">Reload</button>
    </div>

    <div v-if="loading">Loading…</div>
    <div v-else-if="items.length === 0" class="text-muted">No data</div>

    <ul class="list-group">
      <li
        v-for="b in items"
        :key="b.id"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <div>
          <div><strong>{{ b.name }}</strong></div>
          <small>ISBN: {{ b.isbn }}</small>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary" @click="edit(b)">Edit</button>
          <button class="btn btn-sm btn-outline-danger" @click="remove(b)">Delete</button>
        </div>
      </li>
    </ul>


    <div v-if="editing" class="card p-3 mt-3">
      <h5 class="mb-2">Edit Book</h5>
      <input class="form-control mb-2" v-model.trim="editName" placeholder="Name" />
      <input class="form-control mb-2" v-model.number="editIsbn" type="number" placeholder="ISBN" min="0" />
      <div class="d-flex gap-2">
        <button class="btn btn-success btn-sm" @click="saveEdit">Save</button>
        <button class="btn btn-secondary btn-sm" @click="cancelEdit">Cancel</button>
      </div>
      <p class="mt-2 text-danger" v-if="err">{{ err }}</p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import db from '@/firebase/init'
import {
  collection, getDocs, query, where, orderBy, limit,
  doc, updateDoc, deleteDoc
} from 'firebase/firestore'

const items = ref([])
const loading = ref(false)
const err = ref('')


const editing = ref(null)
const editName = ref('')
const editIsbn = ref(null)

const loadDefault = async () => {
  loading.value = true; err.value = ''
  try {
    const q = query(collection(db, 'books'), orderBy('createdAt', 'desc'), limit(20))
    const snap = await getDocs(q)
    items.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    err.value = e?.message || 'load failed'
  } finally { loading.value = false }
}

const loadWhere = async () => {
  loading.value = true; err.value = ''
  try {
    const q = query(collection(db, 'books'),
      where('isbn', '>', 1000),
      orderBy('isbn', 'asc'),
      limit(20)
    )
    const snap = await getDocs(q)
    items.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    err.value = e?.message || 'load failed'
  } finally { loading.value = false }
}

const reload = () => { items.value = []; return loadDefault() }

const edit = (b) => { editing.value = b; editName.value = b.name; editIsbn.value = b.isbn }
const cancelEdit = () => { editing.value = null; err.value = '' }

const saveEdit = async () => {
  if (!editing.value) return
  try {
    await updateDoc(doc(db, 'books', editing.value.id), {
      name: editName.value,
      isbn: Number(editIsbn.value)
    })

    editing.value.name = editName.value
    editing.value.isbn = Number(editIsbn.value)
    cancelEdit()
  } catch (e) { err.value = e?.message || 'update failed' }
}

const remove = async (b) => {
  try {
    await deleteDoc(doc(db, 'books', b.id))
    items.value = items.value.filter(x => x.id !== b.id)
  } catch (e) { err.value = e?.message || 'delete failed' }
}


loadDefault()
</script>

<style scoped>
.list-group { margin-top: .5rem; }
</style>
