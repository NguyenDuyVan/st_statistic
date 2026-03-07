<template>
  <div class="signal-panel">
    <div class="panel-header">
      <h3><i class="pi pi-bell"></i> Smart Money Signals</h3>
      <span class="active-count"> {{ activeCount }} active </span>
    </div>

    <!-- Indicator grid -->
    <div class="signal-grid">
      <div
        v-for="sig in signalDefs"
        :key="sig.type"
        :class="['signal-card', isActive(sig.type) ? 'signal-active' : '']"
        :title="sig.description"
      >
        <i :class="['sig-icon', sig.icon]"></i>
        <span class="sig-label">{{ sig.label }}</span>
        <span v-if="isActive(sig.type)" class="sig-dot"></span>
      </div>
    </div>

    <!-- Recent signal events -->
    <div class="signal-events" v-if="signals.length > 0">
      <div class="events-title">Lịch sử tín hiệu</div>
      <div class="events-list">
        <div v-for="(event, idx) in recentEvents" :key="idx" class="event-item">
          <span
            :class="[
              'event-type',
              `type-${event.type.toLowerCase().replace(/_/g, '-')}`,
            ]"
          >
            {{ event.type }}
          </span>
          <span class="event-price">{{ formatPrice(event.price) }}</span>
          <span class="event-vol">{{ formatVol(event.volume) }}</span>
          <span class="event-time">{{ event.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  signals: {
    type: Array,
    default: () => [],
  },
});

const signalDefs = [
  {
    type: "LARGE_TRADE",
    label: "Large Trade",
    icon: "pi pi-dollar",
    description: "Volume > 100K or Value > 3B",
  },
  {
    type: "VOLUME_SPIKE",
    label: "Volume Spike",
    icon: "pi pi-chart-bar",
    description: "Volume > 5× average",
  },
  {
    type: "MONEY_FLOW_BURST",
    label: "Money Flow",
    icon: "pi pi-wave-pulse",
    description: "Sum last-5 value > 10B",
  },
  {
    type: "BUY_PRESSURE",
    label: "Buy Pressure",
    icon: "pi pi-arrow-up",
    description: "Buy / Sell ratio > 2",
  },
  {
    type: "BREAKOUT",
    label: "Breakout",
    icon: "pi pi-sort-amount-up",
    description: "Price breaks 5-min high with volume",
  },
  {
    type: "ABSORPTION",
    label: "Absorption",
    icon: "pi pi-shield",
    description: "Large sell absorbed, price holds",
  },
  {
    type: "ICEBERG",
    label: "Iceberg",
    icon: "pi pi-eye-slash",
    description: "10+ trades same price in 5 s",
  },
];

// Active = signal appeared in the last 60 seconds
const ACTIVE_WINDOW_MS = 60_000;

const activeTypes = computed(() => {
  const now = Date.now();
  return new Set(
    props.signals
      .filter((s) => now - s.timestamp < ACTIVE_WINDOW_MS)
      .map((s) => s.type),
  );
});

const activeCount = computed(() => activeTypes.value.size);

function isActive(type) {
  return activeTypes.value.has(type);
}

const recentEvents = computed(() => props.signals.slice(0, 20));

function formatPrice(v) {
  return (v ?? 0).toLocaleString("vi-VN");
}

function formatVol(v) {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(0) + "K";
  return (v ?? 0).toLocaleString();
}
</script>

<style scoped>
.signal-panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-top: 1rem;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
}

.panel-header h3 {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.active-count {
  font-size: 0.75rem;
  font-weight: 700;
  background: #dbeafe;
  color: #1d4ed8;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
}

/* Signal grid */
.signal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
  padding: 1rem;
}

.signal-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 0.875rem 0.5rem;
  border-radius: 10px;
  background: #f8fafc;
  border: 2px solid transparent;
  cursor: default;
  transition: all 0.2s;
  text-align: center;
}

.signal-card.signal-active {
  background: #f0fdf4;
  border-color: #22c55e;
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.2);
}

.sig-icon {
  font-size: 1.3rem;
  color: #94a3b8;
}

.signal-active .sig-icon {
  color: #16a34a;
}

.sig-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
  line-height: 1.2;
}

.signal-active .sig-label {
  color: #15803d;
}

.sig-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.4);
  }
}

/* Events */
.signal-events {
  border-top: 1px solid #f1f5f9;
  padding: 0.75rem 1rem;
}

.events-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  max-height: 180px;
  overflow-y: auto;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.76rem;
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  background: #f8fafc;
}

.event-type {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  background: #dbeafe;
  color: #1d4ed8;
  white-space: nowrap;
  flex-shrink: 0;
}

.event-price {
  color: #334155;
  font-weight: 600;
  flex: 1;
  text-align: right;
}

.event-vol {
  color: #64748b;
  width: 48px;
  text-align: right;
}

.event-time {
  color: #94a3b8;
  width: 54px;
  text-align: right;
  flex-shrink: 0;
}
</style>
