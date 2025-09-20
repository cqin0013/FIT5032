import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import FirebaseSigninView from "../views/FirebaseSigninView.vue";
import FirebaseRegisterView from "../views/FirebaseRegisterView.vue";
import AdminView from "../views/AdminView.vue";
import { auth } from "../firebase";
import { getRole } from "../stores/auth";

const routes = [
  { path: "/", name: "Home", component: HomeView },
  { path: "/FireLogin", name: "FireLogin", component: FirebaseSigninView },
  { path: "/FireRegister", name: "FireRegister", component: FirebaseRegisterView },
  // only admin 
  { path: "/admin", name: "Admin", component: AdminView, meta: { requiresAuth: true, role: "admin" } },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, _from, next) => {
  const user = auth.currentUser;
  if (to.meta.requiresAuth && !user) return next({ name: "FireLogin" });
  if (to.meta.role) {
    const role = getRole();
    if (role !== to.meta.role) return next({ name: "Home" });
  }
  next();
});

export default router;
