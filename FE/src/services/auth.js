import axios from "axios";
import { reactive } from "vue";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3001";

const STORAGE_KEY = "stock_tracker_token";

// Reactive store – components can watch authStore.isLoggedIn
export const authStore = reactive({
  token: /** @type {string|null} */ (localStorage.getItem(STORAGE_KEY)),
  username: /** @type {string|null} */ (null),

  get isLoggedIn() {
    return !!this.token;
  },

  /** Call POST /api/auth/login, store token */
  async login(username, password) {
    const { data } = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      username,
      password,
    });
    this.token = data.accessToken;
    this.username = data.username;
    localStorage.setItem(STORAGE_KEY, data.accessToken);
    return data;
  },

  logout() {
    this.token = null;
    this.username = null;
    localStorage.removeItem(STORAGE_KEY);
  },

  /** Validate stored token on app boot — returns true if still valid */
  async checkSession() {
    if (!this.token) return false;
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      this.username = data.username;
      return true;
    } catch {
      this.logout();
      return false;
    }
  },
});

// ─── Axios interceptor – attach token to all requests automatically ────────

axios.interceptors.request.use((config) => {
  if (authStore.token) {
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Bearer ${authStore.token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    // If backend returns 401, auto-logout
    if (err.response?.status === 401) {
      const isLoginEndpoint = err.config?.url?.includes("/auth/login");
      if (!isLoginEndpoint) {
        authStore.logout();
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);
