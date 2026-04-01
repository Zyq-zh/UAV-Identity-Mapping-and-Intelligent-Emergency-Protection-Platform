<script setup lang="ts">
import type { EChartsOption } from "echarts";
import { computed } from "vue";
import BaseEchart from "./BaseEchart.vue";

const props = defineProps<{
  points: { date: string; failRate: number }[];
}>();

const option = computed<EChartsOption>(() => ({
  tooltip: { trigger: "axis" },
  grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: props.points.map((p) => p.date),
    axisLabel: { color: "#94a3b8" },
  },
  yAxis: {
    type: "value",
    name: "失败率 %",
    axisLabel: { color: "#94a3b8" },
    splitLine: { lineStyle: { color: "rgba(148,163,184,0.15)" } },
  },
  series: [
    {
      type: "line",
      smooth: true,
      areaStyle: { color: "rgba(56,189,248,0.12)" },
      lineStyle: { color: "#38bdf8" },
      data: props.points.map((p) => Number(p.failRate.toFixed(2))),
    },
  ],
}));
</script>

<template>
  <BaseEchart :option="option" />
</template>
