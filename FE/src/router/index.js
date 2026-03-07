import { createRouter, createWebHistory } from "vue-router";
import { authStore } from "../services/auth.js";
import Dashboard from "../pages/Dashboard.vue";
import StockTracker from "../pages/StockTracker.vue";
import Settings from "../pages/Settings.vue";
import Login from "../pages/Login.vue";

const routes = [
  { path: "/", redirect: "/tracker" },
  {
    path: "/login",
    component: Login,
    meta: { title: "Đăng nhập", public: true },
  },
  { path: "/dashboard", component: Dashboard, meta: { title: "Dashboard" } },
  {
    path: "/tracker",
    component: StockTracker,
    meta: { title: "Stock Tracker" },
  },
  { path: "/settings", component: Settings, meta: { title: "Settings" } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  if (!to.meta.public && !authStore.isLoggedIn) {
    return next({ path: "/login", query: { redirect: to.fullPath } });
  }
  if (to.path === "/login" && authStore.isLoggedIn) {
    return next("/tracker");
  }
  next();
});

router.afterEach((to) => {
  document.title = `${to.meta.title ?? "Stock"} | Stock Tracker`;
});

export default router;
