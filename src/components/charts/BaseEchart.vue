<script setup lang="ts">
import * as echarts from "echarts";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    option: echarts.EChartsOption;
    theme?: string;
  }>(),
  { theme: undefined }
);

const emit = defineEmits<{
  (e: "chart-ready", chart: echarts.ECharts): void;
}>();

const host = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

function resize() {
  chart?.resize();
}

onMounted(() => {
  if (!host.value) return;
  chart = echarts.init(host.value, props.theme);
  chart.setOption(props.option);
  emit("chart-ready", chart);
  window.addEventListener("resize", resize);
});

watch(
  () => props.option,
  (opt) => {
    if (!chart) return;
    chart.setOption(opt, true);
  },
  { deep: true }
);

onBeforeUnmount(() => {
  window.removeEventListener("resize", resize);
  chart?.dispose();
  chart = null;
});

defineExpose({
  getInstance: () => chart,
});
</script>

<template>
  <div ref="host" class="base-echart" />
</template>

<style scoped lang="scss">
.base-echart {
  width: 100%;
  height: 100%;
  min-height: 260px;
}
</style>
