<template>
  <div class="stock-chart-wrapper">
    <div class="chart-header">
      <h3><i class="pi pi-chart-line"></i> Biểu đồ – {{ symbol }}</h3>
      <div class="chart-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['chart-tab', activeTab === tab.key ? 'active' : '']"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="chart-body">
      <!-- Price vs Time -->
      <v-chart
        v-if="activeTab === 'price'"
        class="echart"
        :option="priceOption"
        autoresize
      />

      <!-- Volume vs Time -->
      <v-chart
        v-else-if="activeTab === 'volume'"
        class="echart"
        :option="volumeOption"
        autoresize
      />

      <!-- Money Flow -->
      <v-chart
        v-else-if="activeTab === 'flow'"
        class="echart"
        :option="flowOption"
        autoresize
      />

      <!-- Buy vs Sell -->
      <v-chart
        v-else-if="activeTab === 'buysell'"
        class="echart"
        :option="buySellOption"
        autoresize
      />

      <div v-if="trades.length === 0" class="no-data">
        <i class="pi pi-chart-line"></i>
        <p>Chưa có dữ liệu</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  trades: {
    type: Array,
    default: () => [],
  },
  symbol: {
    type: String,
    default: "",
  },
});

const tabs = [
  { key: "price", label: "Giá" },
  { key: "volume", label: "KL" },
  { key: "flow", label: "Money Flow" },
  { key: "buysell", label: "Mua/Bán" },
];

const activeTab = ref("price");

// ─── Computed data slices ──────────────────────────────────────────────────

const SAMPLE = 300; // max data points displayed

const sampledTrades = computed(() => {
  const t = props.trades;
  if (t.length <= SAMPLE) return t;
  const step = Math.ceil(t.length / SAMPLE);
  return t.filter((_, i) => i % step === 0);
});

const times = computed(() => sampledTrades.value.map((t) => t.time || ""));
const prices = computed(() => sampledTrades.value.map((t) => t.price ?? 0));
const volumes = computed(() => sampledTrades.value.map((t) => t.volume ?? 0));
const values = computed(() =>
  sampledTrades.value.map((t) => +(t.value / 1e9).toFixed(4)),
);

const buySellData = computed(() => {
  return sampledTrades.value.map((t) => ({
    buy: t.side === "bu" ? t.volume : 0,
    sell: t.side === "sd" ? t.volume : 0,
  }));
});

const flowData = computed(() =>
  sampledTrades.value.map((t) => {
    const val = +(t.value / 1e9).toFixed(4);
    return {
      value: val,
      itemStyle: {
        color:
          t.side === "bu" ? "#16a34a" : t.side === "sd" ? "#dc2626" : "#94a3b8",
      },
    };
  }),
);

// ─── Chart options ─────────────────────────────────────────────────────────

const BASE_GRID = { left: 60, right: 24, top: 32, bottom: 48 };

const tooltipFormatter = (params) => {
  const p = Array.isArray(params) ? params[0] : params;
  return `<b>${p.axisValueLabel || p.name}</b><br/>${p.seriesName}: <b>${(+p.value).toLocaleString("vi-VN")}</b>`;
};

const priceOption = computed(() => ({
  backgroundColor: "transparent",
  tooltip: { trigger: "axis", formatter: tooltipFormatter },
  grid: BASE_GRID,
  dataZoom: [{ type: "inside" }, { type: "slider", height: 20, bottom: 4 }],
  xAxis: {
    type: "category",
    data: times.value,
    axisLabel: { fontSize: 10, interval: Math.floor(times.value.length / 8) },
  },
  yAxis: {
    type: "value",
    scale: true,
    axisLabel: { fontSize: 10, formatter: (v) => v.toLocaleString("vi-VN") },
  },
  series: [
    {
      name: "Giá",
      type: "line",
      data: prices.value,
      smooth: true,
      symbol: "none",
      lineStyle: { color: "#3b82f6", width: 2 },
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "rgba(59,130,246,0.25)" },
            { offset: 1, color: "rgba(59,130,246,0)" },
          ],
        },
      },
    },
  ],
}));

const volumeOption = computed(() => ({
  backgroundColor: "transparent",
  tooltip: { trigger: "axis" },
  grid: BASE_GRID,
  dataZoom: [{ type: "inside" }, { type: "slider", height: 20, bottom: 4 }],
  xAxis: {
    type: "category",
    data: times.value,
    axisLabel: { fontSize: 10, interval: Math.floor(times.value.length / 8) },
  },
  yAxis: { type: "value", axisLabel: { fontSize: 10 } },
  series: [
    {
      name: "KL",
      type: "bar",
      data: volumes.value,
      itemStyle: { color: "#6366f1" },
      barMaxWidth: 8,
    },
  ],
}));

const flowOption = computed(() => ({
  backgroundColor: "transparent",
  tooltip: {
    trigger: "axis",
    formatter: (p) => `${p[0].axisValueLabel}<br/>GT: <b>${p[0].value}B</b>`,
  },
  grid: BASE_GRID,
  dataZoom: [{ type: "inside" }, { type: "slider", height: 20, bottom: 4 }],
  xAxis: {
    type: "category",
    data: times.value,
    axisLabel: { fontSize: 10, interval: Math.floor(times.value.length / 8) },
  },
  yAxis: {
    type: "value",
    axisLabel: { fontSize: 10, formatter: (v) => v + "B" },
  },
  series: [
    {
      name: "GT",
      type: "bar",
      data: flowData.value,
      barMaxWidth: 8,
    },
  ],
}));

const buySellOption = computed(() => ({
  backgroundColor: "transparent",
  tooltip: { trigger: "axis" },
  legend: { data: ["Mua", "Bán"], top: 4, textStyle: { fontSize: 11 } },
  grid: { ...BASE_GRID, top: 44 },
  dataZoom: [{ type: "inside" }, { type: "slider", height: 20, bottom: 4 }],
  xAxis: {
    type: "category",
    data: times.value,
    axisLabel: { fontSize: 10, interval: Math.floor(times.value.length / 8) },
  },
  yAxis: { type: "value", axisLabel: { fontSize: 10 } },
  series: [
    {
      name: "Mua",
      type: "bar",
      stack: "volume",
      data: buySellData.value.map((d) => d.buy),
      itemStyle: { color: "#16a34a" },
      barMaxWidth: 8,
    },
    {
      name: "Bán",
      type: "bar",
      stack: "volume",
      data: buySellData.value.map((d) => d.sell),
      itemStyle: { color: "#dc2626" },
      barMaxWidth: 8,
    },
  ],
}));
</script>

<style scoped>
.stock-chart-wrapper {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-top: 1rem;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chart-header h3 {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-tabs {
  display: flex;
  gap: 0.25rem;
}

.chart-tab {
  padding: 0.3rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #fff;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}

.chart-tab:hover {
  background: #f1f5f9;
}

.chart-tab.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #fff;
}

.chart-body {
  position: relative;
  padding: 0.5rem;
}

.echart {
  width: 100%;
  height: 300px;
}

.no-data {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.85rem;
  background: rgba(255, 255, 255, 0.9);
}

.no-data i {
  font-size: 2.5rem;
  opacity: 0.3;
}
</style>
