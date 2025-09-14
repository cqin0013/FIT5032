import { createRouter, createWebHistory } from "vue-router";

// Views
import HomeView from "../views/HomeView.vue";
import AboutView from "../views/AboutView.vue";
import LoginView from "../views/LoginView.vue";
import FirebaseSigninView from "../views/FirebaseSigninView.vue";
import FirebaseRegisterView from "../views/FirebaseRegisterView.vue";

// Auth & role helpers
import { auth } from "../firebase";
import { getRole } from "../stores/auth";
import { onAuthStateChanged } from "firebase/auth";


function getCurrentUser() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "Home", component: HomeView },

    // Protected page example: only "admin" can access About
    { path: "/about", name: "About", component: AboutView, meta: { requiresAuth: true, role: "admin" } },

    // Optional legacy login (main flow uses Firebase routes below)
    { path: "/login", name: "Login", component: LoginView },

    // Firebase auth routes
    { path: "/FireLogin", name: "FireLogin", component: FirebaseSigninView },
    { path: "/FireRegister", name: "FireRegister", component: FirebaseRegisterView },

    // Fallback
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});

// Global guard: checks auth and role requirements
router.beforeEach(async (to) => {
  // Require authentication
  if (to.meta.requiresAuth) {
    const user = auth.currentUser || (await getCurrentUser());
    if (!user) {
      return { name: "FireLogin", query: { redirect: to.fullPath } };
    }
  }

  // Require specific role
  if (to.meta.role) {
    const role = getRole(); // role should be stored after login
    if (role !== to.meta.role) {
      return { name: "Home" };
    }
  }

  // Allow navigation
  return true;
});

export default router;
