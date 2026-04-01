<script setup lang="ts">
const lines = [
  "[2026-03-19 14:00:01] AUDIT user=u-admin-01 action=LOGIN result=OK",
  "[2026-03-19 14:02:10] AUDIT policy=OTA-BLOCK-01 device=UAV-10088",
  "[2026-03-19 14:05:44] AUDIT export=security_events format=CSV",
];
</script>

<template>
  <div class="page">
    <h2>日志审计</h2>
    <p class="muted">对接后端后可检索操作日志与合规审计流（当前为占位）。</p>
    <el-card shadow="never">
      <pre class="log">{{ lines.join("\n") }}</pre>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
h2 {
  margin: 0 0 8px;
  color: #e2e8f0;
}
.muted {
  color: #94a3b8;
  margin-bottom: 16px;
}
.el-card {
  background: #111827;
  border: 1px solid rgba(148, 163, 184, 0.12);
}
.log {
  margin: 0;
  color: #cbd5e1;
  font-size: 13px;
  line-height: 1.7;
}
</style>
