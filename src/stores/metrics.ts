import { defineStore } from "pinia";
import { ref } from "vue";
import type { SystemMetrics } from "@/types";
import { fetchSystemMetrics } from "@/api/modules/metrics";

export const useMetricsStore = defineStore("metrics", () => {
  const metrics = ref<SystemMetrics | null>(null);
  const loading = ref(false);

  async function load() {
    loading.value = true;
    try {
      metrics.value = await fetchSystemMetrics();
    } finally {
      loading.value = false;
    }
  }

  return { metrics, loading, load };
});
