<template>
  <div class="layout-wrapper">
    <Sidebar v-if="!isLoginPage" />
    <div class="layout-main">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "./components/Sidebar.vue";

const route = useRoute();
const isLoginPage = computed(() => route.path === "/login");
</script>

<style>
/* ── Reset & global ── */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  background: #f0f4f8;
  color: #1e293b;
}
</style>

<style scoped>
.layout-wrapper {
  display: flex;
  min-height: 100vh;
}

.layout-main {
  flex: 1;
  overflow-y: auto;
  min-height: 100vh;
  background: #f0f4f8;
}
</style>
