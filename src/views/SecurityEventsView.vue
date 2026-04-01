<script setup lang="ts">
import { ElMessage } from "element-plus";
import { computed, onMounted, reactive, ref } from "vue";
import AttackGraphChart from "@/components/charts/AttackGraphChart.vue";
import { useEventStore } from "@/stores/event";
import type { SecurityEventRecord, SecurityEventType } from "@/types";
import {
  dispositionLabel,
  eventTypeLabel,
} from "@/utils/labels";

const eventStore = useEventStore();

const filters = reactive({
  type: "" as "" | SecurityEventType,
  range: [] as string[],
});

const detailVisible = ref(false);
const current = ref<SecurityEventRecord | null>(null);

const filtered = computed(() => {
  let list = eventStore.securityEvents;
  if (filters.type) {
    list = list.filter((e) => e.type === filters.type);
  }
  if (filters.range?.length === 2) {
    const [a, b] = filters.range;
    const ta = Number(a);
    const tb = Number(b);
    list = list.filter((e) => {
      const t = new Date(e.at).getTime();
      return t >= ta && t <= tb;
    });
  }
  return list;
});

function openRow(row: SecurityEventRecord) {
  current.value = row;
  detailVisible.value = true;
}

function exportCsv() {
  const header = [
    "时间",
    "设备ID",
    "事件类型",
    "处置动作",
    "事件ID",
  ];
  const rows = filtered.value.map((e) => [
    e.at,
    e.deviceId,
    eventTypeLabel(e.type),
    dispositionLabel(e.action),
    e.id,
  ]);
  const csv = [header, ...rows]
    .map((line) =>
      line.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
  const blob = new Blob(["\ufeff" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `security-events-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  ElMessage.success("已导出 CSV");
}

function onTypeFilterChange(v: string) {
  eventStore.loadSecurityEvents({
    type: v ? (v as SecurityEventType) : undefined,
  });
}

onMounted(() => {
  eventStore.loadSecurityEvents();
});
</script>

<template>
  <div class="page">
    <div class="page-head">
      <h2>安全事件</h2>
      <p class="muted">伪造身份 / 降级 / 重放 / 签名异常 · 可导出审计</p>
    </div>

    <el-card class="toolbar" shadow="never">
      <el-form :inline="true">
        <el-form-item label="事件类型">
          <el-select
            v-model="filters.type"
            clearable
            placeholder="全部"
            style="width: 180px"
            @change="onTypeFilterChange"
          >
            <el-option label="伪造身份" value="identity_spoof" />
            <el-option label="降级攻击" value="downgrade" />
            <el-option label="重放攻击" value="replay" />
            <el-option label="签名异常" value="signature_invalid" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filters.range"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
            value-format="x"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="eventStore.loadSecurityEvents()"
            >查询</el-button
          >
          <el-button @click="exportCsv">导出 CSV</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table
        v-loading="eventStore.loading"
        :data="filtered"
        stripe
        style="width: 100%"
        @row-click="openRow"
      >
        <el-table-column prop="at" label="时间" min-width="180">
          <template #default="{ row }">
            {{ new Date(row.at).toLocaleString("zh-CN") }}
          </template>
        </el-table-column>
        <el-table-column prop="deviceId" label="设备 ID" width="140" />
        <el-table-column prop="type" label="事件类型" width="120">
          <template #default="{ row }">
            {{ eventTypeLabel(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="action" label="处置动作" width="100">
          <template #default="{ row }">
            {{ dispositionLabel(row.action) }}
          </template>
        </el-table-column>
        <el-table-column prop="id" label="事件 ID" min-width="160" />
      </el-table>
    </el-card>

    <el-dialog
      v-model="detailVisible"
      title="事件详情"
      width="720px"
      destroy-on-close
    >
      <template v-if="current">
        <el-tabs>
          <el-tab-pane label="攻击路径分析">
            <p class="desc">{{ current.attackPath.join(" → ") }}</p>
            <div class="mini-chart">
              <AttackGraphChart />
            </div>
          </el-tab-pane>
          <el-tab-pane label="审计日志 (JSON)">
            <pre class="json-block">{{
              JSON.stringify(current.auditJson, null, 2)
            }}</pre>
          </el-tab-pane>
        </el-tabs>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.page-head h2 {
  margin: 0 0 4px;
  color: #e2e8f0;
}
.muted {
  margin: 0 0 16px;
  color: #94a3b8;
  font-size: 13px;
}
.toolbar {
  margin-bottom: 16px;
  background: #111827;
  border: 1px solid rgba(148, 163, 184, 0.12);
}
.el-card {
  background: #111827;
  border: 1px solid rgba(148, 163, 184, 0.12);
  color: #e2e8f0;
}
.desc {
  color: #cbd5e1;
  line-height: 1.6;
}
.mini-chart {
  height: 260px;
  margin-top: 12px;
}
.json-block {
  background: #0f172a;
  padding: 12px;
  border-radius: 8px;
  overflow: auto;
  max-height: 360px;
  font-size: 12px;
  color: #a5f3fc;
}
</style>
