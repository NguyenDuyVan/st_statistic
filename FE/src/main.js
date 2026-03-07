import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import "primeicons/primeicons.css";
import { Chart, registerables } from "chart.js";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, BarChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  TitleComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import router from "./router/index.js";
import "./services/auth.js"; // register axios interceptors
import App from "./App.vue";
import "./style.css";

// Register Chart.js (existing)
Chart.register(...registerables);

// Register ECharts modules (new tracker feature)
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  TitleComponent,
]);

const app = createApp(App);

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: "p",
      darkModeSelector: ".dark",
      cssLayer: false,
    },
  },
});

app.use(router);
app.component("VChart", VChart);
app.mount("#app");
