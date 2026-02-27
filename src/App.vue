<template>
  <div class="app-wrapper">
    <!-- Header -->
    <header class="app-header">
      <div class="header-inner">
        <div class="flex items-center gap-3">
          <div class="header-icon">
            <i class="pi pi-chart-line"></i>
          </div>
          <div>
            <h1 class="header-title">Thống Kê Chứng Khoán</h1>
            <p class="header-sub">
              Phân tích dữ liệu giao dịch cổ phiếu Việt Nam
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <SearchForm @search="handleSearch" :loading="loading" />

      <Message
        v-if="error"
        severity="error"
        :closable="true"
        @close="error = null"
        class="mb-4"
      >
        {{ error }}
      </Message>

      <div v-if="loading" class="loading-state">
        <ProgressSpinner strokeWidth="4" />
        <p>Đang tải dữ liệu...</p>
      </div>

      <template v-if="stockData.length > 0 && !loading">
        <!-- Symbol header -->
        <div class="symbol-header mb-5">
          <div class="flex items-center gap-4">
            <div class="symbol-badge">{{ currentSymbol }}</div>
            <div>
              <p class="symbol-date">
                <i class="pi pi-calendar mr-1"></i>
                {{ formatDate(searchParams.startDate) }} →
                {{ formatDate(searchParams.endDate) }}
              </p>
              <p class="symbol-count">{{ stockData.length }} phiên giao dịch</p>
            </div>
          </div>
        </div>

        <StatsOverview :data="stockData" />
        <PriceVolumeChart :data="stockData" :symbol="currentSymbol" />
        <ForeignSection :data="stockData" :symbol="currentSymbol" />
        <StockDataTable :data="stockData" />
      </template>

      <div
        v-if="!loading && stockData.length === 0 && hasSearched"
        class="empty-state"
      >
        <i class="pi pi-inbox"></i>
        <h3>Không có dữ liệu</h3>
        <p>Không tìm thấy dữ liệu giao dịch cho khoảng thời gian đã chọn</p>
      </div>

      <div v-if="!hasSearched" class="initial-state">
        <i class="pi pi-search"></i>
        <h3>Nhập thông tin để bắt đầu</h3>
        <p>Chọn mã cổ phiếu và khoảng thời gian để xem thống kê giao dịch</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import SearchForm from "./components/SearchForm.vue";
import StatsOverview from "./components/StatsOverview.vue";
import PriceVolumeChart from "./components/PriceVolumeChart.vue";
import ForeignSection from "./components/ForeignSection.vue";
import StockDataTable from "./components/StockDataTable.vue";
import { fetchHistoricalQuotes } from "./services/stockApi.js";

const stockData = ref([]);
const loading = ref(false);
const error = ref(null);
const hasSearched = ref(false);
const currentSymbol = ref("");
const searchParams = ref({ startDate: null, endDate: null });

const handleSearch = async (params) => {
  loading.value = true;
  error.value = null;
  hasSearched.value = true;
  searchParams.value = params;
  currentSymbol.value = params.symbol.toUpperCase();

  try {
    const data = await fetchHistoricalQuotes(
      params.symbol,
      params.startDate,
      params.endDate,
      params.offset,
      params.limit,
    );
    stockData.value = [...data].sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );
  } catch (err) {
    error.value = `Lỗi khi tải dữ liệu: ${err.response?.data?.message || err.message}`;
    stockData.value = [];
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, #0f3460 0%, #1a4080 50%, #0f3460 100%);
  color: white;
  padding: 1.25rem 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.header-inner {
  max-width: 1400px;
  margin: 0 auto;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.header-sub {
  font-size: 0.8rem;
  opacity: 0.75;
  margin-top: 0.1rem;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
}

.symbol-header {
  background: white;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-left: 4px solid #0f3460;
}

.symbol-badge {
  background: #0f3460;
  color: white;
  font-size: 1.3rem;
  font-weight: 800;
  padding: 0.4rem 1.1rem;
  border-radius: 8px;
  letter-spacing: 1px;
}

.symbol-date {
  color: #4b5563;
  font-size: 0.9rem;
}

.symbol-count {
  color: #9ca3af;
  font-size: 0.8rem;
  margin-top: 0.15rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 5rem 2rem;
  color: #666;
}

.empty-state,
.initial-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 6rem 2rem;
  color: #9ca3af;
  text-align: center;
}

.empty-state i,
.initial-state i {
  font-size: 4rem;
  opacity: 0.3;
}

.empty-state h3,
.initial-state h3 {
  font-size: 1.2rem;
  color: #6b7280;
  font-weight: 600;
}

.empty-state p,
.initial-state p {
  font-size: 0.9rem;
}
</style>
