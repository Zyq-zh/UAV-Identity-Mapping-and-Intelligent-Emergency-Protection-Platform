<script setup lang="ts">
import type { EChartsOption } from "echarts";
import { computed } from "vue";
import BaseEchart from "./BaseEchart.vue";

const props = defineProps<{
  data: { name: string; value: number }[];
}>();

const option = computed<EChartsOption>(() => ({
  tooltip: { trigger: "item" },
  legend: { bottom: 0, textStyle: { color: "#94a3b8" } },
  series: [
    {
      type: "pie",
      radius: ["42%", "68%"],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: "#0f172a", borderWidth: 2 },
      label: { color: "#e2e8f0" },
      data: props.data.map((d) => ({ name: d.name, value: d.value })),
    },
  ],
}));
</script>

<template>
  <BaseEchart :option="option" />
</template>
