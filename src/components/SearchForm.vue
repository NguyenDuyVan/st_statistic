<template>
  <div class="search-card mb-6">
    <div class="search-header">
      <i class="pi pi-sliders-h"></i>
      <span>Tìm kiếm dữ liệu</span>
    </div>
    <div class="search-body">
      <div class="search-grid">
        <!-- Symbol -->
        <div class="field">
          <label>Mã cổ phiếu <span class="required">*</span></label>
          <InputText
            v-model="form.symbol"
            placeholder="VD: SHS, VNM, HPG..."
            class="w-full"
            @input="form.symbol = form.symbol.toUpperCase()"
          />
        </div>

        <!-- Start Date -->
        <div class="field">
          <label>Từ ngày <span class="required">*</span></label>
          <DatePicker
            v-model="form.startDate"
            dateFormat="dd/mm/yy"
            placeholder="Ngày bắt đầu"
            showIcon
            class="w-full"
          />
        </div>

        <!-- End Date -->
        <div class="field">
          <label>Đến ngày <span class="required">*</span></label>
          <DatePicker
            v-model="form.endDate"
            dateFormat="dd/mm/yy"
            placeholder="Ngày kết thúc"
            showIcon
            class="w-full"
          />
        </div>

        <!-- Offset -->
        <div class="field">
          <label>Offset</label>
          <InputNumber
            v-model="form.offset"
            placeholder="0"
            :min="0"
            showButtons
            class="w-full"
          />
        </div>

        <!-- Limit -->
        <div class="field">
          <label>Số bản ghi</label>
          <InputNumber
            v-model="form.limit"
            placeholder="100"
            :min="1"
            :max="1000"
            showButtons
            class="w-full"
          />
        </div>

        <!-- Search Button -->
        <div class="field btn-field">
          <Button
            label="Tìm kiếm"
            icon="pi pi-search"
            :loading="loading"
            @click="handleSearch"
            class="w-full search-btn"
            :disabled="!form.symbol || !form.startDate || !form.endDate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";

defineProps({ loading: Boolean });
const emit = defineEmits(["search"]);

// Default: last 3 months → today
const today = new Date();
const startDefault = new Date("2023-02-27");

const form = reactive({
  symbol: "SHS",
  startDate: startDefault,
  endDate: today,
  offset: 0,
  limit: 100,
});

const toISODate = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const handleSearch = () => {
  if (!form.symbol || !form.startDate || !form.endDate) return;
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

.search-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(90deg, #f8fafc, #f1f5f9);
  border-bottom: 1px solid #e2e8f0;
  font-weight: 700;
  font-size: 0.95rem;
  color: #1e293b;
}

.search-header i {
  color: #3b82f6;
  font-size: 1rem;
}

.search-body {
  padding: 1.25rem 1.5rem;
}

.search-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 1rem;
  align-items: end;
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

.btn-field {
  justify-content: flex-end;
}

.search-btn {
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
