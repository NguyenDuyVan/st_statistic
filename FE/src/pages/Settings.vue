<template>
  <div class="settings-page">
    <div class="page-header">
      <h1 class="page-title"><i class="pi pi-cog"></i> Settings</h1>
      <p class="page-sub">Cấu hình backend và Telegram alerts</p>
    </div>

    <div class="settings-grid">
      <!-- Backend -->
      <div class="card settings-section">
        <h2 class="section-title">
          <i class="pi pi-server"></i> Backend Connection
        </h2>

        <div class="field">
          <label>Backend URL</label>
          <div class="input-with-btn">
            <input
              v-model="form.backendUrl"
              type="text"
              placeholder="http://localhost:3001"
              class="field-input"
            />
            <button class="btn btn-sm btn-primary" @click="testConnection">
              <i class="pi pi-wifi"></i>
              Test
            </button>
          </div>
          <p class="field-hint">
            URL của NestJS backend. Mặc định: http://localhost:3001
          </p>
        </div>

        <div
          v-if="connStatus !== null"
          :class="['conn-result', connStatus ? 'ok' : 'err']"
        >
          <i
            :class="connStatus ? 'pi pi-check-circle' : 'pi pi-times-circle'"
          ></i>
          {{ connStatus ? "Kết nối thành công" : "Không thể kết nối backend" }}
        </div>
      </div>

      <!-- Telegram -->
      <div class="card settings-section">
        <h2 class="section-title">
          <i class="pi pi-send"></i> Telegram Alerts
        </h2>

        <p class="field-hint" style="margin-bottom: 0.75rem">
          Bot Token và Chat ID được cấu hình qua file <code>.env</code> trên
          server.
        </p>

        <button class="btn btn-sm btn-primary" @click="testTelegram">
          <i class="pi pi-paper-plane"></i> Gửi tin nhắn thử
        </button>

        <div
          v-if="telegramStatus !== null"
          :class="['conn-result', telegramStatus ? 'ok' : 'err']"
          style="margin-top: 0.5rem"
        >
          <i
            :class="
              telegramStatus ? 'pi pi-check-circle' : 'pi pi-times-circle'
            "
          ></i>
          {{
            telegramStatus
              ? "Gửi thành công"
              : "Gửi thất bại – kiểm tra token & chat id"
          }}
        </div>
      </div>

      <!-- Polling -->
      <div class="card settings-section">
        <h2 class="section-title">
          <i class="pi pi-clock"></i> Polling Settings
        </h2>

        <div class="field">
          <label>Poll interval (giây)</label>
          <input
            v-model.number="form.pollInterval"
            type="number"
            min="1"
            max="60"
            class="field-input"
            style="width: 100px"
          />
          <p class="field-hint">Thời gian poll API SSI. Tối thiểu 1 giây.</p>
        </div>

        <div class="field">
          <label>Max trades giữ trong FE</label>
          <input
            v-model.number="form.maxTrades"
            type="number"
            min="100"
            max="5000"
            step="100"
            class="field-input"
            style="width: 100px"
          />
          <p class="field-hint">Số lệnh khớp tối đa hiển thị trong biểu đồ.</p>
        </div>
      </div>

      <!-- About / info -->
      <div class="card settings-section">
        <h2 class="section-title">
          <i class="pi pi-info-circle"></i> Thông tin hệ thống
        </h2>
        <div class="info-list">
          <div class="info-row" v-for="item in infoItems" :key="item.key">
            <span class="info-key">{{ item.key }}</span>
            <span class="info-val">{{ item.val }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Save button -->
    <div class="save-bar">
      <button class="btn btn-success" @click="save">
        <i class="pi pi-check"></i> Lưu cài đặt
      </button>
      <span v-if="savedMsg" class="saved-msg">
        <i class="pi pi-check-circle"></i> {{ savedMsg }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";

const STORAGE_KEY = "stock_tracker_settings";

const form = reactive({
  backendUrl: "http://localhost:3001",
  pollInterval: 1,
  maxTrades: 500,
});

const connStatus = ref(null);
const telegramStatus = ref(null);
const savedMsg = ref("");

const infoItems = [
  { key: "API nguồn", val: "SSI iBoard – iboard-query.ssi.com.vn" },
  { key: "Frontend", val: "Vue 3 + Vite + PrimeVue + ECharts" },
  { key: "Backend", val: "Node.js + NestJS + Socket.io" },
  { key: "Phiên giao dịch", val: "09:00 – 14:45 (GMT+7)" },
  { key: "Cooldown tín hiệu", val: "30 giây / tín hiệu / mã" },
];

onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) Object.assign(form, JSON.parse(saved));
  } catch {}
});

async function testConnection() {
  connStatus.value = null;
  try {
    const url = form.backendUrl.replace(/\/$/, "");
    await axios.get(`${url}/api/tracker/status`, { timeout: 4000 });
    connStatus.value = true;
  } catch {
    connStatus.value = false;
  }
}

async function testTelegram() {
  telegramStatus.value = null;
  try {
    const url = form.backendUrl.replace(/\/$/, "");
    await axios.post(`${url}/api/tracker/test-telegram`);
    telegramStatus.value = true;
  } catch {
    telegramStatus.value = false;
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...form }));
  savedMsg.value = "Đã lưu!";
  setTimeout(() => (savedMsg.value = ""), 2500);
}
</script>

<style scoped>
.settings-page {
  padding: 1.5rem;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-sub {
  font-size: 0.82rem;
  color: #64748b;
  margin-top: 0.2rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.settings-section {
  padding: 1.25rem;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.375rem;
}

.field-input {
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #1e293b;
  outline: none;
  transition: border-color 0.15s;
}

.field-input:focus {
  border-color: #3b82f6;
}

.field-hint {
  font-size: 0.73rem;
  color: #94a3b8;
  margin-top: 0.3rem;
}

.field-hint a {
  color: #3b82f6;
  text-decoration: none;
}

.input-with-btn {
  display: flex;
  gap: 0.5rem;
}

.input-with-btn .field-input {
  flex: 1;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.4rem 0.75rem;
  font-size: 0.78rem;
}

.btn-primary {
  background: #3b82f6;
  color: #fff;
}
.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-success {
  background: #22c55e;
  color: #fff;
}
.btn-success:hover {
  background: #16a34a;
}

.conn-result {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  margin-top: 0.5rem;
}

.conn-result.ok {
  background: #dcfce7;
  color: #166534;
}
.conn-result.err {
  background: #fee2e2;
  color: #991b1b;
}

/* Info list */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  gap: 0.75rem;
}

.info-key {
  color: #94a3b8;
  font-weight: 500;
  flex-shrink: 0;
}

.info-val {
  color: #334155;
  font-weight: 600;
  text-align: right;
}

/* Save bar */
.save-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
}

.saved-msg {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: #16a34a;
}
</style>
