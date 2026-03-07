<template>
  <div class="login-bg">
    <div class="login-card">
      <!-- Logo -->
      <div class="login-logo">
        <div class="logo-icon">
          <i class="pi pi-chart-line"></i>
        </div>
        <h1 class="login-title">Stock Tracker</h1>
        <p class="login-sub">T0 Smart Money System</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="field">
          <label for="username">Tên đăng nhập</label>
          <div class="input-wrap">
            <i class="pi pi-user input-icon"></i>
            <input
              id="username"
              v-model="form.username"
              type="text"
              autocomplete="username"
              placeholder="admin"
              class="field-input"
              :disabled="loading"
              required
            />
          </div>
        </div>

        <div class="field">
          <label for="password">Mật khẩu</label>
          <div class="input-wrap">
            <i class="pi pi-lock input-icon"></i>
            <input
              id="password"
              v-model="form.password"
              :type="showPass ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••••"
              class="field-input"
              :disabled="loading"
              required
            />
            <button
              type="button"
              class="pass-toggle"
              @click="showPass = !showPass"
              tabindex="-1"
            >
              <i :class="showPass ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
        </div>

        <div v-if="error" class="error-msg">
          <i class="pi pi-exclamation-circle"></i>
          {{ error }}
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="loading">
            <i class="pi pi-spinner pi-spin"></i> Đang đăng nhập...
          </span>
          <span v-else> <i class="pi pi-sign-in"></i> Đăng nhập </span>
        </button>
      </form>

      <p class="login-hint">Hệ thống chỉ dành cho quản trị viên</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { authStore } from "../services/auth.js";

const router = useRouter();

const form = reactive({ username: "", password: "" });
const loading = ref(false);
const error = ref("");
const showPass = ref(false);

async function handleLogin() {
  error.value = "";
  loading.value = true;

  try {
    await authStore.login(form.username, form.password);
    const redirect = router.currentRoute.value.query.redirect || "/tracker";
    router.push(redirect);
  } catch (e) {
    error.value =
      e.response?.data?.message ?? "Sai tên đăng nhập hoặc mật khẩu";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.login-card {
  width: 100%;
  max-width: 380px;
  background: #fff;
  border-radius: 20px;
  padding: 2.25rem 2rem;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
}

/* Logo */
.login-logo {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.7rem;
  color: #fff;
  margin-bottom: 0.875rem;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
}

.login-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.3px;
}

.login-sub {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 0.2rem;
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.field label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
}

.input-wrap {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.9rem;
  pointer-events: none;
}

.field-input {
  width: 100%;
  padding: 0.65rem 2.5rem 0.65rem 2.25rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #1e293b;
  outline: none;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
  background: #f8fafc;
}

.field-input:focus {
  border-color: #3b82f6;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.field-input:disabled {
  opacity: 0.6;
}

.pass-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 0.2rem;
  font-size: 0.85rem;
  transition: color 0.15s;
}

.pass-toggle:hover {
  color: #475569;
}

.error-msg {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: #dc2626;
  background: #fee2e2;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-weight: 500;
}

.btn-login {
  padding: 0.75rem;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    opacity 0.15s,
    transform 0.1s;
  margin-top: 0.25rem;
}

.btn-login:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-hint {
  text-align: center;
  font-size: 0.72rem;
  color: #cbd5e1;
  margin-top: 1.25rem;
}
</style>
