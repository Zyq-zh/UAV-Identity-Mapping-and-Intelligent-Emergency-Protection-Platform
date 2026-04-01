import { http } from "../http";
import type { DeviceDetail, DeviceRecord } from "@/types";
import { mockDeviceDetail, mockDevices } from "../mockData";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export interface DeviceListQuery {
  id?: string;
  version?: string;
  status?: string;
}

export async function fetchDevices(
  q?: DeviceListQuery
): Promise<DeviceRecord[]> {
  if (USE_MOCK) {
    await delay(220);
    let list = [...mockDevices];
    if (q?.id) list = list.filter((d) => d.id.includes(q.id!));
    if (q?.version)
      list = list.filter((d) => d.firmwareVersion.includes(q.version!));
    if (q?.status) list = list.filter((d) => d.status === q.status);
    return list;
  }
  const { data } = await http.get<DeviceRecord[]>("/devices", { params: q });
  return data;
}

export async function fetchDeviceDetail(id: string): Promise<DeviceDetail> {
  if (USE_MOCK) {
    await delay(200);
    return mockDeviceDetail(id);
  }
  const { data } = await http.get<DeviceDetail>(`/devices/${id}`);
  return data;
}

export async function banDevice(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay(300);
    return;
  }
  await http.post(`/devices/${id}/ban`);
}

export async function rollbackDeviceFirmware(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay(400);
    return;
  }
  await http.post(`/devices/${id}/rollback`);
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
