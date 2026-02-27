<template>
  <div class="comparison-section mb-6">
    <!-- Header -->
    <div class="cs-header">
      <div class="flex items-center gap-3">
        <div class="cs-icon">
          <i class="pi pi-arrows-h"></i>
        </div>
        <div>
          <h2 class="cs-title">So Sánh Tự Doanh & Khối Ngoại</h2>
          <p class="cs-sub">{{ symbol }} — Giao dịch ròng theo từng phiên</p>
        </div>
      </div>
    </div>

    <!-- Summary cards -->
    <div class="cs-cards-row">
      <!-- Tự doanh card -->
      <div class="actor-card prop-card">
        <div class="actor-card-header">
          <div class="actor-dot prop-dot"></div>
          <span class="actor-name">Tự Doanh (Proprietary)</span>
        </div>
        <div class="actor-stats">
          <div class="astat">
            <p class="astat-label">Mua ròng lũy kế</p>
            <p class="astat-value" :class="netClass(totalPropNet)">
              {{ signedBil(totalPropNet) }}
            </p>
          </div>
          <div class="astat">
            <p class="astat-label">Ròng qua khớp lệnh</p>
            <p class="astat-value" :class="netClass(totalPropDeal)">
              {{ signedBil(totalPropDeal) }}
            </p>
          </div>
          <div class="astat">
            <p class="astat-label">Ròng thỏa thuận</p>
            <p class="astat-value" :class="netClass(totalPropPT)">
              {{ signedBil(totalPropPT) }}
            </p>
          </div>
          <div class="astat">
            <p class="astat-label">Phiên mua ròng nhiều nhất</p>
            <p class="astat-value text-green-600">
              {{ signedBil(maxPropBuySession?.propTradingNetValue) }}
            </p>
            <p class="astat-date">{{ fmtDate(maxPropBuySession?.date) }}</p>
          </div>
          <div class="astat">
            <p class="astat-label">Phiên bán ròng nhiều nhất</p>
            <p class="astat-value text-red-500">
              {{ signedBil(minPropSellSession?.propTradingNetValue) }}
            </p>
            <p class="astat-date">{{ fmtDate(minPropSellSession?.date) }}</p>
          </div>
        </div>
      </div>

      <!-- VS divider -->
      <div class="vs-divider">
        <div class="vs-badge">VS</div>
        <div class="vs-compare">
          <div class="vs-row">
            <span class="vs-label">Ai mua ròng hơn?</span>
            <span class="vs-winner" :class="dominantClass">{{ dominant }}</span>
          </div>
          <div class="vs-row">
            <span class="vs-label">Chênh lệch</span>
            <span class="vs-diff">{{
              signedBil(Math.abs(totalPropNet - totalForeignNet))
            }}</span>
          </div>
          <div class="vs-bar-wrap">
            <div class="vs-bar-label">Tự doanh</div>
            <div class="vs-bar-track">
              <div
                class="vs-bar-fill prop-fill"
                :style="{ width: propPct + '%' }"
              ></div>
            </div>
            <div class="vs-bar-label right">Khối ngoại</div>
            <div class="vs-bar-track">
              <div
                class="vs-bar-fill foreign-fill"
                :style="{ width: foreignPct + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Khối ngoại card -->
      <div class="actor-card foreign-card">
        <div class="actor-card-header">
          <div class="actor-dot foreign-dot"></div>
          <span class="actor-name">Khối Ngoại (Foreign)</span>
        </div>
        <div class="actor-stats">
          <div class="astat">
            <p class="astat-label">Mua ròng lũy kế (KL)</p>
            <p class="astat-value" :class="netClass(totalForeignNetQty)">
              {{ signedQty(totalForeignNetQty) }}
            </p>
          </div>
          <div class="astat">
            <p class="astat-label">Mua ròng lũy kế (GT)</p>
            <p class="astat-value" :class="netClass(totalForeignNet)">
              {{ signedBil(totalForeignNet) }}
            </p>
          </div>
          <div class="astat">
            <p class="astat-label">Tổng mua</p>
            <p class="astat-value text-green-600">
              {{ fmtBil(totalForeignBuyVal) }}
            </p>
          </div>
          <div class="astat">
            <p class="astat-label">Phiên mua nhiều nhất</p>
            <p class="astat-value text-green-600">
              {{ fmtQty(maxForeignBuySession?.buyForeignQuantity) }}
            </p>
            <p class="astat-date">{{ fmtDate(maxForeignBuySession?.date) }}</p>
          </div>
          <div class="astat">
            <p class="astat-label">Phiên bán nhiều nhất</p>
            <p class="astat-value text-red-500">
              {{ fmtQty(maxForeignSellSession?.sellForeignQuantity) }}
            </p>
            <p class="astat-date">{{ fmtDate(maxForeignSellSession?.date) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="cs-charts-row">
      <!-- Net value per session bar chart -->
      <div class="cs-chart-panel">
        <div class="cs-chart-header">
          <i class="pi pi-chart-bar" style="color: #6366f1"></i>
          <span>Giá trị mua ròng theo phiên</span>
        </div>
        <div class="cs-chart-body">
          <Chart
            type="bar"
            :data="netBarData"
            :options="netBarOptions"
            class="the-chart"
          />
        </div>
      </div>

      <!-- Cumulative net line chart -->
      <div class="cs-chart-panel">
        <div class="cs-chart-header">
          <i class="pi pi-chart-line" style="color: #f59e0b"></i>
          <span>Mua ròng lũy kế so sánh</span>
        </div>
        <div class="cs-chart-body">
          <Chart
            type="line"
            :data="cumulData"
            :options="cumulOptions"
            class="the-chart"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import Chart from "primevue/chart";

const props = defineProps({
  data: { type: Array, default: () => [] },
  symbol: { type: String, default: "" },
});

/* ── Helpers ── */
const fmtN = (n, dec = 0) =>
  n != null
    ? new Intl.NumberFormat("vi-VN", {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
      }).format(n)
    : "-";

const fmtBil = (n) => (n != null ? `${fmtN(n / 1_000_000_000, 2)} tỷ` : "-");
const fmtQty = (n) => (n != null ? `${fmtN(n)} CP` : "-");

const signedBil = (n) => {
  if (n == null) return "-";
  const s = fmtN(Math.abs(n) / 1_000_000_000, 2);
  return n >= 0 ? `+${s} tỷ` : `-${s} tỷ`;
};
const signedQty = (n) => {
  if (n == null) return "-";
  const s = fmtN(Math.abs(n));
  return n >= 0 ? `+${s} CP` : `-${s} CP`;
};

const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`;
};

const netClass = (n) =>
  n > 0 ? "text-green-600" : n < 0 ? "text-red-500" : "text-gray-500";

/* ── Prop trading aggregates ── */
const totalPropNet = computed(() =>
  props.data.reduce((s, d) => s + (d.propTradingNetValue || 0), 0),
);
const totalPropDeal = computed(() =>
  props.data.reduce((s, d) => s + (d.propTradingNetDealValue || 0), 0),
);
const totalPropPT = computed(() =>
  props.data.reduce((s, d) => s + (d.propTradingNetPTValue || 0), 0),
);

const maxPropBuySession = computed(() =>
  props.data.reduce(
    (m, d) =>
      d.propTradingNetValue > (m?.propTradingNetValue ?? -Infinity) ? d : m,
    null,
  ),
);
const minPropSellSession = computed(() =>
  props.data.reduce(
    (m, d) =>
      d.propTradingNetValue < (m?.propTradingNetValue ?? Infinity) ? d : m,
    null,
  ),
);

/* ── Foreign aggregates ── */
const totalForeignBuyVal = computed(() =>
  props.data.reduce((s, d) => s + (d.buyForeignValue || 0), 0),
);
const totalForeignSellVal = computed(() =>
  props.data.reduce((s, d) => s + (d.sellForeignValue || 0), 0),
);
const totalForeignNet = computed(
  () => totalForeignBuyVal.value - totalForeignSellVal.value,
);
const totalForeignNetQty = computed(() =>
  props.data.reduce(
    (s, d) => s + (d.buyForeignQuantity || 0) - (d.sellForeignQuantity || 0),
    0,
  ),
);

const maxForeignBuySession = computed(() =>
  props.data.reduce(
    (m, d) => (d.buyForeignQuantity > (m?.buyForeignQuantity ?? 0) ? d : m),
    null,
  ),
);
const maxForeignSellSession = computed(() =>
  props.data.reduce(
    (m, d) => (d.sellForeignQuantity > (m?.sellForeignQuantity ?? 0) ? d : m),
    null,
  ),
);

/* ── VS comparison ── */
const dominant = computed(() => {
  if (totalPropNet.value > totalForeignNet.value) return "Tự Doanh";
  if (totalForeignNet.value > totalPropNet.value) return "Khối Ngoại";
  return "Ngang nhau";
});
const dominantClass = computed(() => {
  if (dominant.value === "Tự Doanh") return "winner-prop";
  if (dominant.value === "Khối Ngoại") return "winner-foreign";
  return "";
});

const absMax = computed(
  () =>
    Math.max(Math.abs(totalPropNet.value), Math.abs(totalForeignNet.value)) ||
    1,
);
const propPct = computed(() =>
  Math.min(100, (Math.abs(totalPropNet.value) / absMax.value) * 100),
);
const foreignPct = computed(() =>
  Math.min(100, (Math.abs(totalForeignNet.value) / absMax.value) * 100),
);

/* ── Chart labels ── */
const labels = computed(() =>
  props.data.map((d) => {
    const dt = new Date(d.date);
    return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}`;
  }),
);

/* ── Cumulative series ── */
const propCumul = computed(() => {
  let s = 0;
  return props.data.map((d) => {
    s += d.propTradingNetValue || 0;
    return s;
  });
});
const foreignCumul = computed(() => {
  let s = 0;
  return props.data.map((d) => {
    s += (d.buyForeignValue || 0) - (d.sellForeignValue || 0);
    return s;
  });
});

/* ── Net bar chart ── */
const netBarData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      type: "bar",
      label: "Tự doanh (GT ròng)",
      data: props.data.map((d) => d.propTradingNetValue || 0),
      backgroundColor: props.data.map((d) =>
        (d.propTradingNetValue || 0) >= 0
          ? "rgba(99, 102, 241, 0.7)"
          : "rgba(99, 102, 241, 0.3)",
      ),
      borderColor: "#6366f1",
      borderWidth: 1,
      yAxisID: "y",
      order: 2,
    },
    {
      type: "bar",
      label: "Khối ngoại (GT ròng)",
      data: props.data.map(
        (d) => (d.buyForeignValue || 0) - (d.sellForeignValue || 0),
      ),
      backgroundColor: props.data.map((d) => {
        const v = (d.buyForeignValue || 0) - (d.sellForeignValue || 0);
        return v >= 0 ? "rgba(245, 158, 11, 0.7)" : "rgba(245, 158, 11, 0.3)";
      }),
      borderColor: "#f59e0b",
      borderWidth: 1,
      yAxisID: "y",
      order: 3,
    },
  ],
}));

const fmtBilAxis = (v) => {
  const abs = Math.abs(v);
  if (abs >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + "B";
  if (abs >= 1_000_000) return (v / 1_000_000).toFixed(0) + "M";
  return v;
};

const netBarOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: {
      position: "top",
      labels: { usePointStyle: true, padding: 12, font: { size: 12 } },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.dataset.label}: ${fmtBil(ctx.raw)}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { maxTicksLimit: 22, maxRotation: 45, font: { size: 11 } },
    },
    y: {
      title: { display: true, text: "Giá trị ròng (VND)", font: { size: 11 } },
      ticks: { callback: fmtBilAxis },
    },
  },
}));

/* ── Cumulative line chart ── */
const cumulData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: "Tự doanh lũy kế",
      data: propCumul.value,
      borderColor: "#6366f1",
      backgroundColor: "rgba(99, 102, 241, 0.08)",
      fill: true,
      tension: 0.3,
      pointRadius: props.data.length > 80 ? 0 : 3,
      borderWidth: 2,
    },
    {
      label: "Khối ngoại lũy kế",
      data: foreignCumul.value,
      borderColor: "#f59e0b",
      backgroundColor: "rgba(245, 158, 11, 0.08)",
      fill: true,
      tension: 0.3,
      pointRadius: props.data.length > 80 ? 0 : 3,
      borderWidth: 2,
    },
  ],
}));

const cumulOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: {
      position: "top",
      labels: { usePointStyle: true, padding: 12, font: { size: 12 } },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.dataset.label}: ${fmtBil(ctx.raw)}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { maxTicksLimit: 22, maxRotation: 45, font: { size: 11 } },
    },
    y: {
      title: {
        display: true,
        text: "Giá trị ròng lũy kế (VND)",
        font: { size: 11 },
      },
      ticks: { callback: fmtBilAxis },
    },
  },
}));
</script>

<style scoped>
.comparison-section {
  background: linear-gradient(135deg, #f5f3ff 0%, #fffbeb 100%);
  border-radius: 16px;
  border: 1px solid rgba(99, 102, 241, 0.15);
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
}

/* Header */
.cs-header {
  background: linear-gradient(
    90deg,
    rgba(99, 102, 241, 0.08),
    rgba(245, 158, 11, 0.05)
  );
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid rgba(99, 102, 241, 0.15);
}
.cs-icon {
  width: 46px;
  height: 46px;
  background: linear-gradient(135deg, #6366f1, #f59e0b);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}
.cs-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #312e81;
}
.cs-sub {
  font-size: 0.78rem;
  color: #4338ca;
  opacity: 0.75;
  margin-top: 0.1rem;
}

/* Cards row */
.cs-cards-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  align-items: start;
}

@media (max-width: 900px) {
  .cs-cards-row {
    grid-template-columns: 1fr;
  }
  .vs-divider {
    border-left: none;
    border-top: 2px dashed #e2e8f0;
    padding: 1rem 0;
  }
}

.actor-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.07);
}

.actor-card-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  font-weight: 700;
  font-size: 0.9rem;
}

.prop-card .actor-card-header {
  background: #eef2ff;
  color: #3730a3;
}
.foreign-card .actor-card-header {
  background: #fffbeb;
  color: #92400e;
}

.actor-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.prop-dot {
  background: #6366f1;
}
.foreign-dot {
  background: #f59e0b;
}

.actor-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

.astat {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  border-right: 1px solid #f1f5f9;
}
.astat:nth-child(2n) {
  border-right: none;
}
.astat:nth-last-child(-n + 2) {
  border-bottom: none;
}

.astat-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 0.25rem;
}
.astat-value {
  font-size: 0.95rem;
  font-weight: 700;
}
.astat-date {
  font-size: 0.7rem;
  color: #64748b;
  margin-top: 0.1rem;
}

/* VS Divider */
.vs-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 0 0.5rem;
  min-width: 160px;
}
.vs-badge {
  background: linear-gradient(135deg, #6366f1, #f59e0b);
  color: white;
  font-weight: 900;
  font-size: 1rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
}
.vs-compare {
  width: 100%;
  background: white;
  border-radius: 10px;
  padding: 0.875rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.vs-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}
.vs-label {
  font-size: 0.75rem;
  color: #64748b;
}
.vs-winner {
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
}
.winner-prop {
  background: #eef2ff;
  color: #4338ca;
}
.winner-foreign {
  background: #fffbeb;
  color: #b45309;
}

.vs-diff {
  font-size: 0.82rem;
  font-weight: 700;
  color: #1e293b;
}

.vs-bar-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.25rem;
}
.vs-bar-label {
  font-size: 0.7rem;
  color: #64748b;
}
.vs-bar-label.right {
  text-align: right;
}
.vs-bar-track {
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}
.vs-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}
.prop-fill {
  background: #6366f1;
}
.foreign-fill {
  background: #f59e0b;
}

/* Charts */
.cs-charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 0 1.25rem 1.25rem;
}
@media (max-width: 900px) {
  .cs-charts-row {
    grid-template-columns: 1fr;
  }
}

.cs-chart-panel {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.07);
}
.cs-chart-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.88rem;
  font-weight: 700;
  color: #1e293b;
}
.cs-chart-body {
  padding: 0.75rem 1rem 1rem;
  height: 340px;
}
.the-chart {
  width: 100% !important;
  height: 100% !important;
}

/* Color helpers */
.text-green-600 {
  color: #16a34a;
}
.text-red-500 {
  color: #ef4444;
}
.text-gray-500 {
  color: #6b7280;
}
</style>
