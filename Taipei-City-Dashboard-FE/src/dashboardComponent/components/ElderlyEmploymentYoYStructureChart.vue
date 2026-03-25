<!-- Developed by Taipei Urban Intelligence Center 2023-2024 -->
<script setup>
import { ref } from "vue";
import VueApexCharts from "vue3-apexcharts";

const props = defineProps([
	"chart_config",
	"activeChart",
	"series",
	"map_config",
	"map_filter",
	"map_filter_on",
]);

const emits = defineEmits([
	"filterByParam",
	"filterByLayer",
	"clearByParamFilter",
	"clearByLayerFilter",
	"fly",
]);

const chartOptions = ref({
	chart: {
		stacked: true,
		stackType: "100%",
		toolbar: {
			show: false,
		},
	},
	colors: props.chart_config?.color ? [...props.chart_config.color] : [],
	dataLabels: {
		enabled: false,
	},
	grid: {
		show: false,
	},
	legend: {
		show: props.series?.length > 1 ? true : false,
		position: "top",
		horizontalAlign: "left",
	},
	plotOptions: {
		bar: {
			borderRadius: 5,
			horizontal: false,
			dataLabels: {
				hideOverflowingLabels: true,
			},
		},
	},
	stroke: {
		colors: ["#282a2c"],
		show: true,
		width: 2,
	},
	tooltip: {
		custom: function ({ series, seriesIndex, dataPointIndex, w }) {
			return (
				'<div class="chart-tooltip">' +
				"<h6>" +
				w.globals.labels[dataPointIndex] +
				(w.globals.seriesNames[seriesIndex]
					? ` - ${w.globals.seriesNames[seriesIndex]}`
					: "") +
				"</h6>" +
				"<span>" +
				series[seriesIndex][dataPointIndex] +
				` ${props.chart_config?.unit ?? ""}` +
				"</span>" +
				"</div>"
			);
		},
		followCursor: true,
	},
	xaxis: {
		axisBorder: {
			show: false,
		},
		axisTicks: {
			show: false,
		},
		labels: {
			show: false,
		},
		categories: props.chart_config?.categories ? props.chart_config.categories : [],
		type: "category",
	},
	yaxis: {
		min: 0,
	},
});

const selectedIndex = ref(null);

function handleDataSelection(_e, _chartContext, config) {
	if (!props.map_filter || !props.map_filter_on) return;

	if (
		`${config.dataPointIndex}-${config.seriesIndex}` !== selectedIndex.value
	) {
		if (props.map_filter.mode === "byParam") {
			emits(
				"filterByParam",
				props.map_filter,
				props.map_config,
				config.w.globals.labels[config.dataPointIndex],
				config.w.globals.seriesNames[config.seriesIndex]
			);
		} else if (props.map_filter.mode === "byLayer") {
			emits(
				"filterByLayer",
				props.map_config,
				config.w.globals.labels[config.dataPointIndex]
			);
		}
		selectedIndex.value = `${config.dataPointIndex}-${config.seriesIndex}`;
	} else {
		if (props.map_filter.mode === "byParam") {
			emits("clearByParamFilter", props.map_config);
		} else if (props.map_filter.mode === "byLayer") {
			emits("clearByLayerFilter", props.map_config);
		}
		selectedIndex.value = null;
	}
}
</script>

<template>
  <div
    v-if="activeChart === 'ElderlyEmploymentYoYStructureChart'"
    class="yoy-structure-chart"
  >
    <VueApexCharts
      type="bar"
      width="100%"
      height="280px"
      :options="chartOptions"
      :series="series"
      @data-point-selection="handleDataSelection"
    />
  </div>
</template>

<style scoped lang="scss">
.yoy-structure-chart {
	overflow: auto;
	width: 100%;
	height: 100%;

	.vue-apexcharts {
		justify-content: unset !important;
	}
}
</style>

