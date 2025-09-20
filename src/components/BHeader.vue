<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref as dbRef, get } from "firebase/database";
import { auth, rtdb } from "../firebase";                  // Firebase
import { getRole, setRole, clearRole } from "../stores/auth"; // localStorage

const router = useRouter();

const userEmail = ref("");
const role = ref(getRole() || "guest");
const authed = computed(() => !!userEmail.value);

let unsub = null;
onMounted(() => {
  // 监听登录状态变化：登录时从 rtdb 读取角色，并写回本地缓存；登出时清空
  unsub = onAuthStateChanged(auth, async (u) => {
    userEmail.value = u?.email || "";

    if (!u) {
      clearRole();
      role.value = "guest";
      return;
    }

    try {
      const snap = await get(dbRef(rtdb, `roles/${u.uid}`));
      const r = snap.exists() ? snap.val() : "user"; // 默认 user
      setRole(r);         // 同步写入 localStorage，供其它页面使用
      role.value = r;
    } catch (err) {
      // 如果因为规则/网络失败，回退到本地缓存的角色，仍保持可用
      role.value = getRole() || "user";
      // console.warn("load role failed:", err);
    }
  });
});

onBeforeUnmount(() => unsub && unsub());

const onLogout = async () => {
  await signOut(auth);
  clearRole();
  role.value = "guest";
  router.push("/FireLogin");
};
</script>

<template>
  <!-- Using Bootstrap's Header template (starter code) -->
  <!-- https://getbootstrap.com/docs/5.0/examples/headers/ -->
  <div class="container">
    <header class="d-flex justify-content-between align-items-center py-3">
      <ul class="nav nav-pills">
        <li class="nav-item">
          <router-link to="/" class="nav-link" active-class="active" aria-current="page">
            Home (Week 5)
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/FireLogin" class="nav-link" active-class="active">
            Firebase Login
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/FireRegister" class="nav-link" active-class="active">
            Firebase Register
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/admin" class="nav-link" active-class="active">
            Admin
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/addbook" class="nav-link" active-class="active">Add Book</router-link>
        </li>
      </ul>

      <div class="d-flex align-items-center gap-2">
        <span v-if="authed" class="me-2 text-muted">
          login：{{ userEmail }}（{{ role }}）
        </span>

        <router-link v-if="!authed" to="/FireLogin" class="btn btn-outline-primary btn-sm">
          Login
        </router-link>

        <button v-else class="btn btn-outline-secondary btn-sm" @click="onLogout">
          Logout
        </button>
      </div>
    </header>
  </div>
</template>

<style scoped>
.nav-link.router-link-active {
  font-weight: 700;
}

.b-example-divider {
  height: 3rem;
  background-color: rgba(0, 0, 0, 0.1);
  border: solid rgba(0, 0, 0, 0.15);
  border-width: 1px 0;
  box-shadow:
    inset 0 0.5em 1.5em rgba(0, 0, 0, 0.1),
    inset 0 0.125em 0.5em rgba(0, 0, 0, 0.15);
}

.form-control-dark {
  color: #fff;
  background-color: var(--bs-dark);
  border-color: var(--bs-gray);
}

.form-control-dark:focus {
  color: #fff;
  background-color: var(--bs-dark);
  border-color: #fff;
  box-shadow: 0 0 0 0.25rem rgba(255, 255, 255, 0.25);
}

.bi {
  vertical-align: -0.125em;
  fill: currentColor;
}

.text-small {
  font-size: 85%;
}

.dropdown-toggle {
  outline: 0;
}
</style>
