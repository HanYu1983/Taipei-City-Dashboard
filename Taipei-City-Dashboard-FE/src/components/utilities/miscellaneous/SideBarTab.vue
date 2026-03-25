<!-- Developed by Taipei Urban Intelligence Center 2023-2024-->

<!-- This component has two modes "expanded" and "collapsed" which is controlled by the prop "expanded" -->

<script setup>
/* global gtag */
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "../../../store/authStore";

const route = useRoute();

const props = defineProps({
	icon: { type: String },
	title: { type: String },
	index: { type: String },
	city: { type: String },
	expanded: { type: Boolean },
});

const authStore = useAuthStore();

const tabLink = computed(() => {
	const isAdminPath = authStore.currentPath === "admin";
	const cityQuery = props.city ? `&city=${props.city}` : "";
	const adminCityQuery = props.city ? `?city=${props.city}` : "";

	// For non-admin mode, sidebar should always point to a valid dashboard route.
	// If we are currently on `/ui-test`, `route.path` would be `/ui-test` and would generate
	// wrong urls like `/ui-test?index=...`. So we base the target path on currentPath.
	const targetPath =
		!isAdminPath && authStore.currentPath === "mapview"
			? "/mapview"
			: "/dashboard";

	return isAdminPath
		? `/admin/${props.index}${adminCityQuery}`
		: `${targetPath}?index=${props.index}${cityQuery}`;
});

const linkActiveOrNot = computed(() => {
	const isAdminPath = authStore.currentPath === "admin";
	const isPathMatch = isAdminPath
		? route.path === `/admin/${props.index}`
		: route.query.index === props.index;
	const isCityMatch = props.city
		? route.query.city === props.city
		: true;

	return isPathMatch && isCityMatch;
});

// 點擊側欄儀表板主題時觸發GA自訂事件
const popularThemeGA = (title) => {
	if (props.city && title) {
		gtag('event','popular_theme', {
			dashboard_city:props.city,
			theme_name:title,
			city_theme:`${props.city}-${title}`
  		})
	}
};

</script>

<template>
  <router-link
    :to="tabLink"
    :class="{ sidebartab: true, 'sidebartab-active': linkActiveOrNot }"
    @click="popularThemeGA(title)"
  >
    <span :title="!expanded ? title : ''">{{ icon }}</span>
    <h3 v-if="expanded">
      {{ title }}
    </h3>
  </router-link>
</template>

<style scoped lang="scss">
.sidebartab {
	max-height: var(--font-xl);
	display: flex;
	align-items: center;
	margin: var(--font-s) 0;
	border-left: solid 4px transparent;
	border-radius: 0 5px 5px 0;
	transition: background-color 0.2s;
	white-space: nowrap;
	text-wrap: nowrap;

	&:hover {
		background-color: var(--color-component-background);
	}

	span {
		min-width: var(--font-l);
		margin-left: var(--font-s);
		font-family: var(--font-icon);
		font-size: calc(var(--font-m) * var(--font-to-icon));
	}

	h3 {
		margin-left: var(--font-s);
		font-size: var(--font-m);
		font-weight: 400;
	}

	&-active {
		border-left-color: var(--color-highlight);
		background-color: var(--color-component-background);

		span,
		h3 {
			color: var(--color-highlight);
		}
	}
}
</style>
