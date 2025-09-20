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
import { auth, rtdb } from "../firebase";
import { setRole } from "../stores/auth";

const email = ref(""); const password = ref(""); const message = ref(""); const loading = ref(false);
const router = useRouter();

const login = async () => {
  message.value = "";

  if (!/^\S+@\S+\.\S+$/.test(email.value)) { message.value = "Please enter a valid email address"; return; }
  if (!password.value) { message.value = "Please enter your password"; return; }

  loading.value = true;
  try {
    // 这里只负责“登录”本身
    const cred = await signInWithEmailAndPassword(auth, email.value, password.value);

    // 登录已成功，后续读取角色即便失败也不算登录失败
    let role = "user";
    try {
      const snap = await get(dbRef(rtdb, `roles/${cred.user.uid}`));
      if (snap.exists()) role = snap.val();
    } catch (e) {
      // 读取角色失败就用默认 user，不抛给外层
      console.warn("read role failed:", e?.code || e);
    }
    setRole(role);

    message.value = "✅ Login successful: " + cred.user.email;
    router.push("/"); // 跳转主页
  } catch (e) {
    // 只有登录失败才会到这里
    message.value =
      "❌ Login Failed: " + (e?.code || "Please check your account or try again later");
  } finally {
    loading.value = false;
  }
};
</script>
