<template>
  <div class="tracker-page">
    <!-- Page header -->
    <div class="page-header">
      <div>
        <h1 class="page-title"><i class="pi pi-bolt"></i> Stock Tracker T0</h1>
        <p class="page-sub">
          Theo dõi lệnh khớp realtime • Phát hiện smart money
        </p>
      </div>
      <div :class="['session-badge', inSession ? 'open' : 'closed']">
        <span class="s-dot"></span>
        {{
          inSession ? "Phiên đang mở (09:00–14:45)" : "Ngoài phiên giao dịch"
        }}
      </div>
    </div>

    <!-- Control panel -->
    <div class="card control-card">
      <div class="control-row">
        <div class="input-wrap">
          <i class="pi pi-search input-icon"></i>
          <input
            v-model="symbolInput"
            type="text"
            placeholder="Nhập mã CP, cách nhau bằng dấu phẩy (ACB,VCB,HPG)"
            class="sym-input"
            @keyup.enter="handleStart"
          />
        </div>

        <div class="control-buttons">
          <button
            v-if="!isTracking"
            class="btn btn-success"
            @click="handleStart"
            :disabled="!symbolInput.trim()"
          >
            <i class="pi pi-play"></i> Bắt đầu
          </button>
          <button v-else class="btn btn-danger" @click="handleStop">
            <i class="pi pi-stop"></i> Dừng
          </button>
          <button
            class="btn btn-secondary"
            @click="handleExport"
            :disabled="!hasData"
          >
            <i class="pi pi-download"></i> Xuất JSON
          </button>
        </div>
      </div>

      <!-- Status bar -->
      <div v-if="isTracking" class="status-bar">
        <span class="status-dot"></span>
        <span>Đang theo dõi:</span>
        <div class="sym-chips">
          <button
            v-for="sym in trackedSymbols"
            :key="sym"
            :class="['sym-chip', selectedSymbol === sym ? 'active' : '']"
            @click="switchSymbol(sym)"
          >
            {{ sym }}
            <span v-if="tradeCounts[sym]" class="chip-count">{{
              tradeCounts[sym]
            }}</span>
          </button>
        </div>
        <span class="be-status" :class="beConnected ? 'be-ok' : 'be-err'">
          <i :class="beConnected ? 'pi pi-wifi' : 'pi pi-wifi-off'"></i>
          {{ beConnected ? "Connected" : "Disconnected" }}
        </span>
      </div>
    </div>

    <!-- Main content -->
    <div v-if="selectedSymbol" class="tracker-content">
      <!-- Summary stats row -->
      <div class="stats-row">
        <div class="stat-box">
          <div class="stat-label">Giá mới nhất</div>
          <div class="stat-val price">{{ latestPrice }}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Tổng lệnh</div>
          <div class="stat-val">{{ currentTrades.length }}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Mua / Bán</div>
          <div class="stat-val">
            <span class="up">{{ buyCount }}</span> /
            <span class="dn">{{ sellCount }}</span>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Tổng GT (B)</div>
          <div class="stat-val">{{ totalValue }}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Tín hiệu hôm nay</div>
          <div class="stat-val signal-cnt">{{ currentSignals.length }}</div>
        </div>
      </div>

      <!-- Two-column: chart + signal panel -->
      <div class="two-col">
        <div class="col-main">
          <StockChart :trades="currentTrades" :symbol="selectedSymbol" />
        </div>
        <div class="col-side">
          <SignalPanel :signals="currentSignals" />
        </div>
      </div>

      <!-- Trade table -->
      <TradeTable :trades="currentTrades" />
    </div>

    <!-- Empty / initial state -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <i class="pi pi-bolt"></i>
      </div>
      <h3>Nhập mã cổ phiếu và nhấn Bắt đầu</h3>
      <p>
        Hệ thống sẽ poll lệnh khớp mỗi 1 giây và phát hiện tín hiệu smart money
        trong phiên 09:00 – 14:45
      </p>
      <div class="feature-list">
        <div class="feature-item" v-for="f in features" :key="f.label">
          <i :class="['fi', f.icon]"></i>
          <span>{{ f.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { trackerApi } from "../services/trackerApi.js";
import TradeTable from "../components/TradeTable.vue";
import StockChart from "../components/StockChart.vue";
import SignalPanel from "../components/SignalPanel.vue";

// ─── State ────────────────────────────────────────────────────────────────
const symbolInput = ref("ACB");
const isTracking = ref(false);
const trackedSymbols = ref([]);
const selectedSymbol = ref(null);
const tradesMap = ref({});
const signalsMap = ref({});
const beConnected = ref(false);

// ─── Computed ─────────────────────────────────────────────────────────────
const currentTrades = computed(() =>
  selectedSymbol.value ? (tradesMap.value[selectedSymbol.value] ?? []) : [],
);

const currentSignals = computed(() =>
  selectedSymbol.value ? (signalsMap.value[selectedSymbol.value] ?? []) : [],
);

const hasData = computed(() =>
  Object.values(tradesMap.value).some((t) => t.length > 0),
);

const tradeCounts = computed(() => {
  const out = {};
  trackedSymbols.value.forEach((sym) => {
    out[sym] = tradesMap.value[sym]?.length ?? 0;
  });
  return out;
});

const latestPrice = computed(() => {
  const list = currentTrades.value;
  if (!list.length) return "–";
  return (list[list.length - 1].price ?? 0).toLocaleString("vi-VN");
});

const buyCount = computed(
  () => currentTrades.value.filter((t) => t.side === "bu").length,
);
const sellCount = computed(
  () => currentTrades.value.filter((t) => t.side === "sd").length,
);
const totalValue = computed(() =>
  (currentTrades.value.reduce((s, t) => s + (t.value ?? 0), 0) / 1e9).toFixed(
    2,
  ),
);

const inSession = computed(() => {
  const now = new Date();
  const totalMin = now.getHours() * 60 + now.getMinutes();
  return totalMin >= 9 * 60 && totalMin <= 14 * 60 + 45;
});

const features = [
  { icon: "pi pi-chart-bar", label: "Phát hiện Large Trade" },
  { icon: "pi pi-bolt", label: "Volume Spike & Money Flow" },
  { icon: "pi pi-shield", label: "Buy Pressure & Breakout" },
  { icon: "pi pi-eye-slash", label: "Absorption & Iceberg" },
  { icon: "pi pi-send", label: "Cảnh báo Telegram realtime" },
];

// ─── Methods ──────────────────────────────────────────────────────────────
async function handleStart() {
  const symbols = symbolInput.value
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  if (!symbols.length) return;

  try {
    await trackerApi.startTracking(symbols);
    trackedSymbols.value = symbols;

    symbols.forEach((sym) => {
      if (!tradesMap.value[sym]) tradesMap.value[sym] = [];
      if (!signalsMap.value[sym]) signalsMap.value[sym] = [];
    });

    selectedSymbol.value = symbols[0];
    isTracking.value = true;
  } catch (e) {
    console.error("Start tracking failed:", e.message);
    alert("Không thể kết nối backend. Hãy khởi động BE trước.");
  }
}

async function handleStop() {
  try {
    await trackerApi.stopTracking();
  } catch {}
  isTracking.value = false;
  trackedSymbols.value = [];
  selectedSymbol.value = null;
}

function switchSymbol(sym) {
  selectedSymbol.value = sym;
}

async function handleExport() {
  try {
    const result = await trackerApi.exportData();
    const blob = new Blob([JSON.stringify(result.data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename ?? "trades.json";
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    alert("Xuất dữ liệu thất bại: " + e.message);
  }
}

// ─── WebSocket lifecycle ──────────────────────────────────────────────────
let unsubTrade, unsubSignal;

onMounted(async () => {
  trackerApi.connect();
  beConnected.value = trackerApi.isConnected;

  // Listen for connection changes (poll)
  const connTimer = setInterval(() => {
    beConnected.value = trackerApi.isConnected;
  }, 2_000);

  unsubTrade = trackerApi.onTrade((symbol, trade) => {
    if (!tradesMap.value[symbol]) tradesMap.value[symbol] = [];
    tradesMap.value[symbol].push(trade);
    // Keep last 500 in FE memory for charts
    if (tradesMap.value[symbol].length > 500) {
      tradesMap.value[symbol] = tradesMap.value[symbol].slice(-500);
    }
    if (!trackedSymbols.value.includes(symbol)) {
      trackedSymbols.value = [...trackedSymbols.value, symbol];
    }
  });

  unsubSignal = trackerApi.onSignal((symbol, signal) => {
    if (!signalsMap.value[symbol]) signalsMap.value[symbol] = [];
    signalsMap.value[symbol] = [signal, ...signalsMap.value[symbol]].slice(
      0,
      50,
    );
  });

  // Restore tracking state if BE already running
  try {
    const status = await trackerApi.getStatus();
    if (status.isTracking && status.symbols?.length) {
      isTracking.value = true;
      trackedSymbols.value = status.symbols;
      selectedSymbol.value = status.symbols[0];
      symbolInput.value = status.symbols.join(",");
      status.symbols.forEach((sym) => {
        if (!tradesMap.value[sym]) tradesMap.value[sym] = [];
        if (!signalsMap.value[sym]) signalsMap.value[sym] = [];
      });
    }
  } catch {}

  onUnmounted(() => {
    clearInterval(connTimer);
    unsubTrade?.();
    unsubSignal?.();
  });
});

onUnmounted(() => {
  unsubTrade?.();
  unsubSignal?.();
});
</script>

<style scoped>
.tracker-page {
  min-height: 100vh;
  padding: 1.5rem;
}

/* Header */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
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

.session-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.4rem 0.875rem;
  border-radius: 99px;
}

.session-badge.open {
  background: #dcfce7;
  color: #166534;
}
.session-badge.closed {
  background: #fee2e2;
  color: #991b1b;
}

.s-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

/* Card */
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.control-card {
  padding: 1.25rem;
  margin-bottom: 1.25rem;
}

.control-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.input-wrap {
  flex: 1;
  min-width: 240px;
  position: relative;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.9rem;
}

.sym-input {
  width: 100%;
  padding: 0.6rem 0.75rem 0.6rem 2.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s;
  color: #1e293b;
}

.sym-input:focus {
  border-color: #3b82f6;
}

.control-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-success {
  background: #22c55e;
  color: #fff;
}
.btn-success:hover:not(:disabled) {
  background: #16a34a;
}

.btn-danger {
  background: #ef4444;
  color: #fff;
}
.btn-danger:hover {
  background: #dc2626;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}
.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
}

/* Status bar */
.status-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.875rem;
  padding-top: 0.875rem;
  border-top: 1px solid #f1f5f9;
  font-size: 0.8rem;
  color: #64748b;
  flex-wrap: wrap;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  animation: pulse 1.5s infinite;
  flex-shrink: 0;
}

.sym-chips {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.sym-chip {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 99px;
  background: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  color: #475569;
  transition: all 0.15s;
}

.sym-chip:hover {
  background: #f1f5f9;
}

.sym-chip.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #fff;
}

.chip-count {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 99px;
  padding: 0 0.35rem;
  font-size: 0.68rem;
}

.sym-chip:not(.active) .chip-count {
  background: #e2e8f0;
  color: #64748b;
}

.be-status {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: auto;
}

.be-ok {
  color: #16a34a;
}
.be-err {
  color: #dc2626;
}

/* Stats row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.stat-box {
  background: #fff;
  border-radius: 10px;
  padding: 0.875rem 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.stat-label {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.3rem;
}

.stat-val {
  font-size: 1.2rem;
  font-weight: 800;
  color: #1e293b;
}

.stat-val.price {
  color: #3b82f6;
}

.up {
  color: #16a34a;
}
.dn {
  color: #dc2626;
}
.signal-cnt {
  color: #f59e0b;
}

/* Two-column layout */
.two-col {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

@media (max-width: 900px) {
  .two-col {
    grid-template-columns: 1fr;
  }
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 5rem 2rem;
  text-align: center;
  color: #94a3b8;
}

.empty-icon {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
}

.empty-state h3 {
  font-size: 1.1rem;
  color: #475569;
  font-weight: 700;
  margin-top: 0.5rem;
}

.empty-state p {
  font-size: 0.85rem;
  max-width: 460px;
  line-height: 1.6;
}

.feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.75rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.875rem;
  background: #f1f5f9;
  border-radius: 99px;
  font-size: 0.78rem;
  color: #475569;
  font-weight: 500;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
