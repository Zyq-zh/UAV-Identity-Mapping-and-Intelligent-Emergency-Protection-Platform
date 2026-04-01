<script setup lang="ts">
import * as echarts from "echarts";
import "echarts-gl";
import type { EChartsOption } from "echarts";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { DroneFieldSimulation } from "@/types";

const props = defineProps<{
  simulation: DroneFieldSimulation | null;
}>();

const host = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

function terrainZ(x: number, y: number): number {
  return Math.sin(x / 30) * 18 + Math.cos(y / 28) * 15 + 42;
}

function resize() {
  chart?.resize();
}

const option = computed(() => {
  const sim = props.simulation;
  const path = sim?.flightPath ?? [];
  const home = sim?.home ?? [0, 0, 70];

  const opt = {
    backgroundColor: "transparent",
    tooltip: {},
    visualMap: {
      show: false,
      dimension: 2,
      min: 40,
      max: 120,
      inRange: { color: ["#1e3a5f", "#38bdf8", "#fbbf24"] },
    },
    grid3D: {
      boxWidth: 220,
      boxDepth: 220,
      environment: "#0b1220",
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.35)" } },
      axisPointer: { lineStyle: { color: "#38bdf8" } },
      light: {
        main: { intensity: 1.1, shadow: true },
        ambient: { intensity: 0.45 },
      },
      viewControl: {
        projection: "perspective",
        autoRotate: path.length > 0,
        autoRotateSpeed: 6,
        distance: 280,
        alpha: 35,
        beta: 28,
      },
    },
    xAxis3D: {
      type: "value",
      name: "东向 m",
      nameTextStyle: { color: "#94a3b8" },
    },
    yAxis3D: {
      type: "value",
      name: "北向 m",
      nameTextStyle: { color: "#94a3b8" },
    },
    zAxis3D: {
      type: "value",
      name: "高度 m",
      nameTextStyle: { color: "#94a3b8" },
    },
    series: [
      {
        type: "surface",
        name: "地形高程",
        wireframe: {
          show: true,
          lineStyle: { color: "rgba(56,189,248,0.22)", width: 1 },
        },
        itemStyle: { opacity: 0.92 },
        shading: "lambert",
        equation: {
          x: { min: -100, max: 100, step: 5 },
          y: { min: -100, max: 100, step: 5 },
          z: (x: number, y: number) => terrainZ(x, y),
        },
      },
      {
        type: "line3D",
        name: "规划航线",
        data: path,
        lineStyle: { width: 4, color: "#fbbf24" },
      },
      {
        type: "scatter3D",
        name: "起降点",
        data: [home],
        symbolSize: 14,
        itemStyle: { color: "#4ade80", borderWidth: 1, borderColor: "#fff" },
      },
    ],
  } as unknown as EChartsOption;
  return opt;
});

onMounted(() => {
  if (!host.value) return;
  chart = echarts.init(host.value);
  chart.setOption(option.value);
  window.addEventListener("resize", resize);
});

watch(
  () => props.simulation,
  () => {
    if (!chart) return;
    chart.setOption(option.value, true);
  },
  { deep: true }
);

onBeforeUnmount(() => {
  window.removeEventListener("resize", resize);
  chart?.dispose();
  chart = null;
});
</script>

<template>
  <div ref="host" class="drone-field-3d" />
</template>

<style scoped lang="scss">
.drone-field-3d {
  width: 100%;
  height: 100%;
  min-height: 360px;
}
</style>
