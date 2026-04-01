/** 无人机实地巡检 · 3D 航线与地形仿真（模拟数据契约） */

export type Vec3 = [number, number, number];

export interface DroneFieldSimulation {
  siteName: string;
  /** 航线关键点 [东向 m, 北向 m, 海拔 m] */
  flightPath: Vec3[];
  /** 起降点 */
  home: Vec3;
}

/** 5G 链路质量时序（单小区聚合） */
export interface LinkQualitySeries {
  labels: string[];
  rsrpDbm: number[];
  sinrDb: number[];
  throughputMbps: number[];
}

/** 机队平均遥测雷达图（0–100 归一化） */
export interface FleetTelemetryRadar {
  dimensions: { name: string; max: number }[];
  values: number[];
}
