<script setup lang="ts">
import type { EChartsOption } from "echarts";
import { computed } from "vue";
import BaseEchart from "./BaseEchart.vue";

const props = withDefaults(
  defineProps<{
    override?: EChartsOption;
  }>(),
  { override: undefined }
);

const option = computed<EChartsOption>(() => {
  const base: EChartsOption = {
    tooltip: {},
    series: [
      {
        type: "graph",
        layout: "force",
        roam: true,
        draggable: true,
        force: { repulsion: 420, edgeLength: [90, 150] },
        label: { show: true, fontSize: 11, color: "#e2e8f0" },
        lineStyle: { color: "source", curveness: 0.15 },
        categories: [
          { name: "实体" },
          { name: "资产" },
          { name: "威胁" },
        ],
        data: [
          { id: "a1", name: "攻击者", category: 2, symbolSize: 46 },
          { id: "d1", name: "无人机 UAV-10088", category: 1, symbolSize: 52 },
          { id: "s1", name: "OTA 服务器", category: 1, symbolSize: 48 },
          { id: "f1", name: "固件包 v1.0", category: 1, symbolSize: 40 },
        ],
        links: [
          {
            source: "a1",
            target: "d1",
            label: { show: true, formatter: "伪造身份", color: "#94a3b8" },
          },
          {
            source: "d1",
            target: "s1",
            label: { show: true, formatter: "OTA 请求", color: "#94a3b8" },
          },
          {
            source: "s1",
            target: "f1",
            label: { show: true, formatter: "注入固件", color: "#94a3b8" },
          },
        ],
        edgeSymbol: ["none", "arrow"],
      },
    ],
  };
  if (props.override) {
    return { ...base, ...props.override } as EChartsOption;
  }
  return base;
});
</script>

<template>
  <BaseEchart :option="option" />
</template>
