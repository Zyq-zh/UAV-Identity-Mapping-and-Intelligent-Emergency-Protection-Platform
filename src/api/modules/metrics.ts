import { http } from "../http";
import type { SystemMetrics } from "@/types";
import { mockMetrics } from "../mockData";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export async function fetchSystemMetrics(): Promise<SystemMetrics> {
  if (USE_MOCK) {
    await delay(200);
    return { ...mockMetrics };
  }
  const { data } = await http.get<SystemMetrics>("/metrics/overview");
  return data;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
