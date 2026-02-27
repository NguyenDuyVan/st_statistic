<template>
  <div class="chart-card mb-6">
    <div class="chart-card-header">
      <div class="flex items-center gap-2">
        <i class="pi pi-chart-line" style="color: #2563eb"></i>
        <span>Biểu đồ Giá &amp; Khối lượng — {{ symbol }}</span>
      </div>
      <div class="chart-legend-note">
        <span class="legend-dot" style="background: #22c55e"></span>Tăng &nbsp;
        <span class="legend-dot" style="background: #ef4444"></span>Giảm
      </div>
    </div>
    <div class="chart-body">
      <Chart
        type="bar"
        :data="chartData"
        :options="chartOptions"
        class="the-chart"
      />
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

const labels = computed(() =>
  props.data.map((d) => {
    const dt = new Date(d.date);
    return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}`;
  }),
);

const isUp = (d, i) => {
  const prev = i > 0 ? props.data[i - 1].priceClose : d.priceOpen;
  return d.priceClose >= prev;
};

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      type: "line",
      label: "Giá đóng cửa (×1000 ₫)",
      data: props.data.map((d) => d.priceClose),
      borderColor: "#2563eb",
      backgroundColor: "rgba(37, 99, 235, 0.08)",
      fill: true,
      tension: 0.3,
      yAxisID: "yPrice",
      pointRadius: props.data.length > 80 ? 0 : 3,
      pointHoverRadius: 6,
      borderWidth: 2,
      order: 1,
    },
    {
      type: "line",
      label: "Giá cao nhất",
      data: props.data.map((d) => d.priceHigh),
      borderColor: "rgba(34, 197, 94, 0.6)",
      backgroundColor: "transparent",
      fill: false,
      tension: 0.3,
      yAxisID: "yPrice",
      pointRadius: 0,
      borderWidth: 1,
      borderDash: [4, 3],
      order: 2,
    },
    {
      type: "line",
      label: "Giá thấp nhất",
      data: props.data.map((d) => d.priceLow),
      borderColor: "rgba(239, 68, 68, 0.6)",
      backgroundColor: "transparent",
      fill: false,
      tension: 0.3,
      yAxisID: "yPrice",
      pointRadius: 0,
      borderWidth: 1,
      borderDash: [4, 3],
      order: 3,
    },
    {
      type: "bar",
      label: "Khối lượng",
      data: props.data.map((d) => d.totalVolume),
      backgroundColor: props.data.map((d, i) =>
        isUp(d, i) ? "rgba(34, 197, 94, 0.55)" : "rgba(239, 68, 68, 0.55)",
      ),
      borderColor: props.data.map((d, i) =>
        isUp(d, i) ? "#16a34a" : "#dc2626",
      ),
      borderWidth: 1,
      yAxisID: "yVolume",
      order: 4,
    },
  ],
}));

const fmtVol = (v) => {
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (Math.abs(v) >= 1_000) return (v / 1_000).toFixed(0) + "K";
  return v;
};

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: {
      position: "top",
      labels: { usePointStyle: true, padding: 14, font: { size: 12 } },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          if (ctx.dataset.yAxisID === "yVolume") {
            return ` ${ctx.dataset.label}: ${new Intl.NumberFormat("vi-VN").format(ctx.raw)}`;
          }
          return ` ${ctx.dataset.label}: ${new Intl.NumberFormat("vi-VN", { minimumFractionDigits: 1 }).format(ctx.raw)}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { maxTicksLimit: 24, maxRotation: 45, font: { size: 11 } },
    },
    yPrice: {
      type: "linear",
      position: "left",
      title: { display: true, text: "Giá (×1000 ₫)", font: { size: 11 } },
      grid: { color: "rgba(0,0,0,0.05)" },
    },
    yVolume: {
      type: "linear",
      position: "right",
      title: { display: true, text: "Khối lượng", font: { size: 11 } },
      grid: { display: false },
      ticks: { callback: fmtVol },
    },
  },
}));
</script>

<style scoped>
.chart-card {
  background: white;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  overflow: hidden;
}

.chart-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 700;
  font-size: 0.95rem;
  color: #1e293b;
}

.chart-legend-note {
  font-size: 0.8rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.chart-body {
  padding: 1rem 1.5rem 1.25rem;
  height: 420px;
}

.the-chart {
  width: 100% !important;
  height: 100% !important;
}
</style>
