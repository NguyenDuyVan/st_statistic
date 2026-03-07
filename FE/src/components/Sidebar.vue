<template>
  <nav class="sidebar">
    <!-- Logo -->
    <div class="sidebar-header">
      <div class="logo-icon">
        <i class="pi pi-chart-line"></i>
      </div>
      <div class="logo-text">
        <span class="logo-main">Stock</span>
        <span class="logo-sub">Tracker</span>
      </div>
    </div>

    <!-- Navigation -->
    <ul class="nav-list">
      <li v-for="item in menuItems" :key="item.path">
        <router-link :to="item.path" class="nav-item" active-class="active">
          <i :class="['nav-icon', item.icon]"></i>
          <span class="nav-label">{{ item.label }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        </router-link>
      </li>
    </ul>

    <!-- Session status -->
    <div class="sidebar-footer">
      <div
        :class="['session-pill', inSession ? 'session-open' : 'session-closed']"
      >
        <span class="session-dot"></span>
        <span>{{ inSession ? "Phiên mở" : "Ngoài phiên" }}</span>
      </div>
      <p class="session-time">09:00 – 14:45</p>

      <!-- User info + logout -->
      <div class="user-row">
        <div class="user-info">
          <i class="pi pi-user"></i>
          <span class="username">{{ authStore.username ?? "admin" }}</span>
        </div>
        <button class="logout-btn" @click="handleLogout" title="Đăng xuất">
          <i class="pi pi-sign-out"></i>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { authStore } from "../services/auth.js";

const router = useRouter();

const menuItems = [
  { path: "/dashboard", icon: "pi pi-home", label: "Dashboard" },
  { path: "/tracker", icon: "pi pi-bolt", label: "Stock Tracker" },
  { path: "/settings", icon: "pi pi-cog", label: "Settings" },
];

const now = ref(new Date());
let timer;

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date();
  }, 10_000);
});

onUnmounted(() => clearInterval(timer));

const inSession = computed(() => {
  const h = now.value.getHours();
  const m = now.value.getMinutes();
  const totalMin = h * 60 + m;
  return totalMin >= 9 * 60 && totalMin <= 14 * 60 + 45;
});

function handleLogout() {
  authStore.logout();
  router.push("/login");
}
</script>

<style scoped>
.sidebar {
  width: 220px;
  min-height: 100vh;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  color: #cbd5e1;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  flex-shrink: 0;
}

/* Header */
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1.25rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.logo-icon {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: white;
  flex-shrink: 0;
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.logo-main {
  font-size: 1rem;
  font-weight: 700;
  color: #f1f5f9;
}

.logo-sub {
  font-size: 0.7rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Nav */
.nav-list {
  list-style: none;
  padding: 1rem 0.75rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.875rem;
  border-radius: 8px;
  text-decoration: none;
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 500;
  transition:
    background 0.15s,
    color 0.15s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #f1f5f9;
}

.nav-item.active {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.nav-icon {
  font-size: 0.95rem;
  width: 18px;
  text-align: center;
  flex-shrink: 0;
}

.nav-label {
  flex: 1;
}

.nav-badge {
  background: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 99px;
}

/* Footer */
.sidebar-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.session-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  font-weight: 600;
}

.session-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.session-open .session-dot {
  background: #22c55e;
  box-shadow: 0 0 6px #22c55e;
}

.session-open {
  color: #86efac;
}

.session-closed .session-dot {
  background: #ef4444;
}

.session-closed {
  color: #fca5a5;
}

.session-time {
  font-size: 0.72rem;
  color: #475569;
}

.user-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  color: #94a3b8;
}

.username {
  font-weight: 600;
  color: #cbd5e1;
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  font-size: 0.9rem;
  padding: 0.25rem;
  border-radius: 6px;
  transition:
    color 0.15s,
    background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}
</style>
