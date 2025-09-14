<template>
  <div style="max-width:480px;margin:2rem auto;">
    <h2>Firebase login</h2>
    <input v-model.trim="email" type="email" placeholder="Email" maxlength="50" />
    <input v-model.trim="password" type="password" placeholder="Password" maxlength="50" />
    <button :disabled="loading" @click="login">{{ loading ? "Logging in..." : "Log in" }}</button>
    <p>{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref as dbRef, get } from "firebase/database";
import { auth, db } from "../firebase";
import { setRole } from "../stores/auth";

const email = ref(""); const password = ref(""); const message = ref(""); const loading = ref(false);
const router = useRouter();

const login = async () => {
  message.value = "";

  if (!/^\S+@\S+\.\S+$/.test(email.value)) { message.value = "Please enter a valid email address"; return; }
  if (!password.value) { message.value = "Please enter your password"; return; }

  loading.value = true;
  try {
    const cred = await signInWithEmailAndPassword(auth, email.value, password.value);
    // Read the role and cache it after logging in
    const snap = await get(dbRef(db, `roles/${cred.user.uid}`));
    setRole(snap.exists() ? snap.val() : "user");
    message.value = "✅ Login successful：" + cred.user.email;
    router.push("/");
  } catch (e) {
    message.value = "❌ Login Failed：" + (e.code || "Please check your account or try again later");
  } finally {
    loading.value = false;
  }
};
</script>
