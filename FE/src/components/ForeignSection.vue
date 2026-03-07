<template>
  <div class="foreign-section mb-6">
    <!-- Section Title -->
    <div class="fs-header">
      <div class="flex items-center gap-3">
        <div class="fs-icon">
          <i class="pi pi-globe"></i>
        </div>
        <div>
          <h2 class="fs-title">Thống Kê Giao Dịch Khối Ngoại</h2>
          <p class="fs-sub">
            {{ symbol }} — Phân tích mua/bán của nhà đầu tư nước ngoài
          </p>
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="foreign-stats-grid mb-5">
      <div v-for="s in foreignStats" :key="s.label" class="fstat-card">
        <div class="fstat-icon" :style="{ background: s.bgColor }">
          <i :class="s.icon" :style="{ color: s.color }"></i>
        </div>
        <div class="fstat-body">
          <p class="fstat-label">{{ s.label }}</p>
          <p class="fstat-value" :style="{ color: s.color }">{{ s.value }}</p>
          <p v-if="s.sub" class="fstat-sub">{{ s.sub }}</p>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-row">
      <!-- Buy / Sell Chart -->
      <div class="chart-panel">
        <div class="chart-panel-header">
          <div class="flex items-center gap-2">
            <i class="pi pi-chart-bar" style="color: #16a34a"></i>
            <span>KL Mua / Bán Khối Ngoại theo phiên</span>
          </div>
          <div class="peak-info">
            <span class="peak-buy">
              📈 Mua cao nhất: <strong>{{ maxBuyLabel }}</strong>
            </span>
            <span class="peak-sell">
              📉 Bán cao nhất: <strong>{{ maxSellLabel }}</strong>
            </span>
          </div>
        </div>
        <div class="chart-body">
          <Chart
            type="bar"
            :data="buySellChartData"
            :options="buySellOptions"
            class="the-chart"
          />
        </div>
      </div>

      <!-- Room & Cumulative Chart -->
      <div class="chart-panel">
        <div class="chart-panel-header">
          <div class="flex items-center gap-2">
            <i class="pi pi-chart-line" style="color: #7c3aed"></i>
            <span>Room Ngoại &amp; Mua Ròng Lũy Kế</span>
          </div>
          <div class="room-info">
            Room cuối kỳ: <strong>{{ fmtNum(lastRoom) }} CP</strong>
          </div>
        </div>
        <div class="chart-body">
          <Chart
            type="line"
            :data="roomChartData"
            :options="roomOptions"
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
const fmt = (n, dec = 0) =>
  n != null
    ? new Intl.NumberFormat("vi-VN", {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
      }).format(n)
    : "-";

const fmtNum = (n) => fmt(n, 0);
const fmtBillion = (n) => (n ? `${fmt(n / 1_000_000_000, 2)} tỷ` : "-");
const fmtPrice = (n) => (n ? `${fmt(n, 0)} ₫` : "-");

const labels = computed(() =>
  props.data.map((d) => {
    const dt = new Date(d.date);
    return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
  }),
);

/* ── Aggregates ── */
const totalBuy = computed(() =>
  props.data.reduce((s, d) => s + (d.buyForeignQuantity || 0), 0),
);
const totalSell = computed(() =>
  props.data.reduce((s, d) => s + (d.sellForeignQuantity || 0), 0),
);
const totalBuyVal = computed(() =>
  props.data.reduce((s, d) => s + (d.buyForeignValue || 0), 0),
);
const totalSellVal = computed(() =>
  props.data.reduce((s, d) => s + (d.sellForeignValue || 0), 0),
);
const netForeign = computed(() => totalBuy.value - totalSell.value);
const avgBuyPrice = computed(() =>
  totalBuy.value > 0 ? totalBuyVal.value / totalBuy.value : 0,
);
const avgSellPrice = computed(() =>
  totalSell.value > 0 ? totalSellVal.value / totalSell.value : 0,
);
const lastRoom = computed(
  () => props.data[props.data.length - 1]?.currentForeignRoom ?? 0,
);
const firstRoom = computed(() => props.data[0]?.currentForeignRoom ?? 0);
const roomChange = computed(() => lastRoom.value - firstRoom.value);

/* ── Peak days ── */
const maxBuyRecord = computed(() =>
  props.data.reduce(
    (m, d) => (d.buyForeignQuantity > (m?.buyForeignQuantity || 0) ? d : m),
    null,
  ),
);
const maxSellRecord = computed(() =>
  props.data.reduce(
    (m, d) => (d.sellForeignQuantity > (m?.sellForeignQuantity || 0) ? d : m),
    null,
  ),
);

const dayLabel = (record) => {
  if (!record) return "-";
  const d = new Date(record.date);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

const maxBuyLabel = computed(() =>
  maxBuyRecord.value
    ? `${dayLabel(maxBuyRecord.value)} (${fmtNum(maxBuyRecord.value.buyForeignQuantity)} CP)`
    : "-",
);
const maxSellLabel = computed(() =>
  maxSellRecord.value
    ? `${dayLabel(maxSellRecord.value)} (${fmtNum(maxSellRecord.value.sellForeignQuantity)} CP)`
    : "-",
);

/* ── Summary cards ── */
const foreignStats = computed(() => {
  const net = netForeign.value;
  const isNetBuy = net >= 0;
  return [
    {
      label: "Tổng KL Mua (Khối ngoại)",
      value: `${fmtNum(totalBuy.value)} CP`,
      sub: `Giá trị: ${fmtBillion(totalBuyVal.value)}`,
      icon: "pi pi-arrow-circle-down",
      color: "#16a34a",
      bgColor: "#dcfce7",
    },
    {
      label: "Tổng KL Bán (Khối ngoại)",
      value: `${fmtNum(totalSell.value)} CP`,
      sub: `Giá trị: ${fmtBillion(totalSellVal.value)}`,
      icon: "pi pi-arrow-circle-up",
      color: "#dc2626",
      bgColor: "#fee2e2",
    },
    {
      label: "Mua ròng khối ngoại",
      value: `${net >= 0 ? "+" : ""}${fmtNum(net)} CP`,
      sub: isNetBuy
        ? "▲ Khối ngoại đang mua ròng"
        : "▼ Khối ngoại đang bán ròng",
      icon: isNetBuy ? "pi pi-arrow-up" : "pi pi-arrow-down",
      color: isNetBuy ? "#16a34a" : "#dc2626",
      bgColor: isNetBuy ? "#dcfce7" : "#fee2e2",
    },
    {
      label: "Room ngoại hiện tại (cuối kỳ)",
      value: `${fmtNum(lastRoom.value)} CP`,
      sub: `Thay đổi: ${roomChange.value >= 0 ? "+" : ""}${fmtNum(roomChange.value)} CP`,
      icon: "pi pi-globe",
      color: "#7c3aed",
      bgColor: "#ede9fe",
    },
    {
      label: "Giá TB Mua (Khối ngoại)",
      value: fmtPrice(avgBuyPrice.value),
      sub: `Tổng giá trị: ${fmtBillion(totalBuyVal.value)}`,
      icon: "pi pi-tag",
      color: "#16a34a",
      bgColor: "#dcfce7",
    },
    {
      label: "Giá TB Bán (Khối ngoại)",
      value: fmtPrice(avgSellPrice.value),
      sub: `Tổng giá trị: ${fmtBillion(totalSellVal.value)}`,
      icon: "pi pi-tag",
      color: "#dc2626",
      bgColor: "#fee2e2",
    },
    {
      label: "Phiên mua nhiều nhất",
      value: `${fmtNum(maxBuyRecord.value?.buyForeignQuantity || 0)} CP`,
      sub: dayLabel(maxBuyRecord.value),
      icon: "pi pi-star-fill",
      color: "#0891b2",
      bgColor: "#cffafe",
    },
    {
      label: "Phiên bán nhiều nhất",
      value: `${fmtNum(maxSellRecord.value?.sellForeignQuantity || 0)} CP`,
      sub: dayLabel(maxSellRecord.value),
      icon: "pi pi-star-fill",
      color: "#d97706",
      bgColor: "#fef3c7",
    },
  ];
});

/* ── Buy/Sell chart ── */
const maxBuyIdx = computed(() =>
  props.data.findIndex((d) => d === maxBuyRecord.value),
);
const maxSellIdx = computed(() =>
  props.data.findIndex((d) => d === maxSellRecord.value),
);

const cumulNet = computed(() => {
  let sum = 0;
  return props.data.map((d) => {
    sum += (d.buyForeignQuantity || 0) - (d.sellForeignQuantity || 0);
    return sum;
  });
});

const buySellChartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      type: "bar",
      label: "KL Mua NN",
      data: props.data.map((d) => d.buyForeignQuantity || 0),
      backgroundColor: props.data.map((_, i) =>
        i === maxBuyIdx.value ? "#15803d" : "rgba(34, 197, 94, 0.65)",
      ),
      borderColor: props.data.map((_, i) =>
        i === maxBuyIdx.value ? "#14532d" : "#22c55e",
      ),
      borderWidth: props.data.map((_, i) => (i === maxBuyIdx.value ? 2 : 1)),
      order: 2,
    },
    {
      type: "bar",
      label: "KL Bán NN",
      data: props.data.map((d) => -(d.sellForeignQuantity || 0)),
      backgroundColor: props.data.map((_, i) =>
        i === maxSellIdx.value ? "#b91c1c" : "rgba(239, 68, 68, 0.65)",
      ),
      borderColor: props.data.map((_, i) =>
        i === maxSellIdx.value ? "#7f1d1d" : "#ef4444",
      ),
      borderWidth: props.data.map((_, i) => (i === maxSellIdx.value ? 2 : 1)),
      order: 3,
    },
    {
      type: "line",
      label: "Mua ròng lũy kế",
      data: cumulNet.value,
      borderColor: "#f59e0b",
      backgroundColor: "transparent",
      borderWidth: 2,
      pointRadius: props.data.length > 60 ? 0 : 3,
      tension: 0.3,
      order: 1,
    },
  ],
}));

const fmtAxis = (v) => {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (abs >= 1_000) return (v / 1_000).toFixed(0) + "K";
  return v;
};

const buySellOptions = computed(() => ({
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
        label: (ctx) => {
          // Buy/Sell bars are stored as negative for sell — show absolute value
          // Cumulative net line should keep its sign
          const v = ctx.dataset.type === "bar" ? Math.abs(ctx.raw) : ctx.raw;
          return ` ${ctx.dataset.label}: ${new Intl.NumberFormat("vi-VN").format(v)} CP`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { maxTicksLimit: 22, maxRotation: 45, font: { size: 11 } },
    },
    y: {
      title: { display: true, text: "Khối lượng (CP)", font: { size: 11 } },
      ticks: { callback: fmtAxis },
    },
  },
}));

/* ── Room chart ── */
const roomChartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: "Room ngoại còn lại",
      data: props.data.map((d) => d.currentForeignRoom || 0),
      borderColor: "#7c3aed",
      backgroundColor: "rgba(124, 58, 237, 0.1)",
      fill: true,
      tension: 0.3,
      yAxisID: "yRoom",
      pointRadius: props.data.length > 80 ? 0 : 3,
      borderWidth: 2,
      order: 1,
    },
    {
      label: "Mua ròng lũy kế",
      data: cumulNet.value,
      borderColor: "#f59e0b",
      backgroundColor: "transparent",
      fill: false,
      tension: 0.3,
      yAxisID: "yNet",
      pointRadius: 0,
      borderWidth: 2,
      borderDash: [5, 3],
      order: 2,
    },
    {
      label: "Giá đóng cửa",
      data: props.data.map((d) => d.priceClose || null),
      borderColor: "#0ea5e9",
      backgroundColor: "transparent",
      fill: false,
      tension: 0.3,
      yAxisID: "yPrice",
      pointRadius: props.data.length > 80 ? 0 : 2,
      borderWidth: 2,
      borderDash: [3, 2],
      order: 3,
    },
  ],
}));

const roomOptions = computed(() => ({
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
        label: (ctx) => {
          if (ctx.dataset.yAxisID === "yPrice") {
            return ` ${ctx.dataset.label}: ${new Intl.NumberFormat("vi-VN").format(ctx.raw)} ₫`;
          }
          return ` ${ctx.dataset.label}: ${new Intl.NumberFormat("vi-VN").format(ctx.raw)} CP`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { maxTicksLimit: 22, maxRotation: 45, font: { size: 11 } },
    },
    yRoom: {
      type: "linear",
      position: "left",
      title: { display: true, text: "Room ngoại (CP)", font: { size: 11 } },
      ticks: { callback: fmtAxis },
    },
    yNet: {
      type: "linear",
      position: "right",
      title: {
        display: true,
        text: "Mua ròng lũy kế (CP)",
        font: { size: 11 },
      },
      grid: { display: false },
      ticks: { callback: fmtAxis },
    },
    yPrice: {
      type: "linear",
      position: "right",
      title: { display: true, text: "Giá đóng cửa (₫)", font: { size: 11 } },
      grid: { display: false },
      ticks: {
        callback: (v) => new Intl.NumberFormat("vi-VN").format(v),
      },
    },
  },
}));
</script>

<style scoped>
.foreign-section {
  background: linear-gradient(135deg, #faf5ff 0%, #f0f9ff 100%);
  border-radius: 16px;
  border: 1px solid rgba(124, 58, 237, 0.15);
  padding: 0;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
}

.fs-header {
  background: linear-gradient(
    90deg,
    rgba(124, 58, 237, 0.08),
    rgba(14, 165, 233, 0.05)
  );
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid rgba(124, 58, 237, 0.15);
}

.fs-icon {
  width: 46px;
  height: 46px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.fs-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #4c1d95;
}

.fs-sub {
  font-size: 0.78rem;
  color: #6d28d9;
  opacity: 0.75;
  margin-top: 0.1rem;
}

/* Stats grid */
.foreign-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.875rem;
  padding: 1.25rem 1.5rem 0;
}

@media (max-width: 1024px) {
  .foreign-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .foreign-stats-grid {
    grid-template-columns: 1fr;
  }
}

.fstat-card {
  background: white;
  border-radius: 10px;
  padding: 0.875rem 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: transform 0.15s;
}

.fstat-card:hover {
  transform: translateY(-1px);
}

.fstat-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.fstat-icon i {
  font-size: 1.1rem;
}

.fstat-label {
  font-size: 0.73rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 0.2rem;
}

.fstat-value {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.4;
}

.fstat-sub {
  font-size: 0.72rem;
  color: #64748b;
  margin-top: 0.15rem;
}

/* Charts */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem 1.25rem 1.25rem;
}

@media (max-width: 1024px) {
  .charts-row {
    grid-template-columns: 1fr;
  }
}

.chart-panel {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.07);
}

.chart-panel-header {
  padding: 0.875rem 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.88rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.peak-info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.75rem;
  font-weight: 400;
  color: #475569;
}

.peak-buy strong {
  color: #16a34a;
}
.peak-sell strong {
  color: #dc2626;
}

.room-info {
  font-size: 0.75rem;
  font-weight: 400;
  color: #7c3aed;
}

.chart-body {
  padding: 0.75rem 1rem 1rem;
  height: 360px;
}

.the-chart {
  width: 100% !important;
  height: 100% !important;
}
</style>
