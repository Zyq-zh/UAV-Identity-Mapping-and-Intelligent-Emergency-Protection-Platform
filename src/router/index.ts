import { createRouter, createWebHistory } from "vue-router";
import MainLayout from "@/layouts/MainLayout.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: MainLayout,
      redirect: "/dashboard",
      children: [
        {
          path: "dashboard",
          name: "dashboard",
          meta: { title: "仪表盘", menu: "dashboard" },
          component: () => import("@/views/DashboardView.vue"),
        },
        {
          path: "devices",
          name: "devices",
          meta: { title: "设备管理", menu: "devices" },
          component: () => import("@/views/DeviceManagementView.vue"),
        },
        {
          path: "ota",
          name: "ota",
          meta: { title: "OTA 升级监控", menu: "ota" },
          component: () => import("@/views/OtaMonitorView.vue"),
        },
        {
          path: "security",
          name: "security",
          meta: { title: "安全事件", menu: "security" },
          component: () => import("@/views/SecurityEventsView.vue"),
        },
        {
          path: "logs",
          name: "logs",
          meta: { title: "日志审计", menu: "logs" },
          component: () => import("@/views/LogsAuditView.vue"),
        },
        {
          path: "settings",
          name: "settings",
          meta: { title: "系统设置", menu: "settings" },
          component: () => import("@/views/SettingsView.vue"),
        },
      ],
    },
  ],
});

export default router;
