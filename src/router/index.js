// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import FirebaseSigninView from "../views/FirebaseSigninView.vue";
import FirebaseRegisterView from "../views/FirebaseRegisterView.vue";
import AdminView from "../views/AdminView.vue";
import { auth } from "../firebase";
import { getRole } from "../stores/auth";

import AddBookView from "@/views/AddBookView.vue";
import GetBookCountView from "../views/GetBookCountView.vue";

import BooksTableView from "../views/BooksTableView.vue";
import AuthorsTableView from "../views/AuthorsTableView.vue";
import GeoLocationView from "../views/GeoLocationView.vue";
import EmailView from "../views/EmailView.vue";
import AboutView from "../views/AboutView.vue";

const routes = [
  { path: "/", name: "Home", component: HomeView },
  { path: "/about", name: "About", component: AboutView },

  { path: "/FireLogin", name: "FireLogin", component: FirebaseSigninView },
  { path: "/FireRegister", name: "FireRegister", component: FirebaseRegisterView },

  // 管理端（仅 admin）
  { path: "/admin", name: "Admin", component: AdminView, meta: { requiresAuth: true, role: "admin" } },

  // 示例/工具
  { path: "/addbook", name: "AddBook", component: AddBookView },
  { path: "/GetBookCount", name: "GetBookCount", component: GetBookCountView },

  // 主要功能页面（心理健康主题）
  { path: "/BooksTable", name: "BooksTable", component: BooksTableView },       // Resources
  { path: "/AuthorsTable", name: "AuthorsTable", component: AuthorsTableView }, // Coping Tips
  { path: "/Geo", name: "Geo", component: GeoLocationView },                    // Find Support
  { path: "/Email", name: "Email", component: EmailView }, // 私密留言
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
