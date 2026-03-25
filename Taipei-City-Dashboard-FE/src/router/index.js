/* Developed by Taipei Urban Intelligence Center 2023-2024*/

// Lead Developer:  Igor Ho (Full Stack Engineer)
// Data Pipelines:  Iima Yu (Data Scientist)
// Design and UX: Roy Lin (Prev. Consultant), Chu Chen (Researcher)
// Systems: Ann Shih (Systems Engineer)
// Testing: Jack Huang (Data Scientist), Ian Huang (Data Analysis Intern)

/* Department of Information Technology, Taipei City Government */

import { createRouter, createWebHistory } from "vue-router";
import { useContentStore } from "../store/contentStore";
import { useMapStore } from "../store/mapStore";
import { useAuthStore } from "../store/authStore";
import { useAdminStore } from "../store/adminStore";
import DashboardView from "../views/DashboardView.vue";
import MapView from "../views/MapView.vue";
import ComponentView from "../views/ComponentView.vue";
import ComponentInfoView from "../views/ComponentInfoView.vue";
import EmbedView from "../views/EmbedView.vue";
import UITestDashboardView from "../views/UITestDashboardView.vue";

const routes = [
	{
		path: "/",
		redirect: "/dashboard",
	},
	{
		path: "/callback",
		name: "callback",
		component: () => import("../views/CallBack.vue"),
	},
	{
		path: "/dashboard",
		name: "dashboard",
		component: DashboardView,
	},
	{
		path: "/mapview",
		name: "mapview",
		component: MapView,
	},
	{
		path: "/ui-test",
		name: "ui-test",
		component: UITestDashboardView,
	},
	{
		path: "/component",
		name: "component",
		component: ComponentView,
	},
	{
		path: "/component/:index",
		name: "component-info",
		component: ComponentInfoView,
	},
	{
		path: "/embed/:id/:city",
		name: "embed",
		component: EmbedView,
	},
	{
		path: "/embed",
		redirect: "/embed/0",
	},
	{
		path: "/admin",
		redirect: "/admin/dashboard?city=taipei",
	},
	{
		path: "/admin/user",
		name: "admin-user",
		component: () => import("../views/admin/AdminUser.vue"),
	},
	{
		path: "/admin/contributor",
		name: "admin-contributor",
		component: () => import("../views/admin/AdminContributor.vue"),
	},
	{
		path: "/admin/dashboard",
		name: "admin-dashboard",
		component: () => import("../views/admin/AdminDashboard.vue"),
	},
	{
		path: "/admin/edit-component",
		name: "admin-edit-component",
		component: () => import("../views/admin/AdminEditComponent.vue"),
	},
	{
		path: "/admin/issue",
		name: "admin-issue",
		component: () => import("../views/admin/AdminIssue.vue"),
	},
	{
		path: "/admin/disaster",
		name: "admin-disaster",
		component: () => import("../views/admin/AdminDisaster.vue"),
	},
	{
		path: "/:pathMatch(.*)*",
		name: "notFoundRedirect",
		redirect: "/dashboard",
	},
];

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	base: import.meta.env.BASE_URL,
	routes,
});

// Sets route name to currentPath in authStore
router.beforeEach((to) => {
	const authStore = useAuthStore();

	if (to.name.includes("admin")) {
		authStore.setCurrentPath("admin");
		return;
	}
	authStore.setCurrentPath(to.name);
});

// Redirects blocked routes in mobile mode
router.beforeEach((to) => {
	const authStore = useAuthStore();
	if (authStore.isMobileDevice && authStore.isNarrowDevice) {
		if (
			![
				"dashboard",
				"component-info",
				"callback",
				"embed",
				"mapview",
				"ui-test",
			].includes(
				to.name
			)
		) {
			router.push("/dashboard");
		}
	} else if (authStore.token) {
		if (to.name === "callback") {
			router.push("/dashboard");
		}
	}
});

// Redirects unauthenticated routes
router.beforeEach((to) => {
	const authStore = useAuthStore();
	if (to.name.includes("admin")) {
		if (!authStore.user.is_admin || !authStore.token) {
			if (authStore.user.is_admin === false) {
				router.push("/dashboard");
			} else {
				setTimeout(() => {
					if (!authStore.user.is_admin) {
						router.push("/dashboard");
					}
				}, 200);
			}
		}
	} else if (to.name === "component") {
		if (!authStore.token) {
			router.push("/dashboard");
		}
	} else if (to.name === "component-info") {
		if (!authStore.token && !authStore.isNarrowDevice) {
			router.push("/dashboard");
		}
	}
});

// Handles content related tasks (gets content for each route)
router.beforeEach(async (to) => {
	const contentStore = useContentStore();
	const mapStore = useMapStore();
	// Pass in route info to contentStore if the path starts with /dashboard or /mapview
	if (
		to.path.toLowerCase() === "/dashboard" ||
		to.path.toLowerCase() === "/mapview"
	) {
		// Frontend-only "test dashboard" mode:
		// Use /dashboard?index=test&city=taipei without calling /dashboard/test APIs.
		if (
			to.path.toLowerCase() === "/dashboard" &&
			to.query.index === "test" &&
			to.query.city === "taipei"
		) {
			// Ensure sidebar still has dashboards/cities lists.
			// onlyDashboard=true means it will NOT fetch current dashboard components.
			try {
				await contentStore.setDashboards(true);
			} catch {
				// If dashboard list fails, we still want the frontend-only
				// test dashboard to render.
			}

			// Inject a standalone component list for the test dashboard.
			const TEST_INJECT_COMPONENT_ID = "test-elderly-employment-yoy-structure";
			const injectedComponent = {
				id: TEST_INJECT_COMPONENT_ID,
				index: TEST_INJECT_COMPONENT_ID,
				city: "taipei",
				name: "高齡就業人口年增結構",
				icon: "bug_report",
				source: "測試資料",
				time_from: "static",
				time_to: "static",
				short_desc: "高齡就業人口年增結構（測試）",
				chart_config: {
					types: ["ElderlyEmploymentYoYStructureChart"],
					color: ["#2E86AB", "#F6AE2D", "#C3423F", "#4B9E5A"],
					unit: "%",
					categories: ["2019", "2020", "2021", "2022", "2023"],
				},
				chart_data: [
					{ name: "55-59", data: [18, 19, 17, 16, 15] },
					{ name: "60-64", data: [34, 32, 33, 31, 30] },
					{ name: "65-69", data: [28, 29, 30, 31, 33] },
					{ name: "70+", data: [20, 20, 20, 22, 22] },
				],
				map_config: null,
				map_filter: null,
			};

			contentStore.currentDashboard = {
				mode: "/dashboard",
				index: "test",
				name: "測試用儀表板",
				components: [injectedComponent],
				icon: "bug_report",
				city: "taipei",
			};

			contentStore.currentDashboardExcluded = {
				components: [],
			};

			contentStore.cityDashboard = {
				components: [injectedComponent],
			};

			contentStore.loading = false;
			contentStore.error = false;

			mapStore.clearEntireMap();
			return;
		}

		contentStore.clearEditDashboard();
		contentStore.setRouteParams(to.path, to.query.index, to.query.city);
	} else if (
		to.path.toLowerCase() === "/component" ||
		to.name === "component-info"
	) {
		contentStore.setDashboards(true);
	} else {
		contentStore.clearCurrentDashboard();
	}
	// Get Component data if the path is component-info
	if (to.name === "component-info") {
		contentStore.getCurrentComponentData(to.params.index, to.query.city);
	}
	// Clear the entire mapStore if the path doesn't start with /mapview
	if (to.path.toLowerCase() !== "/mapview") {
		mapStore.clearEntireMap();
	}
	// Clear only map layers if the path starts with /mapview
	else if (to.path.toLowerCase() === "/mapview") {
		mapStore.clearOnlyLayers();
	}
});

// Handles admin related tasks (gets content for each route)
router.beforeEach((to) => {
	const adminStore = useAdminStore();
	if (
		to.path.toLowerCase() === "/admin/dashboard"
	) {
		adminStore.setRouteParams(to.query.city);
	}
});

export default router;
