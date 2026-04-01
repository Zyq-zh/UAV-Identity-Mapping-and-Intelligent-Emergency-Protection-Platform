import { http } from "../http";
import type {
  OtaFailureTrendPoint,
  OtaTask,
  OtaUpgradeOverview,
} from "@/types";
import {
  mockOtaFailureTrend,
  mockOtaTasks,
  mockOtaUpgradeOverview,
} from "../mockData";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export async function fetchOtaTasks(): Promise<OtaTask[]> {
  if (USE_MOCK) {
    await delay(200);
    return [...mockOtaTasks];
  }
  const { data } = await http.get<OtaTask[]>("/ota/tasks");
  return data;
}

export async function fetchOtaOverview(): Promise<OtaUpgradeOverview> {
  if (USE_MOCK) {
    await delay(200);
    return { ...mockOtaUpgradeOverview };
  }
  const { data } = await http.get<OtaUpgradeOverview>("/ota/overview");
  return data;
}

export async function fetchOtaFailureTrend(): Promise<OtaFailureTrendPoint[]> {
  if (USE_MOCK) {
    await delay(200);
    return [...mockOtaFailureTrend];
  }
  const { data } = await http.get<OtaFailureTrendPoint[]>("/ota/failure-trend");
  return data;
}

export interface CreateOtaTaskPayload {
  targetTag?: string;
  targetVersion?: string;
  toVersion: string;
  windowStart: string;
  windowEnd: string;
}

export async function createOtaTask(
  payload: CreateOtaTaskPayload
): Promise<OtaTask> {
  if (USE_MOCK) {
    await delay(350);
    return {
      id: "OTA-MOCK-" + Date.now(),
      targetCount: 50,
      version: payload.toVersion,
      status: "running",
      createdAt: new Date().toISOString(),
    };
  }
  const { data } = await http.post<OtaTask>("/ota/tasks", payload);
  return data;
}

export async function pauseOtaDistribution(): Promise<void> {
  if (USE_MOCK) {
    await delay(250);
    return;
  }
  await http.post("/ota/pause-distribution");
}

export async function rollbackOtaVersion(): Promise<void> {
  if (USE_MOCK) {
    await delay(300);
    return;
  }
  await http.post("/ota/rollback-version");
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
