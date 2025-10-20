<template>
  <div class="container">
    <div class="card">
      <h2>Bulk Email</h2>
      <p class="muted">Send email to multiple recipients (admin only). Uses your serverless endpoint.</p>

      <form class="grid-2" @submit.prevent="send">
        <label class="fld">
          <span>Recipients (comma or newline separated)</span>
          <textarea v-model.trim="recipientsRaw" rows="6" required placeholder="a@x.com, b@y.com"></textarea>
        </label>
        <div class="rightcol">
          <label class="fld">
            <span>Subject</span>
            <input v-model.trim="subject" required />
          </label>
          <label class="fld">
            <span>Message</span>
            <textarea v-model.trim="body" rows="6" required></textarea>
          </label>
          <div class="act">
            <button class="btn btn-primary" :disabled="loading">{{ loading ? 'Sending…' : 'Send' }}</button>
            <span class="muted" v-if="msg">{{ msg }}</span>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
const ENDPOINT = import.meta.env.VITE_BULK_EMAIL_ENDPOINT || "https://YOUR_FUNCTION/sendBulkEmail";

const recipientsRaw = ref("");
const subject = ref("");
const body = ref("");
const loading = ref(false);
const msg = ref("");

function parseRecipients(raw){
  return raw.split(/[\n,; ]+/).map(s=>s.trim()).filter(Boolean);
}

async function send(){
  msg.value=""; loading.value=true;
  try{
    const recipients = parseRecipients(recipientsRaw.value);
    const res = await fetch(ENDPOINT, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ recipients, subject: subject.value, body: body.value })
    });
    if (!res.ok) throw new Error(await res.text());
    msg.value = "Sent!";
    subject.value = ""; body.value=""; recipientsRaw.value="";
  }catch(e){ console.error(e); msg.value="Failed."; }
  finally{ loading.value=false; }
}
</script>

<style scoped>
.card{ background: var(--ymh-surface); border:1px solid var(--vt-c-divider-light-1); border-radius:16px; padding:16px; box-shadow:0 4px 30px rgba(58,70,102,.08);}
.muted{ color:var(--ymh-muted);}
.grid-2{ display:grid; grid-template-columns: 1fr 1fr; gap:1rem;}
@media (max-width: 860px){ .grid-2{ grid-template-columns: 1fr; } }
.fld{ display:flex; flex-direction:column; gap:.3rem;}
.fld > input, .fld > textarea{ border:1px solid #e5e7eb; border-radius:10px; padding:.6rem .7rem;}
.rightcol{ display:flex; flex-direction:column; gap:.6rem;}
.act{ display:flex; align-items:center; gap:.8rem;}
.btn{ display:inline-flex; align-items:center; gap:.5rem; padding:.45rem .9rem; border-radius:999px; border:1px solid var(--vt-c-divider-light-1); cursor:pointer;}
.btn-primary{ background: linear-gradient(135deg, var(--ymh-primary), var(--ymh-teal)); color:white; border-color: transparent;}
</style>
