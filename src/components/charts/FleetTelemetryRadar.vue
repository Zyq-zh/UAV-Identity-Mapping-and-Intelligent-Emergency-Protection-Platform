<script setup lang="ts">
import type { EChartsOption } from "echarts";
import { computed } from "vue";
import BaseEchart from "./BaseEchart.vue";
import type { FleetTelemetryRadar } from "@/types";

const props = defineProps<{
  data: FleetTelemetryRadar | null;
}>();

const option = computed<EChartsOption>(() => {
  const d = props.data;
  if (!d) {
    return { series: [] };
  }
  return {
    tooltip: {},
    radar: {
      indicator: d.dimensions,
      radius: "62%",
      center: ["50%", "54%"],
      splitNumber: 4,
      axisName: { color: "#94a3b8", fontSize: 11 },
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.2)" } },
      splitArea: {
        show: true,
        areaStyle: { color: ["rgba(56,189,248,0.05)", "rgba(15,23,42,0.4)"] },
      },
    },
    series: [
      {
        type: "radar",
        symbolSize: 5,
        lineStyle: { width: 2, color: "#38bdf8" },
        areaStyle: { color: "rgba(56,189,248,0.22)" },
        data: [{ value: d.values, name: "机队均值" }],
      },
    ],
  };
});
</script>

<template>
  <BaseEchart :option="option" />
</template>
