import { defineStore } from "pinia";
import { ref } from "vue";
import type { OtaFailureTrendPoint, OtaTask, OtaUpgradeOverview } from "@/types";
import {
  createOtaTask,
  fetchOtaFailureTrend,
  fetchOtaOverview,
  fetchOtaTasks,
  pauseOtaDistribution,
  rollbackOtaVersion,
  type CreateOtaTaskPayload,
} from "@/api/modules/ota";

export const useOtaStore = defineStore("ota", () => {
  const tasks = ref<OtaTask[]>([]);
  const overview = ref<OtaUpgradeOverview | null>(null);
  const failureTrend = ref<OtaFailureTrendPoint[]>([]);
  const loading = ref(false);

  async function loadTasks() {
    loading.value = true;
    try {
      tasks.value = await fetchOtaTasks();
    } finally {
      loading.value = false;
    }
  }

  async function loadOverview() {
    overview.value = await fetchOtaOverview();
  }

  async function loadFailureTrend() {
    failureTrend.value = await fetchOtaFailureTrend();
  }

  async function loadAll() {
    loading.value = true;
    try {
      const [t, o, f] = await Promise.all([
        fetchOtaTasks(),
        fetchOtaOverview(),
        fetchOtaFailureTrend(),
      ]);
      tasks.value = t;
      overview.value = o;
      failureTrend.value = f;
    } finally {
      loading.value = false;
    }
  }

  async function createTask(payload: CreateOtaTaskPayload) {
    const task = await createOtaTask(payload);
    tasks.value = [task, ...tasks.value];
    return task;
  }

  async function pauseDistribution() {
    await pauseOtaDistribution();
    await loadTasks();
  }

  async function rollbackVersion() {
    await rollbackOtaVersion();
    await loadTasks();
  }

  return {
    tasks,
    overview,
    failureTrend,
    loading,
    loadTasks,
    loadOverview,
    loadFailureTrend,
    loadAll,
    createTask,
    pauseDistribution,
    rollbackVersion,
  };
});
