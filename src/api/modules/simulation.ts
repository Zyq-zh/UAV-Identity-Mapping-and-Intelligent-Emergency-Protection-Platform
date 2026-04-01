import { http } from "../http";
import type {
  DroneFieldSimulation,
  FleetTelemetryRadar,
  LinkQualitySeries,
} from "@/types";
import {
  mockDroneFieldSimulation,
  mockFleetTelemetryRadar,
  mockLinkQualitySeries,
} from "../mockData";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchDroneFieldSimulation(): Promise<DroneFieldSimulation> {
  if (USE_MOCK) {
    await delay(180);
    return structuredClone(mockDroneFieldSimulation);
  }
  const { data } = await http.get<DroneFieldSimulation>(
    "/simulation/drone-field"
  );
  return data;
}

export async function fetchLinkQualitySeries(): Promise<LinkQualitySeries> {
  if (USE_MOCK) {
    await delay(160);
    return structuredClone(mockLinkQualitySeries);
  }
  const { data } = await http.get<LinkQualitySeries>(
    "/simulation/link-quality"
  );
  return data;
}

export async function fetchFleetTelemetryRadar(): Promise<FleetTelemetryRadar> {
  if (USE_MOCK) {
    await delay(140);
    return structuredClone(mockFleetTelemetryRadar);
  }
  const { data } = await http.get<FleetTelemetryRadar>(
    "/simulation/fleet-telemetry"
  );
  return data;
}
