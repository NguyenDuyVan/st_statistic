<template>
  <div class="trade-table-wrapper">
    <div class="table-header">
      <h3><i class="pi pi-list"></i> Lệnh Khớp Realtime</h3>
      <div class="table-stats">
        <span class="stat-chip buy">
          <i class="pi pi-arrow-up"></i>
          Mua: {{ buyCount }}
        </span>
        <span class="stat-chip sell">
          <i class="pi pi-arrow-down"></i>
          Bán: {{ sellCount }}
        </span>
        <span class="stat-chip total"> Tổng: {{ trades.length }} </span>
      </div>
    </div>

    <div class="table-scroll">
      <table class="trade-table">
        <thead>
          <tr>
            <th>Giờ</th>
            <th class="right">Giá</th>
            <th class="right">KL</th>
            <th class="right">GT (B)</th>
            <th class="right">% Thay đổi</th>
            <th class="center">Chiều</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="trade in displayTrades"
            :key="`${trade.time}-${trade.price}-${trade.volume}`"
            :class="[
              'trade-row',
              trade.side === 'bu'
                ? 'row-buy'
                : trade.side === 'sd'
                  ? 'row-sell'
                  : '',
            ]"
          >
            <td class="col-time">{{ trade.time }}</td>
            <td class="col-price right" :class="priceClass(trade)">
              {{ formatPrice(trade.price) }}
            </td>
            <td class="col-vol right">{{ formatVol(trade.volume) }}</td>
            <td class="col-val right">{{ formatVal(trade.value) }}</td>
            <td class="col-pct right" :class="pctClass(trade)">
              {{ formatPct(trade.priceChangePercent) }}
            </td>
            <td class="col-side center">
              <span
                :class="[
                  'side-badge',
                  trade.side === 'bu'
                    ? 'side-buy'
                    : trade.side === 'sd'
                      ? 'side-sell'
                      : 'side-unknown',
                ]"
              >
                {{
                  trade.side === "bu" ? "M" : trade.side === "sd" ? "B" : "-"
                }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="trades.length === 0" class="empty-table">
        <i class="pi pi-inbox"></i>
        <p>Chưa có lệnh khớp</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  trades: {
    type: Array,
    default: () => [],
  },
  maxRows: {
    type: Number,
    default: 200,
  },
});

// Show most recent trades first
const displayTrades = computed(() =>
  [...props.trades].reverse().slice(0, props.maxRows),
);

const buyCount = computed(
  () => props.trades.filter((t) => t.side === "bu").length,
);
const sellCount = computed(
  () => props.trades.filter((t) => t.side === "sd").length,
);

function priceClass(trade) {
  if (trade.priceChange > 0) return "price-up";
  if (trade.priceChange < 0) return "price-down";
  return "price-flat";
}

function pctClass(trade) {
  if (trade.priceChangePercent > 0) return "price-up";
  if (trade.priceChangePercent < 0) return "price-down";
  return "";
}

function formatPrice(v) {
  return (v ?? 0).toLocaleString("vi-VN");
}

function formatVol(v) {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(0) + "K";
  return v.toLocaleString("vi-VN");
}

function formatVal(v) {
  return (v / 1_000_000_000).toFixed(2) + "B";
}

function formatPct(v) {
  if (v == null) return "-";
  return (v > 0 ? "+" : "") + v.toFixed(2) + "%";
}
</script>

<style scoped>
.trade-table-wrapper {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-top: 1rem;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.table-header h3 {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.table-stats {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.stat-chip {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  border-radius: 99px;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.stat-chip.buy {
  background: #dcfce7;
  color: #16a34a;
}
.stat-chip.sell {
  background: #fee2e2;
  color: #dc2626;
}
.stat-chip.total {
  background: #f1f5f9;
  color: #475569;
}

.table-scroll {
  max-height: 420px;
  overflow-y: auto;
}

.trade-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.trade-table thead tr {
  position: sticky;
  top: 0;
  background: #f8fafc;
  z-index: 1;
}

.trade-table th {
  padding: 0.5rem 0.875rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid #e2e8f0;
}

.trade-table td {
  padding: 0.4rem 0.875rem;
  border-bottom: 1px solid #f8fafc;
  color: #334155;
}

.right {
  text-align: right;
}
.center {
  text-align: center;
}

.trade-row:hover {
  background: #f8fafc;
}

.row-buy {
  background: rgba(220, 252, 231, 0.3);
}
.row-sell {
  background: rgba(254, 226, 226, 0.3);
}

.price-up {
  color: #16a34a;
  font-weight: 600;
}
.price-down {
  color: #dc2626;
  font-weight: 600;
}
.price-flat {
  color: #f59e0b;
}

.side-badge {
  display: inline-block;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  text-align: center;
  line-height: 22px;
}

.side-buy {
  background: #16a34a;
  color: #fff;
}
.side-sell {
  background: #dc2626;
  color: #fff;
}
.side-unknown {
  background: #94a3b8;
  color: #fff;
}

.empty-table {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 3rem;
  color: #94a3b8;
  font-size: 0.85rem;
}

.empty-table i {
  font-size: 2.5rem;
  opacity: 0.3;
}
</style>
