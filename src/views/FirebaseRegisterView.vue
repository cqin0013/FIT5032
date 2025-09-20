<!-- src/views/FirebaseRegisterView.vue -->
<template>
  <main style="max-width:480px;margin:2rem auto;">
    <h1>Create an Account / 注册</h1>

    <p>
      <input
        type="email"
        placeholder="Email"
        v-model.trim="email"
        maxlength="50"
      />
    </p>

    <p>
      <input
        type="password"
        placeholder="Password (≥6)"
        v-model.trim="password"
        maxlength="50"
      />
    </p>

    <p>
      <button :disabled="loading" @click="register">
        {{ loading ? "Registering..." : "Save to Firebase" }}
      </button>
    </p>

    <p v-if="error" style="color:#d33">{{ error }}</p>
    <p v-if="ok" style="color:#2a7">{{ ok }}</p>
    <p v-if="note" style="color:#c77">{{ note }}</p>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref as dbRef, set } from "firebase/database";
import { auth, db } from "../firebase";

const email = ref("");
const password = ref("");
const loading = ref(false);
const ok = ref("");
const note = ref("");   // 非致命提示（例如写入角色失败）
const error = ref("");
const router = useRouter();

const formatError = (e) => {
  const code = e?.code || "";
  switch (code) {
    case "auth/email-already-in-use":
      return "This email address has been registered";
    case "auth/invalid-email":
      return "The email format is incorrect";
    case "auth/weak-password":
      return "Password must be at least 6 characters long";
    case "database/permission-denied":
    case "PERMISSION_DENIED":
      return "Database writes are blocked by rules (account created)";
    default:
      return code || "Registration failed";
  }
};

const register = async () => {
  ok.value = "";
  note.value = "";
  error.value = "";

  // 简单校验
  if (!/^\S+@\S+\.\S+$/.test(email.value)) {
    error.value = "Please enter a valid email address";
    return;
  }
  if (password.value.length < 6) {
    error.value = "Password must be at least 6 characters long";
    return;
  }

  loading.value = true;
  try {
    // 1) 先创建账号（这一步成功就算注册成功）
    const cred = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );

    // 2) 再尝试写入默认角色（失败也不影响注册成功）
    try {
      await set(dbRef(db, `roles/${cred.user.uid}`), "user");
    } catch (err) {

      console.warn("Failed to write role:", err);
      note.value =
        "。";
    }

    ok.value = "Registration successful! Please log in.";
// Experience: Jump to the login page after giving a success prompt
    router.push("/FireLogin");
  } catch (e) {
    error.value = formatError(e);
  } finally {
    loading.value = false;
  }
};
</script>
