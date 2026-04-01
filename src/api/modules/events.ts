import { http } from "../http";
import type { DashboardAnomalyItem, SecurityEventRecord } from "@/types";
import { mockDashboardAnomalies, mockSecurityEvents } from "../mockData";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export interface EventListQuery {
  type?: string;
  from?: string;
  to?: string;
}

export async function fetchSecurityEvents(
  q?: EventListQuery
): Promise<SecurityEventRecord[]> {
  if (USE_MOCK) {
    await delay(200);
    let list = [...mockSecurityEvents];
    if (q?.type) list = list.filter((e) => e.type === q.type);
    return list;
  }
  const { data } = await http.get<SecurityEventRecord[]>("/security/events", {
    params: q,
  });
  return data;
}

export async function fetchDashboardAnomalies(): Promise<
  DashboardAnomalyItem[]
> {
  if (USE_MOCK) {
    await delay(180);
    return mockDashboardAnomalies();
  }
  const { data } = await http.get<DashboardAnomalyItem[]>(
    "/dashboard/anomalies"
  );
  return data;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
