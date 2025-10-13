import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import FirebaseSigninView from "../views/FirebaseSigninView.vue";
import FirebaseRegisterView from "../views/FirebaseRegisterView.vue";
import AdminView from "../views/AdminView.vue";
import { auth } from "../firebase";
import { getRole } from "../stores/auth";

import AddBookView from '@/views/AddBookView.vue'
import GetBookCountView from '../views/GetBookCountView.vue';


  

const routes = [
  { path: "/", name: "Home", component: HomeView },
  { path: "/FireLogin", name: "FireLogin", component: FirebaseSigninView },
  { path: "/FireRegister", name: "FireRegister", component: FirebaseRegisterView },
  // only admin 
  { path: "/admin", name: "Admin", component: AdminView, meta: { requiresAuth: true, role: "admin" } },


  {
    path: '/addbook',
    name: 'AddBook',
    component: AddBookView
  },
  {
    path: '/GetBookCount',
    name: 'GetBookCount',
    component: GetBookCountView
  },
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




// 2.1 引入 firebase-functions（v2 https）
const { onRequest } = require('firebase-functions/v2/https');
// 2.2 引入 Firebase Admin 以访问 Firestore
const admin = require('firebase-admin');
// 2.3 处理 CORS
const cors = require('cors')({ origin: true });

admin.initializeApp();

// 2.4 创建函数：countBooks
exports.countBooks = onRequest((req, res) => {
  // 允许跨域
  cors(req, res, async () => {
    try {
      // 2.5 基于关键字 "books" 读取集合
      const booksCollection = admin.firestore().collection('books');
      const snapshot = await booksCollection.get();
      const count = snapshot.size;

      // 成功返回
      res.status(200).send({ count });
    } catch (error) {
      // 2.6 try/catch 处理异常
      console.error('Error counting books:', error.message);
      res.status(500).send('Error counting books');
    }
  });
});


export default router;
