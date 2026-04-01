<script setup lang="ts">
import { reactive } from "vue";

const form = reactive({
  apiBase: import.meta.env.VITE_API_BASE ?? "/api",
  useMock: import.meta.env.VITE_USE_MOCK !== "false",
});
</script>

<template>
  <div class="page">
    <h2>系统设置</h2>
    <p class="muted">前端环境变量请在 <code>.env.development</code> 中配置。</p>
    <el-card shadow="never">
      <el-form label-width="160px">
        <el-form-item label="API Base">
          <el-input v-model="form.apiBase" disabled />
        </el-form-item>
        <el-form-item label="开发阶段 Mock">
          <el-switch v-model="form.useMock" disabled />
        </el-form-item>
      </el-form>
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
code {
  color: #38bdf8;
}
.el-card {
  background: #111827;
  border: 1px solid rgba(148, 163, 184, 0.12);
  color: #e2e8f0;
}
</style>
