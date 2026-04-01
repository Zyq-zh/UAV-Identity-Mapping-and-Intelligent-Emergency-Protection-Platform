import { defineStore } from "pinia";
import { ref } from "vue";
import {
  fetchDroneFieldSimulation,
  fetchFleetTelemetryRadar,
  fetchLinkQualitySeries,
} from "@/api/modules/simulation";
import type {
  DroneFieldSimulation,
  FleetTelemetryRadar,
  LinkQualitySeries,
} from "@/types";

export const useSimulationStore = defineStore("simulation", () => {
  const droneField = ref<DroneFieldSimulation | null>(null);
  const linkQuality = ref<LinkQualitySeries | null>(null);
  const fleetRadar = ref<FleetTelemetryRadar | null>(null);
  const loading = ref(false);

  async function loadAll() {
    loading.value = true;
    try {
      const [d, l, f] = await Promise.all([
        fetchDroneFieldSimulation(),
        fetchLinkQualitySeries(),
        fetchFleetTelemetryRadar(),
      ]);
      droneField.value = d;
      linkQuality.value = l;
      fleetRadar.value = f;
    } finally {
      loading.value = false;
    }
  }

  return { droneField, linkQuality, fleetRadar, loading, loadAll };
});
