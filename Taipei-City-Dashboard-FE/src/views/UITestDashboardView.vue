<!-- Developed by Taipei Urban Intelligence Center 2023-2024 -->
<script setup>
import ElderlyEmploymentYoYStructureChart from "../dashboardComponent/components/ElderlyEmploymentYoYStructureChart.vue";

const title = "測試用儀表板";

const activeChart = "ElderlyEmploymentYoYStructureChart";

// Test data (standalone) for UI component preview
const chart_config = {
	categories: ["2019", "2020", "2021", "2022", "2023"],
	color: ["#2E86AB", "#F6AE2D", "#C3423F", "#4B9E5A"],
	unit: "%",
	types: [activeChart],
};

const series = [
	{ name: "55-59", data: [18, 19, 17, 16, 15] },
	{ name: "60-64", data: [34, 32, 33, 31, 30] },
	{ name: "65-69", data: [28, 29, 30, 31, 33] },
	{ name: "70+", data: [20, 20, 20, 22, 22] },
];
</script>

<template>
  <div class="uitest">
    <h2>{{ title }}</h2>
    <p>
      此頁面用於測試新增的前端 COMPONENT。先用純 UI/文案佔位，之後再把待測 COMPONENT 接到這裡。
    </p>
    <div class="uitest-card">
      <ElderlyEmploymentYoYStructureChart
        :chart_config="chart_config"
        :activeChart="activeChart"
        :series="series"
        :map_config="null"
        :map_filter="null"
        :map_filter_on="false"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.uitest {
  width: 100%;
  height: 100%;
  padding: 16px 20px;
  overflow-y: auto;

  h2 {
    font-size: var(--font-m);
    font-weight: 500;
    margin: 0 0 8px;
  }

  p {
    color: var(--color-complement-text);
    line-height: 1.6;
    margin: 0 0 12px;
  }

  &-card {
    background-color: var(--color-component-background);
    border: solid 1px var(--color-border);
    border-radius: 8px;
    padding: 16px;
    max-width: 980px;
  }
}
</style>

