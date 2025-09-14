<template>
  <main style="max-width:480px;margin:2rem auto;">
    <h1>Create an Account / 注册</h1>
    <p><input type="email" placeholder="Email" v-model.trim="email" maxlength="50" /></p>
    <p><input type="password" placeholder="Password (≥6)" v-model.trim="password" maxlength="50" /></p>
    <p><button :disabled="loading" @click="register">{{ loading ? 'Registering...' : 'Save to Firebase' }}</button></p>
    <p style="color:#d33" v-if="error">{{ error }}</p>
    <p style="color:#2a7" v-if="ok">{{ ok }}</p>
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
const error = ref("");
const router = useRouter();

const register = async () => {
  ok.value = ""; error.value = "";

  if (!/^\S+@\S+\.\S+$/.test(email.value)) { error.value = "Please enter a valid email address"; return; }
  if (password.value.length < 6) { error.value = "Password must be at least 6 characters long"; return; }

  loading.value = true;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.value, password.value);
    //Give new users the "user" role by default (C.2)
    await set(dbRef(db, `roles/${cred.user.uid}`), "user");
    ok.value = "Registration successful! Please log in";
    router.push("/FireLogin");
  } catch (e) { error.value = e.code || "Registration failed"; }
  finally { loading.value = false; }
};
</script>
