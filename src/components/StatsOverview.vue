<template>
  <div class="stats-grid mb-6">
    <div v-for="stat in stats" :key="stat.label" class="stat-card">
      <div class="stat-icon" :style="{ background: stat.bgColor }">
        <i :class="stat.icon" :style="{ color: stat.color }"></i>
      </div>
      <div class="stat-body">
        <p class="stat-label">{{ stat.label }}</p>
        <p class="stat-value" :style="{ color: stat.color }">
          {{ stat.value }}
        </p>
        <p v-if="stat.sub" class="stat-sub">{{ stat.sub }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  data: { type: Array, default: () => [] },
});

const fmt = (n, dec = 0) =>
  n != null
    ? new Intl.NumberFormat("vi-VN", {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
      }).format(n)
    : "-";

const fmtPrice = (n) => (n ? `${fmt(n, 1)}` : "-");

const fmtBillion = (n) => (n ? `${fmt(n / 1_000_000_000, 2)} tỷ ₫` : "-");

const stats = computed(() => {
  const d = props.data;
  if (!d.length) return [];

  const closes = d.map((x) => x.priceClose).filter(Boolean);
  const highs = d.map((x) => x.priceHigh).filter(Boolean);
  const lows = d.map((x) => x.priceLow).filter(Boolean);
  const totalVol = d.reduce((s, x) => s + (x.totalVolume || 0), 0);
  const totalVal = d.reduce((s, x) => s + (x.totalValue || 0), 0);
  const avgClose = closes.reduce((a, b) => a + b, 0) / closes.length;

  // VWAP = Σ(priceAverage × totalVolume) / Σ(totalVolume)
  const vwapNumer = d.reduce(
    (s, x) => s + (x.priceAverage || 0) * (x.totalVolume || 0),
    0,
  );
  const vwapDenom = d.reduce((s, x) => s + (x.totalVolume || 0), 0);
  const vwap = vwapDenom > 0 ? vwapNumer / vwapDenom : null;
  const maxHigh = Math.max(...highs);
  const minLow = Math.min(...lows);
  const lastClose = d[d.length - 1]?.priceClose;
  const firstClose = d[0]?.priceClose;
  const change =
    lastClose && firstClose ? ((lastClose - firstClose) / firstClose) * 100 : 0;
  const isUp = change >= 0;

  // Max volume session
  const maxVolSession = d.reduce(
    (m, x) => (x.totalVolume > (m?.totalVolume || 0) ? x : m),
    null,
  );

  return [
    {
      label: "Giá đóng cửa (cuối kỳ)",
      value: fmtPrice(lastClose),
      sub: `${isUp ? "▲" : "▼"} ${fmt(Math.abs(change), 2)}% so với đầu kỳ`,
      icon: "pi pi-tag",
      color: isUp ? "#16a34a" : "#ef4444",
      bgColor: isUp ? "#dcfce7" : "#fee2e2",
    },
    {
      label: "Giá TB đóng cửa",
      value: fmtPrice(avgClose),
      sub: `Cao nhất: ${fmtPrice(maxHigh)} | Thấp nhất: ${fmtPrice(minLow)}`,
      icon: "pi pi-chart-line",
      color: "#2563eb",
      bgColor: "#dbeafe",
    },
    {
      label: "VWAP (TB theo khối lượng)",
      value: fmtPrice(vwap),
      sub: `= Σ(Giá TB × KL) ÷ Tổng KL`,
      icon: "pi pi-calculator",
      color: "#0f766e",
      bgColor: "#ccfbf1",
    },
    {
      label: "Biên độ giá (High - Low)",
      value: fmtPrice(maxHigh - minLow),
      sub: `${fmt(((maxHigh - minLow) / minLow) * 100, 2)}% so với đáy`,
      icon: "pi pi-sort-alt",
      color: "#0891b2",
      bgColor: "#cffafe",
    },
    {
      label: "Tổng khối lượng giao dịch",
      value: `${fmt(totalVol)} CP`,
      sub: `TB mỗi phiên: ${fmt(totalVol / d.length)} CP`,
      icon: "pi pi-chart-bar",
      color: "#7c3aed",
      bgColor: "#ede9fe",
    },
    {
      label: "Tổng giá trị giao dịch",
      value: fmtBillion(totalVal),
      sub: `TB mỗi phiên: ${fmtBillion(totalVal / d.length)}`,
      icon: "pi pi-wallet",
      color: "#d97706",
      bgColor: "#fef3c7",
    },
    {
      label: "Phiên giao dịch lớn nhất",
      value: `${fmt(maxVolSession?.totalVolume)} CP`,
      sub: maxVolSession
        ? new Date(maxVolSession.date).toLocaleDateString("vi-VN")
        : "-",
      icon: "pi pi-star",
      color: "#db2777",
      bgColor: "#fce7f3",
    },
  ];
});
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition:
    transform 0.15s,
    box-shadow 0.15s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 46px;
  height: 46px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon i {
  font-size: 1.2rem;
}

.stat-body {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 0.76rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.3;
  color: #1e293b;
}

.stat-sub {
  font-size: 0.73rem;
  color: #64748b;
  margin-top: 0.2rem;
}
</style>
