<template>
  <div class="search-card" :class="{ collapsed }">
    <!-- Header — always visible, click to toggle when collapsed -->
    <div class="search-header clickable" @click="toggleCollapse">
      <div class="header-left">
        <i class="pi pi-sliders-h"></i>
        <span>Tìm kiếm dữ liệu</span>

        <!-- Collapsed summary pill -->
        <div v-if="collapsed" class="collapsed-summary">
          <span class="pill symbol-pill">{{ form.symbol || "—" }}</span>
          <span class="pill"
            >{{ shortDate(form.startDate) }} →
            {{ shortDate(form.endDate) }}</span
          >
        </div>
      </div>

      <div class="header-right">
        <!-- Quick search button when collapsed -->
        <Button
          v-if="collapsed"
          icon="pi pi-search"
          size="small"
          :loading="loading"
          @click.stop="handleSearch"
          class="quick-search-btn"
          :disabled="
            form.symbol.length !== 3 || !form.startDate || !form.endDate
          "
        />
        <button
          class="toggle-btn"
          @click.stop="toggleCollapse"
          :title="collapsed ? 'Mở rộng' : 'Thu gọn'"
        >
          <i :class="collapsed ? 'pi pi-chevron-down' : 'pi pi-chevron-up'"></i>
        </button>
      </div>
    </div>

    <!-- Collapsible body -->
    <div v-if="!collapsed" class="search-body">
      <div class="search-grid">
        <!-- Symbol -->
        <div class="field">
          <label>
            Mã cổ phiếu <span class="required">*</span>
            <span class="shortcut-hint">⌘ /</span>
          </label>
          <InputText
            ref="symbolInputRef"
            v-model="form.symbol"
            placeholder="VD: SHS, VNM, HPG..."
            fluid
            @input="form.symbol = form.symbol.toUpperCase()"
            @keydown.enter="handleSearch"
          />
        </div>

        <!-- Date range -->
        <div class="field field-date-range">
          <label>Từ ngày <span class="required">*</span></label>
          <DatePicker
            v-model="form.startDate"
            dateFormat="dd/mm/yy"
            placeholder="Ngày bắt đầu"
            showIcon
            fluid
          />
        </div>

        <div class="field field-date-range">
          <label> Đến ngày <span class="required">*</span> </label>
          <DatePicker
            v-model="form.endDate"
            dateFormat="dd/mm/yy"
            placeholder="Ngày kết thúc"
            showIcon
            fluid
          />
        </div>

        <!-- Search Button -->
        <div class="field btn-field">
          <Button
            label="Tìm kiếm"
            icon="pi pi-search"
            :loading="loading"
            @click="handleSearch"
            class="search-btn"
            :disabled="
              form.symbol.length !== 3 || !form.startDate || !form.endDate
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted, onUnmounted } from "vue";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";

defineProps({ loading: Boolean });
const emit = defineEmits(["search"]);

const collapsed = ref(false);
const userExpanded = ref(false);
const symbolInputRef = ref(null);
const SCROLL_THRESHOLD = 80;

// Count Mon–Fri days between two dates (inclusive)
const calcTradingDays = (start, end) => {
  if (!start || !end) return 100;
  const s = new Date(start);
  const e = new Date(end);
  if (s > e) return 1;
  let count = 0;
  const cur = new Date(s);
  while (cur <= e) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return Math.max(count, 1);
};

const onScroll = () => {
  if (window.scrollY <= SCROLL_THRESHOLD) {
    userExpanded.value = false;
    collapsed.value = false;
  } else if (!userExpanded.value) {
    collapsed.value = true;
  }
};

const onKeydown = (e) => {
  if (e.metaKey && e.key === "/") {
    e.preventDefault();
    expand();
    // wait for v-if to mount the input
    setTimeout(() => {
      symbolInputRef.value?.$el?.focus();
    }, 0);
  }
};

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("keydown", onKeydown);
});
onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("keydown", onKeydown);
});

const toggleCollapse = () => {
  if (!collapsed.value) {
    userExpanded.value = false;
    collapsed.value = true;
  } else {
    expand();
  }
};
const expand = () => {
  userExpanded.value = true;
  collapsed.value = false;
};

// Default: start 3 months ago → today
const today = new Date();
const startDefault = new Date(today);
startDefault.setMonth(startDefault.getMonth() - 3);

const form = reactive({
  symbol: "",
  startDate: startDefault,
  endDate: today,
  offset: 0,
  limit: calcTradingDays(startDefault, today),
});

const tradingDays = computed(() =>
  calcTradingDays(form.startDate, form.endDate),
);

watch(
  () => [form.startDate, form.endDate],
  () => {
    form.limit = tradingDays.value;
  },
);

const toISODate = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const shortDate = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const handleSearch = () => {
  if (form.symbol.length !== 3 || !form.startDate || !form.endDate) return;
  emit("search", {
    symbol: form.symbol.trim().toUpperCase(),
    startDate: toISODate(form.startDate),
    endDate: toISODate(form.endDate),
    offset: form.offset ?? 0,
    limit: form.limit ?? 100,
  });
};
</script>

<style scoped>
.search-card {
  background: white;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  overflow: hidden;
}

.search-card.collapsed {
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

/* Header */
.search-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  background: linear-gradient(90deg, #f8fafc, #f1f5f9);
  border-bottom: 1px solid #e2e8f0;
  font-weight: 700;
  font-size: 0.95rem;
  color: #1e293b;
  user-select: none;
}

.search-card.collapsed .search-header {
  border-bottom: none;
}

.search-header.clickable {
  cursor: pointer;
}
.search-header.clickable:hover {
  background: linear-gradient(90deg, #f1f5f9, #e8edf3);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.header-left i {
  color: #3b82f6;
  font-size: 1rem;
  flex-shrink: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* Collapsed summary pills */
.collapsed-summary {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.pill {
  background: #e2e8f0;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  white-space: nowrap;
}

.symbol-pill {
  background: #0f3460;
  color: white;
  letter-spacing: 0.5px;
}

/* Toggle button */
.toggle-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  flex-shrink: 0;
}
.toggle-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.quick-search-btn {
  font-size: 0.8rem !important;
}

/* Body */
.search-body {
  padding: 1.25rem 1.5rem;
}

.search-grid {
  display: grid;
  grid-template-columns: 1.4fr 1.5fr 1.5fr 1.4fr;
  gap: 1rem;
  align-items: end;
}

@media (max-width: 1024px) {
  .search-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
  .btn-field {
    grid-column: 1 / -1;
  }
}

@media (max-width: 640px) {
  .search-grid {
    grid-template-columns: 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
}

.required {
  color: #ef4444;
}

.shortcut-hint {
  display: inline-block;
  margin-left: 0.4rem;
  background: #e2e8f0;
  color: #64748b;
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.05rem 0.35rem;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
  letter-spacing: 0.3px;
  vertical-align: middle;
}

.trading-days-badge {
  display: inline-block;
  margin-left: 0.4rem;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.05rem 0.4rem;
  border-radius: 4px;
  border: 1px solid #bfdbfe;
  vertical-align: middle;
}
.btn-field {
  justify-content: flex-end;
}

.search-btn {
  width: 100%;
  padding: 0.65rem 1rem !important;
  font-weight: 600 !important;
  background: linear-gradient(135deg, #0f3460, #1a5fa8) !important;
  border: none !important;
  border-radius: 8px !important;
}
.search-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0c2a50, #1550a0) !important;
}
</style>
