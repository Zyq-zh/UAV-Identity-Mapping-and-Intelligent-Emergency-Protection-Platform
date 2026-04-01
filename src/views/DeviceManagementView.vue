<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus";
import { onMounted, reactive, ref } from "vue";
import { useDeviceStore } from "@/stores/device";
import type { DeviceDetail, DeviceRecord } from "@/types";

const deviceStore = useDeviceStore();

const filters = reactive({
  id: "",
  version: "",
  status: "" as "" | DeviceRecord["status"],
});

const drawerVisible = ref(false);
const detail = ref<DeviceDetail | null>(null);
const detailLoading = ref(false);

async function load() {
  await deviceStore.loadList({
    id: filters.id || undefined,
    version: filters.version || undefined,
    status: filters.status || undefined,
  });
}

async function openDetail(row: DeviceRecord) {
  drawerVisible.value = true;
  detailLoading.value = true;
  try {
    detail.value = await deviceStore.loadDetail(row.id);
  } finally {
    detailLoading.value = false;
  }
}

async function handleBan() {
  if (!detail.value) return;
  await ElMessageBox.confirm(
    `确定封禁设备 ${detail.value.id} ？`,
    "封禁设备",
    { type: "warning" }
  );
  await deviceStore.ban(detail.value.id);
  ElMessage.success("已提交封禁");
  drawerVisible.value = false;
}

async function handleRollback() {
  if (!detail.value) return;
  await ElMessageBox.confirm(
    `确定对 ${detail.value.id} 执行固件回滚？`,
    "回滚固件",
    { type: "warning" }
  );
  await deviceStore.rollback(detail.value.id);
  ElMessage.success("已提交回滚任务");
  drawerVisible.value = false;
}

function statusTag(t: DeviceRecord["status"]) {
  if (t === "online") return "success";
  if (t === "offline") return "info";
  return "warning";
}

onMounted(() => {
  load();
});
</script>

<template>
  <div class="page">
    <div class="page-head">
      <h2>设备管理</h2>
      <p class="muted">5G 身份标识、固件版本与在线状态 · 支持处置操作</p>
    </div>

    <el-card class="toolbar" shadow="never">
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="设备 ID">
          <el-input
            v-model="filters.id"
            placeholder="模糊匹配"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="固件版本">
          <el-input
            v-model="filters.version"
            placeholder="如 v2.0"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="filters.status"
            placeholder="全部"
            clearable
            style="width: 140px"
          >
            <el-option label="在线" value="online" />
            <el-option label="离线" value="offline" />
            <el-option label="降级/异常" value="degraded" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="deviceStore.loading" @click="load"
            >查询</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table
        v-loading="deviceStore.loading"
        :data="deviceStore.list"
        stripe
        style="width: 100%"
        @row-click="openDetail"
      >
        <el-table-column prop="id" label="设备 ID" min-width="120" />
        <el-table-column
          prop="identity5g"
          label="5G 身份标识"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column prop="firmwareVersion" label="固件版本" width="120" />
        <el-table-column prop="status" label="在线状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">{{
              row.status === "online"
                ? "在线"
                : row.status === "offline"
                  ? "离线"
                  : "异常"
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastActiveAt" label="最后活跃" min-width="180">
          <template #default="{ row }">
            {{ new Date(row.lastActiveAt).toLocaleString("zh-CN") }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click.stop="openDetail(row)"
              >详情</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-drawer
      v-model="drawerVisible"
      :title="detail ? `设备详情 · ${detail.id}` : '设备详情'"
      size="480px"
      destroy-on-close
    >
      <el-skeleton v-if="detailLoading" :rows="6" animated />
      <template v-else-if="detail">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="5G 身份">{{
            detail.identity5g
          }}</el-descriptions-item>
          <el-descriptions-item label="固件版本">{{
            detail.firmwareVersion
          }}</el-descriptions-item>
          <el-descriptions-item label="会话 Token (JTI)">{{
            detail.sessionToken.jti
          }}</el-descriptions-item>
          <el-descriptions-item label="Token 状态">
            <el-tag
              :type="detail.sessionToken.revoked ? 'danger' : 'success'"
              size="small"
              >{{ detail.sessionToken.revoked ? "已吊销" : "有效" }}</el-tag
            >
            过期：{{
              new Date(detail.sessionToken.expiresAt).toLocaleString("zh-CN")
            }}
          </el-descriptions-item>
        </el-descriptions>

        <h4 class="sec-title">升级历史</h4>
        <el-timeline>
          <el-timeline-item
            v-for="h in detail.upgradeHistory"
            :key="h.id"
            :timestamp="new Date(h.at).toLocaleString('zh-CN')"
          >
            {{ h.fromVersion }} → {{ h.toVersion }} ·
            <el-tag size="small" type="info">{{ h.result }}</el-tag>
          </el-timeline-item>
        </el-timeline>

        <h4 class="sec-title">异常行为</h4>
        <el-table :data="detail.anomalies" size="small" border>
          <el-table-column prop="at" label="时间" width="160">
            <template #default="{ row }">
              {{ new Date(row.at).toLocaleString("zh-CN") }}
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="120" />
          <el-table-column prop="detail" label="说明" />
        </el-table>

        <div class="actions">
          <el-button type="danger" @click="handleBan">封禁设备</el-button>
          <el-button type="warning" @click="handleRollback"
            >回滚固件</el-button
          >
        </div>
      </template>
    </el-drawer>
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
.sec-title {
  margin: 20px 0 12px;
  color: #e2e8f0;
}
.actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}
</style>
