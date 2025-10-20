<template>
  <main class="admin-wrap">
    <h2>Admin console</h2>
    <p class="muted">Only the <code>admin</code> role can access this page.</p>

    <!-- Quick Stats -->
    <section class="card">
      <header class="sect-head">
        <h3>Quick stats</h3>
        <button class="btn btn-ghost" @click="refreshCount" :disabled="loadingCount">
          {{ loadingCount ? 'Refreshing…' : 'Refresh' }}
        </button>
      </header>
      <div class="grid-2">
        <div class="stat">
          <div class="stat-num">{{ countText }}</div>
          <div class="stat-label">Total resources (Firestore “books”)</div>
        </div>
      </div>
    </section>

    <!-- Add Resource -->
    <section class="card">
      <header class="sect-head"><h3>Add resource</h3></header>
      <form class="grid-2" @submit.prevent="addResource">
        <label class="fld">
          <span>Resource ID</span>
          <input type="number" min="0" v-model.number="isbn" required />
        </label>
        <label class="fld">
          <span>Resource name</span>
          <input type="text" maxlength="120" v-model.trim="name" required />
        </label>
        <div class="act-row">
          <button class="btn btn-primary" :disabled="adding">{{ adding ? 'Adding…' : 'Add' }}</button>
          <span class="muted" v-if="addMsg">{{ addMsg }}</span>
        </div>
      </form>
    </section>

    <!-- Manage Resources -->
    <section class="card">
      <header class="sect-head"><h3>Manage resources</h3></header>

      <div class="tools">
        <label class="fld">
          <span>Search</span>
          <input type="search" v-model.trim="q" placeholder="Filter by name or ID…" />
        </label>
        <button class="btn btn-ghost" @click="fetchResources" :disabled="loadingList">
          {{ loadingList ? 'Loading…' : 'Reload' }}
        </button>
      </div>

      <div class="tbl-wrap" role="region" aria-label="Resources table">
        <table class="tbl">
          <thead>
            <tr>
              <th style="width: 140px;">Created</th>
              <th>Resource ID</th>
              <th>Resource name</th>
              <th style="width: 160px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filteredRows" :key="r.id">
              <td>{{ fmt(r.createdAt) }}</td>
              <td>{{ r.isbn }}</td>
              <td>
                <template v-if="editingId===r.id">
                  <input class="inline-input" v-model.trim="editName" />
                </template>
                <template v-else>
                  {{ r.name }}
                </template>
              </td>
              <td class="actions">
                <template v-if="editingId===r.id">
                  <button class="btn btn-primary" @click="saveName(r)" :disabled="savingId===r.id">Save</button>
                  <button class="btn btn-ghost" @click="cancelEdit" :disabled="savingId===r.id">Cancel</button>
                </template>
                <template v-else>
                  <button class="btn btn-ghost" @click="startEdit(r)">Edit</button>
                  <button class="btn btn-ghost" @click="remove(r)" :disabled="deletingId===r.id">
                    {{ deletingId===r.id ? 'Deleting…' : 'Delete' }}
                  </button>
                </template>
              </td>
            </tr>
            <tr v-if="!filteredRows.length">
              <td colspan="4" class="muted">No resources.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Admin-only shortcuts -->
    <section class="card">
      <header class="sect-head"><h3>Admin shortcuts</h3></header>
      <ul class="links">
        <li><router-link to="/Email">Send email (Cloud Function)</router-link></li>
        <li><router-link to="/GetBookCount">Counter page </router-link></li>
        <li><router-link to="/addbook">Add page</router-link></li>
      </ul>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  collection, getDocs, orderBy, query, serverTimestamp, addDoc,
  getCountFromServer, doc, updateDoc, deleteDoc
} from "firebase/firestore";
import { db } from "@/firebase";

/* Quick stats */
const loadingCount = ref(false);
const count = ref(null);
const countText = computed(() => (count.value==null ? "—" : count.value));

async function refreshCount(){
  loadingCount.value = true;
  try {
    const coll = collection(db, "books");
    const snap = await getCountFromServer(coll);
    count.value = snap.data().count ?? 0;
  } finally {
    loadingCount.value = false;
  }
}

/* Add resource */
const isbn = ref(null);
const name = ref("");
const adding = ref(false);
const addMsg = ref("");

async function addResource(){
  addMsg.value = "";
  adding.value = true;
  try {
    await addDoc(collection(db, "books"), {
      isbn: isbn.value,
      name: name.value,
      createdAt: serverTimestamp()
    });
    addMsg.value = "Added.";
    isbn.value = null;
    name.value = "";
    fetchResources();
    refreshCount();
  } catch (e) {
    console.error(e);
    addMsg.value = "Failed.";
  } finally {
    adding.value = false;
  }
}

/* List / edit / delete */
const rows = ref([]);
const loadingList = ref(false);
const q = ref("");

async function fetchResources(){
  loadingList.value = true;
  try {
    const qy = query(collection(db,"books"), orderBy("createdAt","desc"));
    const snap = await getDocs(qy);
    rows.value = snap.docs.map(d => ({ id:d.id, ...d.data() }));
  } finally {
    loadingList.value = false;
  }
}
const filteredRows = computed(() => {
  const n = (q.value || "").toLowerCase();
  if (!n) return rows.value;
  return rows.value.filter(r =>
    String(r.name||"").toLowerCase().includes(n) ||
    String(r.isbn||"").toLowerCase().includes(n)
  );
});

/* inline edit */
const editingId = ref(null);
const editName = ref("");
const savingId = ref(null);
function startEdit(r){ editingId.value = r.id; editName.value = r.name || ""; }
function cancelEdit(){ editingId.value = null; editName.value = ""; }
async function saveName(r){
  if (!editName.value.trim()) return;
  savingId.value = r.id;
  try {
    await updateDoc(doc(db,"books", r.id), { name: editName.value.trim() });
    const item = rows.value.find(x=>x.id===r.id);
    if (item) item.name = editName.value.trim();
    cancelEdit();
  } finally {
    savingId.value = null;
  }
}

/* delete */
const deletingId = ref(null);
async function remove(r){
  if (!confirm(`Delete resource "${r.name}"?`)) return;
  deletingId.value = r.id;
  try {
    await deleteDoc(doc(db,"books", r.id));
    rows.value = rows.value.filter(x => x.id !== r.id);
    refreshCount();
  } finally {
    deletingId.value = null;
  }
}

function fmt(ts){
  if (!ts) return "";
  if (ts.seconds) return new Date(ts.seconds*1000).toLocaleString();
  return String(ts);
}

onMounted(() => {
  refreshCount();
  fetchResources();
});
</script>

<style scoped>
.admin-wrap{ max-width: 960px; margin: 1.2rem auto; display: grid; gap: 1rem; }
.muted{ color: var(--ymh-muted); }
.card{ background: var(--ymh-surface); border:1px solid var(--vt-c-divider-light-1);
  border-radius:16px; padding:16px; box-shadow:0 4px 30px rgba(58,70,102,.08); }

.sect-head{ display:flex; justify-content:space-between; align-items:center; margin-bottom:.6rem; }
.grid-2{ display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 1rem; }
@media (max-width: 720px){ .grid-2{ grid-template-columns: 1fr; } }

.stat{ background: #f8fafc; border:1px solid #e5e7eb; border-radius:12px; padding:12px; }
.stat-num{ font-size: 1.6rem; font-weight: 700; }
.stat-label{ color: var(--ymh-muted); font-size: .92rem; }

.fld{ display:flex; flex-direction:column; gap:.3rem; }
.fld > input{ border:1px solid #e5e7eb; border-radius:10px; padding:.5rem .6rem; }

.tools{ display:flex; gap: .8rem; align-items:end; margin-bottom:.6rem; }
.tbl-wrap{ overflow:auto; border:1px solid #e5e7eb; border-radius:12px; }
.tbl{ width:100%; border-collapse: collapse; }
.tbl th, .tbl td{ text-align:left; padding:.5rem .6rem; border-bottom:1px solid #eee; }
.tbl thead th{ background:#f8fafc; }
.actions{ display:flex; gap:.4rem; }
.inline-input{ border:1px solid #e5e7eb; border-radius:8px; padding:.35rem .5rem; width:100%; }

.btn{ display:inline-flex; align-items:center; gap:.5rem; padding:.5rem .9rem; border-radius:999px; border:1px solid transparent; cursor:pointer; font-weight:600; transition:all .2s ease; }
.btn:focus{ outline:none; box-shadow:0 0 0 4px var(--ymh-ring); }
.btn-primary{ background: linear-gradient(135deg, var(--ymh-primary), var(--ymh-teal)); color:white; }
.btn-ghost{ background:transparent; border-color: var(--vt-c-divider-light-1); color: var(--ymh-text); }
.act-row{ display:flex; align-items:center; gap:.8rem; margin-top:.4rem; }
</style>
