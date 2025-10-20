<template>
  <div style="max-width:520px;margin:1rem auto;">
    <h1 class="text-lg font-semibold mb-2">Contact Support Team</h1>
    <p class="text-sm text-gray-600 mb-3">
      Uses Cloud Function <code>sendMail</code>. Supports attachments.
    </p>

    <form @submit.prevent="send">
      <label class="block mb-2">
        <span class="block mb-1">To (optional; default is server MAIL_TO)</span>
        <input
          v-model.trim="to"
          type="email"
          placeholder="receiver@example.com"
          class="form-control border rounded px-2 py-1 w-100"
        />
      </label>

      <label class="block mb-2">
        <span class="block mb-1">Subject</span>
        <input
          v-model.trim="subject"
          type="text"
          required
          maxlength="120"
          class="form-control border rounded px-2 py-1 w-100"
        />
      </label>

      <label class="block mb-2">
        <span class="block mb-1">Message</span>
        <textarea
          v-model.trim="text"
          required
          rows="5"
          class="form-control border rounded px-2 py-1 w-100"
        ></textarea>
      </label>

      <label class="block mb-3">
        <span class="block mb-1">Attachments (optional)</span>
        <input type="file" multiple @change="onFiles" />
      </label>

      <button class="btn btn-outline-primary btn-sm" :disabled="loading">
        {{ loading ? "Sending…" : "Send" }}
      </button>
    </form>

    <p class="mt-3 text-success" v-if="ok">{{ ok }}</p>
    <p class="mt-3 text-danger" v-if="err">{{ err }}</p>

    <!-- 调试用：显示当前请求 URL -->
    <p class="mt-3 text-muted" style="font-size:12px">POST URL: {{ url }}</p>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, computed } from "vue";

/**
 * URL 选择策略：
 * - 本地模拟器： http://localhost:5001/{project}/{region}/sendMail
 * - 1st Gen（cloudfunctions.net）： {base}/sendMail
 * - 2nd Gen（a.run.app）： {base}（已经是完整函数 URL，不能再拼 /sendMail）
 */
const USE_EMU = import.meta.env.VITE_USE_EMULATOR === "true";
const PROJ = import.meta.env.VITE_FIREBASE_PROJECT_ID || "fit5032-9023a";
const REGION = import.meta.env.VITE_FUNCTIONS_REGION || "us-central1";
const RAW_BASE = (import.meta.env.VITE_FUNCTIONS_BASE || "").trim();

const emuBase = computed(() => `http://localhost:5001/${PROJ}/${REGION}`);
const isV1 = computed(() => /cloudfunctions\.net/i.test(RAW_BASE));
const isV2 = computed(() => /(^https?:\/\/).+\.a\.run\.app$/i.test(RAW_BASE));

const url = computed(() => {
  if (USE_EMU) return `${emuBase.value}/sendMail`;
  if (isV1.value) return `${RAW_BASE.replace(/\/+$/, "")}/sendMail`;
  // 默认按 2nd Gen 处理：RAW_BASE 即为完整函数 URL
  return RAW_BASE.replace(/\/+$/, "");
});

const to = ref("");
const subject = ref("");
const text = ref("");
const files = ref([]);
const loading = ref(false);
const ok = ref("");
const err = ref("");

function onFiles(e) {
  files.value = [...(e.target.files || [])];
}

async function send() {
  ok.value = "";
  err.value = "";
  loading.value = true;
  try {
    const atts = await Promise.all(files.value.map((f) => toB64(f)));
    console.log("POST", url.value);
    await axios.post(url.value, {
      to: to.value || undefined,
      subject: subject.value,
      text: text.value,
      attachments: atts,
    });
    ok.value = "Email sent.";
    subject.value = "";
    text.value = "";
    files.value = [];
  } catch (e) {
    console.error(e);
    err.value = e?.response?.data || e?.message || "Failed to send";
  } finally {
    loading.value = false;
  }
}

function toB64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result).split(",")[1];
      resolve({ filename: file.name, content: base64 });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
</script>
