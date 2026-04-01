import { defineStore } from "pinia";
import { ref } from "vue";
import type { DashboardAnomalyItem, SecurityEventRecord } from "@/types";
import {
  fetchDashboardAnomalies,
  fetchSecurityEvents,
  type EventListQuery,
} from "@/api/modules/events";

export const useEventStore = defineStore("event", () => {
  const securityEvents = ref<SecurityEventRecord[]>([]);
  const dashboardAnomalies = ref<DashboardAnomalyItem[]>([]);
  const loading = ref(false);

  async function loadSecurityEvents(q?: EventListQuery) {
    loading.value = true;
    try {
      securityEvents.value = await fetchSecurityEvents(q);
    } finally {
      loading.value = false;
    }
  }

  async function loadDashboardAnomalies() {
    loading.value = true;
    try {
      dashboardAnomalies.value = await fetchDashboardAnomalies();
    } finally {
      loading.value = false;
    }
  }

  return {
    securityEvents,
    dashboardAnomalies,
    loading,
    loadSecurityEvents,
    loadDashboardAnomalies,
  };
});
