import type {
  DashboardAnomalyItem,
  DeviceDetail,
  DeviceRecord,
  DroneFieldSimulation,
  FleetTelemetryRadar,
  LinkQualitySeries,
  OtaFailureTrendPoint,
  OtaTask,
  SecurityEventRecord,
  SystemMetrics,
  Vec3,
} from "@/types";

/** 开发阶段模拟数据，可替换为后端契约 */
export const mockMetrics: SystemMetrics = {
  onlineDevices: 186,
  illegalOtaBlockRate: 98.6,
  identitySpoofDetectRate: 92.4,
  avgResponseSeconds: 6.2,
};

const regions = ["华东", "华北", "华南", "西南", "巡检", "物流", "应急", "测绘"];
const fwPool = ["v2.0.2", "v2.0.1", "v2.0.0", "v1.9.4", "v1.9.2"];

function rnd(seed: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

export const mockDevices: DeviceRecord[] = Array.from({ length: 22 }, (_, i) => {
  const id = 10020 + i;
  const st = i % 7 === 0 ? "offline" : i % 11 === 0 ? "degraded" : "online";
  const tags = [regions[i % regions.length], regions[(i + 3) % regions.length]].filter(
    (t, j, a) => a.indexOf(t) === j
  );
  return {
    id: `UAV-${id}`,
    identity5g: `imsi-46000${String(100000000000 + i * 137).slice(0, 12)}`,
    firmwareVersion: fwPool[i % fwPool.length],
    status: st as DeviceRecord["status"],
    lastActiveAt: new Date(
      Date.now() - (i % 5) * 3_600_000 - rnd(i) * 86400000
    ).toISOString(),
    tags,
  };
});

export function mockDeviceDetail(id: string): DeviceDetail {
  const base = mockDevices.find((d) => d.id === id) ?? mockDevices[0];
  return {
    ...base,
    upgradeHistory: [
      {
        id: "h1",
        fromVersion: "v1.9.4",
        toVersion: "v2.0.1",
        at: "2026-03-10T09:00:00+08:00",
        result: "success",
      },
      {
        id: "h2",
        fromVersion: "v1.8.0",
        toVersion: "v1.9.4",
        at: "2026-01-05T11:20:00+08:00",
        result: "success",
      },
      {
        id: "h3",
        fromVersion: "v1.7.2",
        toVersion: "v1.8.0",
        at: "2025-11-18T16:40:00+08:00",
        result: "failed",
      },
    ],
    anomalies: [
      {
        id: "a1",
        at: "2026-03-19T12:01:00+08:00",
        type: "签名异常",
        detail: "固件包签名校验失败，已阻断 OTA",
      },
      {
        id: "a2",
        at: "2026-03-12T08:22:00+08:00",
        type: "会话异常",
        detail: "Token 刷新间隔过短，疑似重放",
      },
    ],
    sessionToken: {
      jti: "tok_" + id.replace(/\W/g, ""),
      issuedAt: "2026-03-19T08:00:00+08:00",
      expiresAt: "2026-03-19T20:00:00+08:00",
      revoked: false,
    },
  };
}

export const mockSecurityEvents: SecurityEventRecord[] = [
  {
    id: "evt-001",
    at: "2026-03-19T14:18:22+08:00",
    deviceId: "UAV-10088",
    type: "identity_spoof",
    action: "block",
    status: "closed",
    attackPath: ["攻击者", "伪造 5G SUCI", "无人机", "OTA 通道"],
    auditJson: {
      rule: "OTA-ID-BIND-01",
      decision: "block",
      latency_ms: 420,
    },
  },
  {
    id: "evt-002",
    at: "2026-03-19T13:55:10+08:00",
    deviceId: "UAV-10021",
    type: "downgrade",
    action: "rollback",
    status: "handling",
    attackPath: ["攻击者", "中间人", "固件仓库", "恶意 v1.0 包"],
    auditJson: { chain: ["v2.0.1", "v1.0.0"], anomaly: "illegal_downgrade" },
  },
  {
    id: "evt-003",
    at: "2026-03-19T12:40:00+08:00",
    deviceId: "UAV-10102",
    type: "replay",
    action: "block",
    status: "closed",
    attackPath: ["攻击者", "重放 Token", "OTA 会话"],
    auditJson: { nonce_reuse: true },
  },
  {
    id: "evt-004",
    at: "2026-03-19T11:05:33+08:00",
    deviceId: "UAV-10021",
    type: "signature_invalid",
    action: "ban",
    status: "closed",
    attackPath: ["固件包", "签名链", "校验失败"],
    auditJson: { cert: "revoked" },
  },
  {
    id: "evt-005",
    at: "2026-03-19T10:12:00+08:00",
    deviceId: "UAV-10025",
    type: "replay",
    action: "block",
    status: "closed",
    attackPath: ["边界网关", "重放 Nonce", "OTA API"],
    auditJson: { replay_window_ms: 80 },
  },
  {
    id: "evt-006",
    at: "2026-03-19T09:44:18+08:00",
    deviceId: "UAV-10031",
    type: "identity_spoof",
    action: "block",
    status: "handling",
    attackPath: ["异常基站", "SUCI 映射不一致", "核心网查询"],
    auditJson: { cell_id: "460-11-22xxx" },
  },
  {
    id: "evt-007",
    at: "2026-03-19T08:30:55+08:00",
    deviceId: "UAV-10040",
    type: "downgrade",
    action: "rollback",
    status: "closed",
    attackPath: ["CDN 边缘", "缓存投毒", "旧版 manifest"],
    auditJson: { manifest_hash_mismatch: true },
  },
  {
    id: "evt-008",
    at: "2026-03-18T22:15:40+08:00",
    deviceId: "UAV-10055",
    type: "signature_invalid",
    action: "block",
    status: "closed",
    attackPath: ["固件分片", "哈希链", "签名校验"],
    auditJson: { shard: 7 },
  },
  {
    id: "evt-009",
    at: "2026-03-18T19:02:11+08:00",
    deviceId: "UAV-10060",
    type: "identity_spoof",
    action: "ban",
    status: "closed",
    attackPath: ["伪造 IMSI", "策略引擎", "拒绝接入"],
    auditJson: { imsi_blocklist_hit: true },
  },
  {
    id: "evt-010",
    at: "2026-03-18T16:48:00+08:00",
    deviceId: "UAV-10072",
    type: "replay",
    action: "block",
    status: "closed",
    attackPath: ["会话层", "重复 JWT jti", "OTA 下载"],
    auditJson: { jti_reuse: true },
  },
  {
    id: "evt-011",
    at: "2026-03-18T14:20:00+08:00",
    deviceId: "UAV-10081",
    type: "signature_invalid",
    action: "block",
    status: "handling",
    attackPath: ["镜像仓库", "中间签名", "不可信 CA"],
    auditJson: { ca_trust: "fail" },
  },
  {
    id: "evt-012",
    at: "2026-03-18T11:05:00+08:00",
    deviceId: "UAV-10090",
    type: "downgrade",
    action: "rollback",
    status: "closed",
    attackPath: ["策略下发", "版本比较", "阻断降级"],
    auditJson: { min_version: "v1.9.0" },
  },
];

export function mockDashboardAnomalies(): DashboardAnomalyItem[] {
  const base = mockSecurityEvents;
  const types = [
    "identity_spoof",
    "downgrade",
    "replay",
    "signature_invalid",
  ] as const;
  const out: DashboardAnomalyItem[] = [];
  for (let i = 0; i < 18; i++) {
    const src = base[i % base.length];
    out.push({
      id: `dash-${i}`,
      at: new Date(Date.now() - i * 3200_000 - rnd(i) * 600_000).toISOString(),
      deviceId: mockDevices[i % mockDevices.length].id,
      type: types[i % types.length],
      status: i % 3 === 0 ? "closed" : i % 3 === 1 ? "handling" : "open",
      attackPath: src.attackPath,
    });
  }
  return out;
}

export const mockOtaTasks: OtaTask[] = [
  {
    id: "OTA-20260319-01",
    targetCount: 120,
    version: "v2.0.2",
    status: "running",
    createdAt: "2026-03-19T10:00:00+08:00",
  },
  {
    id: "OTA-20260318-07",
    targetCount: 300,
    version: "v2.0.1",
    status: "success",
    createdAt: "2026-03-18T18:30:00+08:00",
  },
  {
    id: "OTA-20260317-03",
    targetCount: 88,
    version: "v2.0.1",
    status: "paused",
    createdAt: "2026-03-17T09:15:00+08:00",
  },
  {
    id: "OTA-20260316-12",
    targetCount: 210,
    version: "v2.0.0",
    status: "success",
    createdAt: "2026-03-16T14:00:00+08:00",
  },
  {
    id: "OTA-20260315-02",
    targetCount: 56,
    version: "v1.9.4",
    status: "failed",
    createdAt: "2026-03-15T11:40:00+08:00",
  },
  {
    id: "OTA-20260314-09",
    targetCount: 412,
    version: "v2.0.0",
    status: "success",
    createdAt: "2026-03-14T20:10:00+08:00",
  },
  {
    id: "OTA-20260313-01",
    targetCount: 134,
    version: "v1.9.4",
    status: "success",
    createdAt: "2026-03-13T08:25:00+08:00",
  },
];

export const mockOtaUpgradeOverview = {
  upgradingCount: 42,
  lastTaskSuccessRate: 96.2,
  lastTaskFailRate: 3.8,
  versionDistribution: [
    { version: "v2.0.2", count: 62 },
    { version: "v2.0.1", count: 98 },
    { version: "v2.0.0", count: 54 },
    { version: "v1.9.x", count: 34 },
    { version: "v1.8.x", count: 12 },
  ],
};

export const mockOtaFailureTrend: OtaFailureTrendPoint[] = Array.from(
  { length: 14 },
  (_, i) => {
    const day = 16 + i;
    return {
      date: `03-${String(day).padStart(2, "0")}`,
      failRate: Number(
        (1.0 + Math.sin(i / 2.2) * 0.65 + rnd(i + 3) * 0.45).toFixed(2)
      ),
    };
  }
);

function terrainZ(x: number, y: number): number {
  return Math.sin(x / 30) * 18 + Math.cos(y / 28) * 15 + 42;
}

function buildMockFlightPath(): Vec3[] {
  const path: Vec3[] = [];
  for (let i = 0; i <= 52; i++) {
    const t = i / 52;
    const x = Number((-95 + t * 190).toFixed(1));
    const y = Number(
      (Math.sin(t * Math.PI * 2.1) * 58 + Math.cos(t * 5) * 14).toFixed(1)
    );
    const g = terrainZ(x, y);
    const z = Number((g + 26 + Math.sin(t * Math.PI) * 14 + t * 6).toFixed(1));
    path.push([x, y, z]);
  }
  return path;
}

export const mockDroneFieldSimulation: DroneFieldSimulation = {
  siteName: "华东 · 滨江巡检示范区 A3",
  flightPath: buildMockFlightPath(),
  home: [-95, 0, 78],
};

export const mockLinkQualitySeries: LinkQualitySeries = (() => {
  const labels: string[] = [];
  const rsrpDbm: number[] = [];
  const sinrDb: number[] = [];
  const throughputMbps: number[] = [];
  for (let h = 0; h < 24; h++) {
    labels.push(`${String(h).padStart(2, "0")}:00`);
    const wobble = Math.sin(h / 3.5) * 4 + rnd(h) * 3;
    rsrpDbm.push(Number((-98 + wobble).toFixed(1)));
    sinrDb.push(Number((12 + Math.cos(h / 4) * 5 + rnd(h + 1) * 2).toFixed(1)));
    throughputMbps.push(
      Number((38 + Math.sin(h / 6) * 22 + rnd(h + 2) * 8).toFixed(1))
    );
  }
  return { labels, rsrpDbm, sinrDb, throughputMbps };
})();

export const mockFleetTelemetryRadar: FleetTelemetryRadar = {
  dimensions: [
    { name: "电量储备", max: 100 },
    { name: "GNSS 定位", max: 100 },
    { name: "5G 链路", max: 100 },
    { name: "姿态稳定", max: 100 },
    { name: "OTA 健康", max: 100 },
    { name: "避障感知", max: 100 },
  ],
  values: [86, 92, 88, 79, 94, 83],
};
