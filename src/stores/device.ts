import { defineStore } from "pinia";
import { ref } from "vue";
import type { DeviceDetail, DeviceRecord } from "@/types";
import {
  banDevice,
  fetchDeviceDetail,
  fetchDevices,
  rollbackDeviceFirmware,
  type DeviceListQuery,
} from "@/api/modules/devices";

export const useDeviceStore = defineStore("device", () => {
  const list = ref<DeviceRecord[]>([]);
  const loading = ref(false);

  async function loadList(q?: DeviceListQuery) {
    loading.value = true;
    try {
      list.value = await fetchDevices(q);
    } finally {
      loading.value = false;
    }
  }

  async function loadDetail(id: string): Promise<DeviceDetail> {
    return fetchDeviceDetail(id);
  }

  async function ban(id: string) {
    await banDevice(id);
    await loadList();
  }

  async function rollback(id: string) {
    await rollbackDeviceFirmware(id);
    await loadList();
  }

  return { list, loading, loadList, loadDetail, ban, rollback };
});
