<template>
  <div class="table-card mb-6">
    <div class="table-header">
      <div class="flex items-center gap-2">
        <i class="pi pi-table" style="color: #64748b"></i>
        <span>Dữ liệu giao dịch chi tiết</span>
        <span class="record-badge">{{ data.length }} bản ghi</span>
      </div>
    </div>

    <DataTable
      :value="tableData"
      stripedRows
      scrollable
      scrollHeight="520px"
      :paginator="true"
      :rows="20"
      :rowsPerPageOptions="[10, 20, 50, 100]"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      sortMode="multiple"
      removableSort
      size="small"
      class="the-table"
    >
      <Column
        field="date"
        header="Ngày"
        sortable
        frozen
        style="min-width: 95px"
      >
        <template #body="{ data: row }">
          <span class="date-cell">{{ fmtDate(row.date) }}</span>
        </template>
      </Column>

      <Column
        field="priceOpen"
        header="Mở cửa"
        sortable
        style="min-width: 85px"
      >
        <template #body="{ data: row }">{{ fmtP(row.priceOpen) }}</template>
      </Column>

      <Column
        field="priceHigh"
        header="Cao nhất"
        sortable
        style="min-width: 85px"
      >
        <template #body="{ data: row }">
          <span class="text-green-600 font-semibold">{{
            fmtP(row.priceHigh)
          }}</span>
        </template>
      </Column>

      <Column
        field="priceLow"
        header="Thấp nhất"
        sortable
        style="min-width: 85px"
      >
        <template #body="{ data: row }">
          <span class="text-red-500 font-semibold">{{
            fmtP(row.priceLow)
          }}</span>
        </template>
      </Column>

      <Column
        field="priceClose"
        header="Đóng cửa"
        sortable
        style="min-width: 85px"
      >
        <template #body="{ data: row }">
          <span :class="closeClass(row)" class="font-bold">{{
            fmtP(row.priceClose)
          }}</span>
        </template>
      </Column>

      <Column
        field="totalVolume"
        header="KL GD"
        sortable
        style="min-width: 110px"
      >
        <template #body="{ data: row }">{{ fmtN(row.totalVolume) }}</template>
      </Column>

      <Column
        field="totalValue"
        header="GT GD (tỷ)"
        sortable
        style="min-width: 105px"
      >
        <template #body="{ data: row }">{{ fmtBil(row.totalValue) }}</template>
      </Column>

      <Column
        field="buyForeignQuantity"
        header="NN Mua"
        sortable
        style="min-width: 100px"
      >
        <template #body="{ data: row }">
          <span class="text-green-600">{{ fmtN(row.buyForeignQuantity) }}</span>
        </template>
      </Column>

      <Column
        field="sellForeignQuantity"
        header="NN Bán"
        sortable
        style="min-width: 100px"
      >
        <template #body="{ data: row }">
          <span class="text-red-500">{{ fmtN(row.sellForeignQuantity) }}</span>
        </template>
      </Column>

      <Column header="NN Ròng" sortable style="min-width: 105px">
        <template #body="{ data: row }">
          <span :class="netClass(row)" class="font-semibold">{{
            fmtNet(row)
          }}</span>
        </template>
      </Column>

      <Column
        field="currentForeignRoom"
        header="Room NN"
        sortable
        style="min-width: 120px"
      >
        <template #body="{ data: row }">{{
          fmtN(row.currentForeignRoom)
        }}</template>
      </Column>

      <Column
        field="buyQuantity"
        header="Tổng Mua"
        sortable
        style="min-width: 110px"
      >
        <template #body="{ data: row }">{{ fmtN(row.buyQuantity) }}</template>
      </Column>

      <Column
        field="sellQuantity"
        header="Tổng Bán"
        sortable
        style="min-width: 110px"
      >
        <template #body="{ data: row }">{{ fmtN(row.sellQuantity) }}</template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { computed } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

const props = defineProps({
  data: { type: Array, default: () => [] },
});

// Most recent date first
const tableData = computed(() => [...props.data].reverse());

const fmtDate = (s) => {
  if (!s) return "-";
  const d = new Date(s);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};
const fmtN = (n) =>
  n != null ? new Intl.NumberFormat("vi-VN").format(n) : "-";

const fmtP = (n) =>
  n
    ? new Intl.NumberFormat("vi-VN", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(n)
    : "-";

const fmtBil = (n) => (n ? (n / 1_000_000_000).toFixed(2) : "-");

const closeClass = (row) => {
  if (row.priceClose > row.priceBasic) return "text-green-600";
  if (row.priceClose < row.priceBasic) return "text-red-500";
  return "text-yellow-500";
};

const netClass = (row) => {
  const net = (row.buyForeignQuantity || 0) - (row.sellForeignQuantity || 0);
  if (net > 0) return "text-green-600";
  if (net < 0) return "text-red-500";
  return "text-gray-500";
};

const fmtNet = (row) => {
  const net = (row.buyForeignQuantity || 0) - (row.sellForeignQuantity || 0);
  const abs = fmtN(Math.abs(net));
  if (net > 0) return "+" + abs;
  if (net < 0) return "-" + abs;
  return "0";
};
</script>

<style scoped>
.table-card {
  background: white;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  overflow: hidden;
}

.table-header {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 700;
  font-size: 0.95rem;
  color: #1e293b;
}

.record-badge {
  background: #e2e8f0;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  margin-left: 0.5rem;
}

.the-table {
  font-size: 0.83rem;
}

.date-cell {
  font-weight: 600;
  color: #334155;
}
</style>
