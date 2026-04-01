<script setup lang="ts">
import type { EChartsOption } from "echarts";
import { computed } from "vue";
import BaseEchart from "./BaseEchart.vue";
import type { LinkQualitySeries } from "@/types";

const props = defineProps<{
  data: LinkQualitySeries | null;
}>();

const option = computed<EChartsOption>(() => {
  const d = props.data;
  if (!d) {
    return { series: [] };
  }
  return {
    tooltip: { trigger: "axis" },
    legend: {
      data: ["RSRP (dBm)", "SINR (dB)", "吞吐 (Mbps)"],
      textStyle: { color: "#94a3b8" },
      top: 0,
    },
    grid: { left: "2%", right: "10%", bottom: "2%", top: 56, containLabel: true },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: d.labels,
      axisLabel: { color: "#94a3b8", fontSize: 10 },
    },
    yAxis: [
      {
        type: "value",
        name: "RSRP dBm",
        position: "left",
        axisLabel: { color: "#94a3b8" },
        splitLine: { lineStyle: { color: "rgba(148,163,184,0.12)" } },
      },
      {
        type: "value",
        name: "SINR dB",
        position: "right",
        axisLabel: { color: "#94a3b8" },
        splitLine: { show: false },
      },
      {
        type: "value",
        name: "Mbps",
        position: "right",
        offset: 48,
        axisLabel: { color: "#94a3b8" },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "RSRP (dBm)",
        type: "line",
        smooth: true,
        showSymbol: false,
        yAxisIndex: 0,
        lineStyle: { width: 2, color: "#38bdf8" },
        areaStyle: { color: "rgba(56,189,248,0.08)" },
        data: d.rsrpDbm,
      },
      {
        name: "SINR (dB)",
        type: "line",
        smooth: true,
        showSymbol: false,
        yAxisIndex: 1,
        lineStyle: { width: 2, color: "#a78bfa" },
        data: d.sinrDb,
      },
      {
        name: "吞吐 (Mbps)",
        type: "line",
        smooth: true,
        showSymbol: false,
        yAxisIndex: 2,
        lineStyle: { width: 2, color: "#4ade80" },
        data: d.throughputMbps,
      },
    ],
  };
});
</script>

<template>
  <BaseEchart :option="option" />
</template>
