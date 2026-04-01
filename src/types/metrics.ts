export interface SystemMetrics {
  onlineDevices: number;
  illegalOtaBlockRate: number;
  identitySpoofDetectRate: number;
  avgResponseSeconds: number;
}

export interface OtaUpgradeOverview {
  upgradingCount: number;
  lastTaskSuccessRate: number;
  lastTaskFailRate: number;
  versionDistribution: { version: string; count: number }[];
}

export interface OtaTask {
  id: string;
  targetCount: number;
  version: string;
  status: "running" | "success" | "failed" | "paused";
  createdAt: string;
}

export interface OtaFailureTrendPoint {
  date: string;
  failRate: number;
}
