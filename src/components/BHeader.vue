<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref as dbRef, get } from "firebase/database";
import { auth, rtdb } from "../firebase";
import { getRole, setRole, clearRole } from "../stores/auth";

const router = useRouter();

const userEmail = ref("");
const role = ref(getRole() || "guest");
const authed = computed(() => !!userEmail.value);

let unsub = null;
onMounted(() => {
  unsub = onAuthStateChanged(auth, async (user) => {
    userEmail.value = user?.email || "";
    if (user?.uid) {
      try {
        const snap = await get(dbRef(rtdb, `roles/${user.uid}`));
        const r = snap.val() || "user";
        role.value = r; setRole(r);
      } catch {
        role.value = "user"; setRole("user");
      }
    } else {
      role.value = "guest"; clearRole();
    }
  });
});
onBeforeUnmount(() => { if (unsub) unsub(); });

function go(path) { router.push(path); }
async function doSignOut() {
  await signOut(auth);
  role.value = "guest"; clearRole();
  router.push({ name: "Home" });
}
</script>

<template>
  <header class="ymh-header" role="banner" aria-label="Site header">
    <div class="container header-row">
      <div class="brand" @click="go('/')">
        <span class="logo-bubble" aria-hidden="true">💬</span>
        <strong>Youth Mental Health Hub</strong>
      </div>

      <nav aria-label="Main navigation" class="nav">
        <button class="nav-link" @click="go('/')">Home</button>
        <button class="nav-link" @click="go('/BooksTable')">Resources</button>
        <button class="nav-link" @click="go('/AuthorsTable')">Coping Tips</button>
        <button class="nav-link" @click="go('/Geo')">Find Support</button>
        <button class="nav-link" @click="go('/Email')">Feedback</button>
        <button class="nav-link" @click="go('/about')">About</button>
        <button
          v-if="role==='admin'"
          class="nav-link"
          title="Admin (role=admin)"
          @click="go('/admin')"
        >
          Admin
        </button>
      </nav>

      <div class="auth">
        <template v-if="authed">
          <span class="who">{{ userEmail }}</span>
          <button class="btn btn-ghost" @click="doSignOut">Sign out</button>
        </template>
        <template v-else>
          <button class="btn btn-primary" @click="go('/FireLogin')">Sign in</button>
          <button class="btn btn-ghost" @click="go('/FireRegister')">Register</button>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.ymh-header {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: saturate(160%) blur(8px);
  background: linear-gradient(135deg, rgba(108,124,255,.9), rgba(122,211,207,.9));
  color: #fff;
  border-bottom: 1px solid rgba(255,255,255,.28);
}
.header-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: .6rem 0;
}
.brand {
  display: flex;
  align-items: center;
  gap: .6rem;
  cursor: pointer;
  font-size: 1.05rem;
}
.logo-bubble {
  display: inline-flex;
  width: 32px; height: 32px;
  border-radius: 999px;
  align-items: center; justify-content: center;
  background: rgba(255,255,255,.2);
}
.nav {
  display: flex;
  gap: .5rem;
  flex: 1;
}
.nav-link {
  background: transparent;
  border: none;
  color: #fff;
  opacity: .95;
  padding: .5rem .7rem;
  border-radius: 999px;
  cursor: pointer;
}
.nav-link:hover, .nav-link:focus {
  outline: none;
  background: rgba(255,255,255,.18);
}
.auth {
  display: flex;
  gap: .5rem;
  align-items: center;
}
.who {
  font-size: .9rem;
  opacity: .9;
}
</style>
