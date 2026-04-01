<script setup lang="ts">
import {
  Cpu,
  Document,
  Monitor,
  Setting,
  Ship,
  TrendCharts,
  Warning,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const route = useRoute();
const user = useUserStore();

const now = ref(new Date());
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const timeStr = computed(() =>
  now.value.toLocaleString("zh-CN", { hour12: false })
);

const activeMenu = computed(() => (route.meta.menu as string) ?? "dashboard");

const menuItems = [
  { path: "/dashboard", title: "仪表盘", icon: TrendCharts, key: "dashboard" },
  { path: "/devices", title: "设备管理", icon: Monitor, key: "devices" },
  { path: "/ota", title: "OTA 升级监控", icon: Ship, key: "ota" },
  { path: "/security", title: "安全事件", icon: Warning, key: "security" },
  { path: "/logs", title: "日志审计", icon: Document, key: "logs" },
  { path: "/settings", title: "系统设置", icon: Setting, key: "settings" },
];

function go(path: string) {
  router.push(path);
}

function refreshTime() {
  now.value = new Date();
  ElMessage.success("时间已刷新");
}
</script>

<template>
  <el-container class="layout-root">
    <el-header class="topbar" height="56px">
      <div class="brand">
        <el-icon class="brand-icon" :size="22"><Cpu /></el-icon>
        <div>
          <div class="brand-title">无人机 OTA · 5G 身份映射与应急防护</div>
          <div class="brand-sub">管理控制台</div>
        </div>
      </div>
      <div class="top-right">
        <span class="clock">{{ timeStr }}</span>
        <el-button text type="primary" @click="refreshTime">刷新</el-button>
        <el-divider direction="vertical" />
        <span class="user">{{ user.displayName }}</span>
      </div>
    </el-header>

    <el-container>
      <el-aside width="220px" class="aside">
        <el-menu
          :key="route.path"
          :default-active="activeMenu"
          class="side-menu"
          background-color="#0f172a"
          text-color="#94a3b8"
          active-text-color="#38bdf8"
          @select="(k: string) => {
            const m = menuItems.find((i) => i.key === k);
            if (m) go(m.path);
          }"
        >
          <el-menu-item
            v-for="item in menuItems"
            :key="item.key"
            :index="item.key"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped lang="scss">
.layout-root {
  min-height: 100vh;
  background: #0b1220;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: linear-gradient(90deg, #0f172a, #111827);
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  color: #e2e8f0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  color: #38bdf8;
}

.brand-title {
  font-weight: 600;
  font-size: 15px;
  line-height: 1.2;
}

.brand-sub {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

.top-right {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #cbd5e1;
}

.clock {
  font-variant-numeric: tabular-nums;
}

.user {
  color: #e2e8f0;
}

.aside {
  background: #0f172a;
  border-right: 1px solid rgba(148, 163, 184, 0.1);
}

.side-menu {
  border-right: none;
  height: 100%;
}

.main {
  padding: 20px;
  background: #0b1220;
  min-height: calc(100vh - 56px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
