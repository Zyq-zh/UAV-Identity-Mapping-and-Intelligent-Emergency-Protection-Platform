<script setup lang="ts">
import { ElMessage } from "element-plus";
import { onMounted, reactive, ref } from "vue";
import FailureTrendChart from "@/components/charts/FailureTrendChart.vue";
import { useOtaStore } from "@/stores/ota";
import type { OtaTask } from "@/types";

const otaStore = useOtaStore();

const createVisible = ref(false);
const form = reactive({
  targetTag: "",
  targetVersion: "",
  toVersion: "v2.0.2",
  windowStart: "",
  windowEnd: "",
});

function statusLabel(s: OtaTask["status"]) {
  const m = {
    running: "进行中",
    success: "成功",
    failed: "失败",
    paused: "已暂停",
  };
  return m[s] ?? s;
}

function statusType(s: OtaTask["status"]) {
  if (s === "success") return "success";
  if (s === "failed") return "danger";
  if (s === "paused") return "info";
  return "warning";
}

function toIso(v: string | number | ""): string {
  if (v === "" || v == null) return new Date().toISOString();
  const n = typeof v === "string" ? Number(v) : v;
  return new Date(n).toISOString();
}

async function submitCreate() {
  await otaStore.createTask({
    targetTag: form.targetTag || undefined,
    targetVersion: form.targetVersion || undefined,
    toVersion: form.toVersion,
    windowStart: toIso(form.windowStart),
    windowEnd: toIso(form.windowEnd),
  });
  ElMessage.success("已创建升级任务（模拟）");
  createVisible.value = false;
}

async function pause() {
  await otaStore.pauseDistribution();
  ElMessage.success("已请求暂停分发");
}

async function rollback() {
  await otaStore.rollbackVersion();
  ElMessage.success("已请求回滚版本");
}

onMounted(() => {
  otaStore.loadAll();
});
</script>

<template>
  <div class="page">
    <div class="page-head">
      <h2>OTA 升级监控</h2>
      <p class="muted">任务分发、失败率趋势与版本策略</p>
    </div>

    <el-card class="toolbar" shadow="never">
      <el-space wrap>
        <el-button type="primary" @click="createVisible = true"
          >创建升级任务</el-button
        >
        <el-button @click="pause">暂停分发</el-button>
        <el-button type="warning" @click="rollback">回滚版本</el-button>
        <el-button
          :loading="otaStore.loading"
          text
          type="primary"
          @click="otaStore.loadAll()"
          >刷新</el-button
        >
      </el-space>
    </el-card>

    <el-card shadow="never" class="mb">
      <template #header>当前升级任务</template>
      <el-table
        v-loading="otaStore.loading"
        :data="otaStore.tasks"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="任务 ID" min-width="180" />
        <el-table-column prop="targetCount" label="目标设备数" width="120" />
        <el-table-column prop="version" label="升级版本" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{
              statusLabel(row.status)
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="180">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString("zh-CN") }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never">
      <template #header>升级失败率趋势（按天）</template>
      <div class="chart-wrap">
        <FailureTrendChart :points="otaStore.failureTrend" />
      </div>
    </el-card>

    <el-dialog
      v-model="createVisible"
      title="创建 OTA 升级任务"
      width="520px"
      destroy-on-close
    >
      <el-form label-width="120px">
        <el-form-item label="设备标签">
          <el-input v-model="form.targetTag" placeholder="如：华东 / 巡检" />
        </el-form-item>
        <el-form-item label="当前版本筛选">
          <el-input v-model="form.targetVersion" placeholder="如：v1.9.x" />
        </el-form-item>
        <el-form-item label="目标版本" required>
          <el-input v-model="form.toVersion" />
        </el-form-item>
        <el-form-item label="时间窗口起">
          <el-date-picker
            v-model="form.windowStart"
            type="datetime"
            value-format="x"
            placeholder="选择时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="时间窗口止">
          <el-date-picker
            v-model="form.windowEnd"
            type="datetime"
            value-format="x"
            placeholder="选择时间"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreate">创建</el-button>
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
.mb {
  margin-bottom: 16px;
}
.chart-wrap {
  height: 320px;
}
</style>
