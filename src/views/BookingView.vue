<script setup>
import { ref, computed, onMounted } from "vue";
import {
  doc, runTransaction, setDoc, getDoc, getDocs, deleteDoc,
  collection, query, where, orderBy, serverTimestamp
} from "firebase/firestore";
import { auth, db } from "../firebase";

const todayISO = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const date = ref(todayISO);
const time = ref("09:00");
const counsellor = ref("Alex");
const loading = ref(false);
const message = ref("");

const counsellors = ["Alex", "Jamie", "Taylor", "Riley"];

const me = computed(() => auth.currentUser);
const myBookings = ref([]);

function slotId(d, t, c) {
  // 2025-10-20 + 09:00 -> 20251020_0900
  const dKey = d.replaceAll("-", "");
  const tKey = t.replace(":", "");
  return `${c}_${dKey}_${tKey}`;
}

async function loadMyBookings() {
  if (!me.value) return (myBookings.value = []);
  const q = query(
    collection(db, "bookings"),
    where("uid", "==", me.value.uid)
  );
  const snap = await getDocs(q);
  const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  rows.sort((a,b) => {
    const ak = `${a.dateKey || a.date?.replaceAll('-','')}${a.timeKey || a.time?.replace(':','')}`;
    const bk = `${b.dateKey || b.date?.replaceAll('-','')}${b.timeKey || b.time?.replace(':','')}`;
    return ak.localeCompare(bk);
  });
  myBookings.value = rows;
}


async function book() {
  message.value = "";
  if (!me.value) { message.value = "Please sign in first."; return; }

  const id = slotId(date.value, time.value, counsellor.value);
  const ref = doc(db, "bookings", id);
  const [dKey, tKey] = [date.value.replaceAll("-", ""), time.value.replace(":", "")];

  loading.value = true;
  try {
    // 事务：如果该时段已存在文档则失败；否则写入
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (snap.exists()) {
        throw new Error("This time slot is already booked. Please choose another.");
      }
      tx.set(ref, {
        uid: me.value.uid,
        email: me.value.email || "",
        counsellor: counsellor.value,
        date: date.value, time: time.value,
        dateKey: dKey, timeKey: tKey,
        createdAt: serverTimestamp()
      });
    });
    message.value = "Booked successfully!";
    await loadMyBookings();
  } catch (e) {
    message.value = e?.message || "Failed to book.";
  } finally {
    loading.value = false;
  }
}

async function cancelBooking(row) {
  if (!me.value) return;
  loading.value = true;
  try {
    await deleteDoc(doc(db, "bookings", row.id));
    await loadMyBookings();
  } finally {
    loading.value = false;
  }
}

onMounted(loadMyBookings);
</script>

<template>
  <section class="wrap">
    <div class="card">
      <h2>Book an Appointment</h2>
      <p class="muted">
        Select a date and time (30-minute slot). Conflicts are checked against existing bookings.
      </p>

      <div class="grid">
        <label>
          <span>Date</span>
          <input type="date" v-model="date" />
        </label>

        <label>
          <span>Time</span>
          <select v-model="time">
            <option v-for="hh in 9" :key="'am'+hh" :value="String(8+hh).padStart(2,'0') + ':00'">
              {{ String(8+hh).padStart(2,'0') + ':00' }}
            </option>
            <option v-for="hh in 5" :key="'pm'+hh" :value="String(17+hh).padStart(2,'0') + ':00'">
              {{ String(17+hh).padStart(2,'0') + ':00' }}
            </option>
          </select>
        </label>

        <label>
          <span>Counsellor</span>
          <select v-model="counsellor">
            <option v-for="c in counsellors" :key="c" :value="c">{{ c }}</option>
          </select>
        </label>

        <div class="actions">
          <button class="btn primary" :disabled="loading" @click="book">Book</button>
          <span class="msg" :class="{error: message.includes('Failed') || message.includes('slot')}">
            {{ message }}
          </span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="row">
        <h3>My bookings</h3>
        <button class="btn" :disabled="loading" @click="loadMyBookings">Reload</button>
      </div>

      <table class="tbl">
        <thead>
          <tr><th>Date</th><th>Time</th><th>Counsellor</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr v-if="!myBookings.length">
            <td colspan="4" class="muted">No bookings yet.</td>
          </tr>
          <tr v-for="row in myBookings" :key="row.id">
            <td>{{ row.date }}</td>
            <td>{{ row.time }}</td>
            <td>{{ row.counsellor }}</td>
            <td>
              <button class="btn danger" :disabled="loading" @click="cancelBooking(row)">Cancel</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.wrap { max-width: 980px; margin: 0 auto; }
.card {
  background: #fff; border-radius: 16px; box-shadow: 0 8px 28px rgba(0,0,0,.06);
  padding: 20px; margin: 18px 0;
}
.muted { color:#666; }
.grid {
  display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:14px; align-items:end;
}
label { display:flex; flex-direction:column; gap:6px; font-size:.95rem; }
input, select { width:100%; padding:.55rem .7rem; border-radius:10px; border:1px solid #e3e3e3; }
.actions { display:flex; align-items:center; gap:10px; }
.row { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
.tbl { width:100%; border-collapse:collapse; }
.tbl th, .tbl td { padding:.65rem .5rem; border-bottom:1px solid #eee; text-align:left; }
.btn { padding:.4rem .9rem; border-radius:999px; border:1px solid #d7d7d7; background:#fafafa; cursor:pointer; }
.btn.primary { background:#5b8cff; color:#fff; border-color:#5b8cff; }
.btn.danger { background:#ff6b6b; color:#fff; border-color:#ff6b6b; }
.msg { font-size:.9rem; color:#2f7a2f; }
.msg.error { color:#b00020; }
@media (max-width: 800px) {
  .grid { grid-template-columns: 1fr; }
}
</style>
