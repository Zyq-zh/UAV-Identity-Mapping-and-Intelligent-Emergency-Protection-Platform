export type DeviceOnlineStatus = "online" | "offline" | "degraded";

export interface DeviceRecord {
  id: string;
  identity5g: string;
  firmwareVersion: string;
  status: DeviceOnlineStatus;
  lastActiveAt: string;
  tags?: string[];
}

export interface DeviceUpgradeHistoryItem {
  id: string;
  fromVersion: string;
  toVersion: string;
  at: string;
  result: "success" | "failed" | "rolled_back";
}

export interface DeviceAnomalyItem {
  id: string;
  at: string;
  type: string;
  detail: string;
}

export interface DeviceSessionToken {
  jti: string;
  issuedAt: string;
  expiresAt: string;
  revoked: boolean;
}

export interface DeviceDetail extends DeviceRecord {
  upgradeHistory: DeviceUpgradeHistoryItem[];
  anomalies: DeviceAnomalyItem[];
  sessionToken: DeviceSessionToken;
}
