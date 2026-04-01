<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import AttackGraphChart from "@/components/charts/AttackGraphChart.vue";
import DroneField3DChart from "@/components/charts/DroneField3DChart.vue";
import FleetTelemetryRadar from "@/components/charts/FleetTelemetryRadar.vue";
import LinkQualityChart from "@/components/charts/LinkQualityChart.vue";
import VersionPieChart from "@/components/charts/VersionPieChart.vue";
import { useEventStore } from "@/stores/event";
import { useMetricsStore } from "@/stores/metrics";
import { useOtaStore } from "@/stores/ota";
import { useSimulationStore } from "@/stores/simulation";
import type { DashboardAnomalyItem } from "@/types";
import {
  eventTypeLabel,
  timelineStatusLabel,
} from "@/utils/labels";

const metricsStore = useMetricsStore();
const eventStore = useEventStore();
const otaStore = useOtaStore();
const simulationStore = useSimulationStore();

const detailVisible = ref(false);
const current = ref<DashboardAnomalyItem | null>(null);

const kpis = computed(() => {
  const m = metricsStore.metrics;
  if (!m) return [];
  return [
    {
      title: "当前在线设备数",
      value: String(m.onlineDevices),
      unit: "台",
      hint: "实时",
      ok: true,
    },
    {
      title: "非法 OTA 请求阻断率",
      value: m.illegalOtaBlockRate.toFixed(1),
      unit: "%",
      hint: "目标 ≥ 98%",
      ok: m.illegalOtaBlockRate >= 98,
    },
    {
      title: "身份伪造识别率",
      value: m.identitySpoofDetectRate.toFixed(1),
      unit: "%",
      hint: "目标 ≥ 90%",
      ok: m.identitySpoofDetectRate >= 90,
    },
    {
      title: "平均响应时间",
      value: m.avgResponseSeconds.toFixed(1),
      unit: "秒",
      hint: "目标 ≤ 10 秒",
      ok: m.avgResponseSeconds <= 10,
    },
  ];
});

const TIMELINE_MAX = 14;
const TIMELINE_COLLAPSED = 3;

const timelineAll = computed(() =>
  eventStore.dashboardAnomalies.slice(0, TIMELINE_MAX)
);
const timelineExpanded = ref(false);

const timelineVisible = computed(() => {
  const all = timelineAll.value;
  if (timelineExpanded.value) return all;
  return all.slice(0, TIMELINE_COLLAPSED);
});

const timelineHasMore = computed(
  () => timelineAll.value.length > TIMELINE_COLLAPSED
);
const timelineRestCount = computed(() =>
  Math.max(0, timelineAll.value.length - TIMELINE_COLLAPSED)
);

function toggleTimeline() {
  timelineExpanded.value = !timelineExpanded.value;
}

const pieData = computed(() => {
  const o = otaStore.overview;
  if (!o) return [];
  return o.versionDistribution.map((v) => ({
    name: v.version,
    value: v.count,
  }));
});

function openDetail(row: DashboardAnomalyItem) {
  current.value = row;
  detailVisible.value = true;
}

onMounted(async () => {
  await Promise.all([
    metricsStore.load(),
    eventStore.loadDashboardAnomalies(),
    otaStore.loadOverview(),
    simulationStore.loadAll(),
  ]);
});
</script>

<template>
  <div class="page">
    <div class="page-head">
      <h2>仪表盘</h2>
      <p class="muted">
        无人机 OTA 场景 · 5G 接入身份映射与智能应急防护 · 态势总览
      </p>
    </div>

    <el-row :gutter="16" class="kpi-row">
      <el-col
        v-for="(k, i) in kpis"
        :key="i"
        :xs="24"
        :sm="12"
        :lg="6"
      >
        <el-card shadow="hover" class="kpi-card" :class="{ warn: !k.ok }">
          <div class="kpi-title">{{ k.title }}</div>
          <div class="kpi-value">
            {{ k.value }}<span class="unit">{{ k.unit }}</span>
          </div>
          <div class="kpi-hint">{{ k.hint }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="block">
      <el-col :xs="24" :lg="10">
        <el-card shadow="never" class="panel">
          <template #header>
            <span>异常事件时间线</span>
          </template>
          <div class="tl-body">
            <el-timeline>
              <el-timeline-item
                v-for="ev in timelineVisible"
                :key="ev.id"
                :timestamp="new Date(ev.at).toLocaleString('zh-CN')"
                placement="top"
              >
                <el-card shadow="hover" class="tl-card" @click="openDetail(ev)">
                  <div class="tl-line">
                    <el-tag size="small">{{ ev.deviceId }}</el-tag>
                    <el-tag type="warning" size="small">{{
                      eventTypeLabel(ev.type)
                    }}</el-tag>
                    <el-tag type="info" size="small">{{
                      timelineStatusLabel(ev.status)
                    }}</el-tag>
                  </div>
                  <div class="tl-sub">点击查看攻击路径分析</div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
            <div v-if="timelineHasMore" class="tl-toggle-wrap">
              <el-button
                class="tl-toggle-btn"
                text
                type="primary"
                @click="toggleTimeline"
              >
                <span class="tl-toggle-text">{{
                  timelineExpanded
                    ? "收起"
                    : `展开全部（还有 ${timelineRestCount} 条）`
                }}</span>
                <span class="tl-toggle-icon" :class="{ up: timelineExpanded }"
                  >▼</span
                >
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="14">
        <el-card shadow="never" class="panel graph-panel">
          <template #header>
            <span>攻击链路可视化（示意）</span>
          </template>
          <div class="chart-wrap">
            <AttackGraphChart />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="block">
      <el-col :span="24">
        <el-card shadow="never" class="panel sim-3d">
          <template #header>
            <div class="panel-head">
              <span>无人机实地航线与地形 · 3D 仿真</span>
              <span v-if="simulationStore.droneField" class="site-tag">{{
                simulationStore.droneField.siteName
              }}</span>
            </div>
          </template>
          <div v-loading="simulationStore.loading" class="chart-wrap sim-3d-inner">
            <DroneField3DChart :simulation="simulationStore.droneField" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="block">
      <el-col :xs="24" :lg="15">
        <el-card shadow="never" class="panel">
          <template #header>
            <span>5G 空口链路状态（机队聚合 · 24h）</span>
          </template>
          <div v-loading="simulationStore.loading" class="chart-wrap link-q">
            <LinkQualityChart :data="simulationStore.linkQuality" />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="9">
        <el-card shadow="never" class="panel">
          <template #header>
            <span>机队遥测健康雷达</span>
          </template>
          <div v-loading="simulationStore.loading" class="chart-wrap radar">
            <FleetTelemetryRadar :data="simulationStore.fleetRadar" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="8">
        <el-card shadow="never" class="panel">
          <template #header>
            <span>OTA 升级状态</span>
          </template>
          <div v-if="otaStore.overview" class="ota-summary">
            <div class="row">
              <span>正在升级设备</span>
              <strong>{{ otaStore.overview.upgradingCount }}</strong>
            </div>
            <div class="row">
              <span>最近任务成功率</span>
              <strong class="ok"
                >{{ otaStore.overview.lastTaskSuccessRate.toFixed(1) }}%</strong
              >
            </div>
            <div class="row">
              <span>最近任务失败率</span>
              <strong class="bad"
                >{{ otaStore.overview.lastTaskFailRate.toFixed(1) }}%</strong
              >
            </div>
          </div>
          <el-empty v-else description="加载中" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="16">
        <el-card shadow="never" class="panel">
          <template #header>
            <span>固件版本分布</span>
          </template>
          <div v-if="pieData.length" class="chart-wrap pie">
            <VersionPieChart :data="pieData" />
          </div>
          <el-empty v-else description="暂无数据" />
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      v-model="detailVisible"
      title="攻击路径分析"
      width="560px"
      destroy-on-close
    >
      <template v-if="current">
        <p>
          <strong>设备：</strong>{{ current.deviceId }} ·
          {{ eventTypeLabel(current.type) }}
        </p>
        <p><strong>处置状态：</strong>{{ timelineStatusLabel(current.status) }}</p>
        <p class="path-title">路径节点</p>
        <el-steps direction="vertical" :active="current.attackPath.length">
          <el-step
            v-for="(n, idx) in current.attackPath"
            :key="idx"
            :title="n"
          />
        </el-steps>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.page-head h2 {
  margin: 0 0 4px;
  color: #e2e8f0;
  font-size: 20px;
}
.muted {
  margin: 0 0 16px;
  color: #94a3b8;
  font-size: 13px;
}
.kpi-row {
  margin-bottom: 16px;
}
.kpi-card {
  background: #111827;
  border: 1px solid rgba(148, 163, 184, 0.12);
  color: #e2e8f0;
  margin-bottom: 16px;
}
.kpi-card.warn {
  border-color: rgba(251, 191, 36, 0.35);
}
.kpi-title {
  font-size: 13px;
  color: #94a3b8;
}
.kpi-value {
  font-size: 26px;
  font-weight: 700;
  margin: 8px 0;
}
.unit {
  font-size: 14px;
  margin-left: 4px;
  color: #94a3b8;
}
.kpi-hint {
  font-size: 12px;
  color: #64748b;
}
.block {
  margin-bottom: 16px;
}
.panel {
  background: #111827;
  border: 1px solid rgba(148, 163, 184, 0.12);
  color: #e2e8f0;
  margin-bottom: 16px;
}
.graph-panel .chart-wrap {
  height: 320px;
}
.chart-wrap.pie {
  height: 280px;
}
.tl-card {
  cursor: pointer;
  background: #0f172a;
  border-color: rgba(148, 163, 184, 0.15);
}
.tl-line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.tl-sub {
  margin-top: 8px;
  font-size: 12px;
  color: #64748b;
}
.tl-body {
  position: relative;
}
.tl-toggle-wrap {
  display: flex;
  justify-content: center;
  padding: 4px 0 0;
  margin-top: 4px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}
.tl-toggle-btn {
  padding: 8px 12px;
  font-size: 13px;
}
.tl-toggle-text {
  margin-right: 6px;
}
.tl-toggle-icon {
  display: inline-block;
  font-size: 10px;
  opacity: 0.85;
  transition: transform 0.2s ease;
}
.tl-toggle-icon.up {
  transform: rotate(180deg);
}
.ota-summary .row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  color: #cbd5e1;
  font-size: 14px;
}
.ota-summary .ok {
  color: #4ade80;
}
.ota-summary .bad {
  color: #f87171;
}
.path-title {
  margin: 12px 0 8px;
  font-weight: 600;
}
.panel-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
}
.site-tag {
  font-size: 12px;
  font-weight: 400;
  color: #64748b;
}
.sim-3d .chart-wrap {
  height: 400px;
}
.sim-3d-inner {
  min-height: 360px;
}
.chart-wrap.link-q {
  height: 320px;
}
.chart-wrap.radar {
  height: 300px;
}
</style>
