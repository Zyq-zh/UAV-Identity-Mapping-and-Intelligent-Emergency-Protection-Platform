# 无人机 OTA · 5G 身份映射与智能应急防护平台

本项目为前端管理端（Vue3 + TS + Vite），本文档用于对接后端接口，作为联调与上线前的统一契约说明。

## 1. 快速启动

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

## 2. 环境变量与联调开关

项目当前环境变量（`.env.development`）：

- `VITE_USE_MOCK=true`：默认走前端 Mock 数据
- `VITE_API_BASE=/api`：Axios 基础路径

切换真实后端时建议：

```env
VITE_USE_MOCK=false
VITE_API_BASE=https://your-domain.com/api
```

## 3. 鉴权与请求约定

### 3.1 鉴权方式

- 前端通过 `localStorage` 的 `access_token` 注入请求头：
  - `Authorization: Bearer <access_token>`
- 当接口返回 `401` 时，前端会自动清理本地 token。

### 3.2 请求基础配置

- Base URL：`VITE_API_BASE`（默认 `/api`）
- 超时时间：`15000ms`
- Content-Type：默认 `application/json`

### 3.3 错误处理约定

- 前端会优先读取 `response.data.message` 作为提示文案；
- 若后端无 `message` 字段，则回退为网络错误信息。

> 建议后端统一错误结构至少包含 `message` 字段，便于前端展示。

## 4. 数据模型（核心字段）

### 4.1 设备相关

`DeviceRecord`

```json
{
  "id": "UAV-10021",
  "identity5g": "imsi-460001234567890",
  "firmwareVersion": "v2.0.1",
  "status": "online",
  "lastActiveAt": "2026-03-19T12:01:00+08:00",
  "tags": ["华东", "巡检"]
}
```

`DeviceDetail` 在 `DeviceRecord` 基础上新增：

- `upgradeHistory[]`：升级历史
- `anomalies[]`：异常记录
- `sessionToken`：会话 Token 信息（`jti/issuedAt/expiresAt/revoked`）

### 4.2 安全事件相关

`SecurityEventRecord`

```json
{
  "id": "evt-001",
  "at": "2026-03-19T14:18:22+08:00",
  "deviceId": "UAV-10088",
  "type": "identity_spoof",
  "action": "block",
  "status": "closed",
  "attackPath": ["攻击者", "伪造 5G SUCI", "无人机", "OTA 通道"],
  "auditJson": {
    "rule": "OTA-ID-BIND-01",
    "decision": "block",
    "latency_ms": 420
  }
}
```

枚举值：

- `type`: `identity_spoof` | `downgrade` | `replay` | `signature_invalid`
- `action`: `block` | `ban` | `rollback`
- `status`: `open` | `handling` | `closed`

### 4.3 指标与 OTA

`SystemMetrics`

```json
{
  "onlineDevices": 186,
  "illegalOtaBlockRate": 98.6,
  "identitySpoofDetectRate": 92.4,
  "avgResponseSeconds": 6.2
}
```

`OtaTask`

```json
{
  "id": "OTA-20260319-01",
  "targetCount": 120,
  "version": "v2.0.2",
  "status": "running",
  "createdAt": "2026-03-19T10:00:00+08:00"
}
```

`OtaUpgradeOverview`

```json
{
  "upgradingCount": 42,
  "lastTaskSuccessRate": 96.2,
  "lastTaskFailRate": 3.8,
  "versionDistribution": [
    { "version": "v2.0.2", "count": 62 }
  ]
}
```

## 5. 接口清单（按前端已实现模块）

说明：以下路径均为相对 `VITE_API_BASE` 的路径。

### 5.1 系统指标

#### 获取系统总览指标

- Method: `GET`
- Path: `/metrics/overview`
- Query: 无
- Response: `SystemMetrics`

---

### 5.2 设备管理

#### 获取设备列表

- Method: `GET`
- Path: `/devices`
- Query（可选）：
  - `id: string`（设备 ID 模糊匹配）
  - `version: string`（固件版本模糊匹配）
  - `status: string`（建议枚举：`online/offline/degraded`）
- Response: `DeviceRecord[]`

#### 获取设备详情

- Method: `GET`
- Path: `/devices/{id}`
- Response: `DeviceDetail`

#### 封禁设备

- Method: `POST`
- Path: `/devices/{id}/ban`
- Body: 无
- Response: 建议 `204 No Content` 或 `{ "message": "ok" }`

#### 设备固件回滚

- Method: `POST`
- Path: `/devices/{id}/rollback`
- Body: 无
- Response: 建议 `204 No Content` 或 `{ "message": "ok" }`

---

### 5.3 安全事件

#### 获取安全事件列表

- Method: `GET`
- Path: `/security/events`
- Query（可选）：
  - `type: string`
  - `from: string`（ISO 时间）
  - `to: string`（ISO 时间）
- Response: `SecurityEventRecord[]`

#### 获取仪表盘异常流

- Method: `GET`
- Path: `/dashboard/anomalies`
- Query: 无
- Response: `DashboardAnomalyItem[]`

---

### 5.4 OTA 管控

#### 获取 OTA 任务列表

- Method: `GET`
- Path: `/ota/tasks`
- Query: 无
- Response: `OtaTask[]`

#### 获取 OTA 升级总览

- Method: `GET`
- Path: `/ota/overview`
- Query: 无
- Response: `OtaUpgradeOverview`

#### 获取 OTA 失败率趋势

- Method: `GET`
- Path: `/ota/failure-trend`
- Query: 无
- Response: `OtaFailureTrendPoint[]`

#### 创建 OTA 任务

- Method: `POST`
- Path: `/ota/tasks`
- Body:

```json
{
  "targetTag": "华东",
  "targetVersion": "v2.0.1",
  "toVersion": "v2.0.2",
  "windowStart": "2026-04-01T10:00:00+08:00",
  "windowEnd": "2026-04-01T12:00:00+08:00"
}
```

字段说明：

- `toVersion`、`windowStart`、`windowEnd` 为必填
- `targetTag`、`targetVersion` 为可选筛选条件

Response：`OtaTask`

#### 暂停 OTA 分发

- Method: `POST`
- Path: `/ota/pause-distribution`
- Body: 无
- Response: 建议 `204 No Content` 或 `{ "message": "ok" }`

#### 全局回滚 OTA 版本

- Method: `POST`
- Path: `/ota/rollback-version`
- Body: 无
- Response: 建议 `204 No Content` 或 `{ "message": "ok" }`

---

### 5.5 仿真与态势可视化

#### 获取无人机场景仿真数据

- Method: `GET`
- Path: `/simulation/drone-field`
- Response: `DroneFieldSimulation`

#### 获取 5G 链路质量时序

- Method: `GET`
- Path: `/simulation/link-quality`
- Response: `LinkQualitySeries`

#### 获取机队遥测雷达数据

- Method: `GET`
- Path: `/simulation/fleet-telemetry`
- Response: `FleetTelemetryRadar`

参考框架：https://github.com/pure-admin/vue-pure-admin
