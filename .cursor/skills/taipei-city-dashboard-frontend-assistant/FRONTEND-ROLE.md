# 你的角色（必做）

你必須先確認需求落在以下哪個層級，再決定改哪些檔案：

1. **Routing/Pages**：`src/router/index.js`（守衛與導向）＋ `src/views/DashboardView.vue`、`src/views/MapView.vue`、`src/views/ComponentView.vue`、`src/views/ComponentInfoView.vue`、`src/views/EmbedView.vue`
2. **Layout/Global UI**：`src/App.vue`（依 `authStore.currentPath` 決定顯示 `SideBar/SettingsBar/AdminSideBar/ComponentSideBar`、定時更新區塊、`NotificationBar/InitialWarning/LogIn/ChatBox`）＋ `src/components/utilities/bars/NavBar.vue`、`SideBar.vue`、`SettingsBar.vue`
3. **Dialogs（彈窗/通知）**：`src/store/dialogStore.js`（`dialogs` key）＋ `src/components/dialogs/DialogContainer.vue`（以 `dialog` prop 控制顯示）＋ `src/components/dialogs/*.vue`（實際掛載點可能在 `App.vue`、`DashboardView/MapView`、`MapContainer`、`SettingsBar`）
4. **Dashboard UI（圖表組件渲染器）**：
   - `src/dashboardComponent/DashboardComponent.vue`（分派 render 與 UI 控制：選圖/切換 chart type/發出 toggle/filter/info 事件）
   - 圖表元件：`src/dashboardComponent/components/*.vue`（例如 `BarChart.vue` 等）
   - chart type 顯示名稱：`src/dashboardComponent/utilities/chartTypes.ts`
5. **Map UI（互動與圖層開關入口）**：
   - 主控頁：`src/views/MapView.vue`（切換 DashboardComponent 的 toggle/filter/fly 事件 → 呼叫 `mapStore`）
   - 地圖容器：`src/components/map/MapContainer.vue`（Mapbox 容器、`區/里` 按鈕、near 找點/手機 layers/管理員災害等 dialogs）
   - 狀態/行為：`src/store/mapStore.js`（initializeMapBox/addToMapLayerList/filter/toggle/clear/popup/viewpoints/3D MRT）
   - 圖層定義與底圖：`src/assets/configs/mapbox/mapConfig.js`、`mapStyle.js`
6. **狀態/資料流**：
   - `src/store/contentStore.js`（dashboard/component 內容、`chart_data`、`history_data`、`setRouteParams`、`setDashboards`）
   - `src/store/authStore.js`（token/user/device/currentPath）
   - `src/store/dialogStore.js`
   - API 統一：`src/router/axios.js`（axios instance + interceptor：token + notification + error code）
7. **樣式系統**：`src/assets/styles/globalStyles.css`、`src/assets/styles/chartStyles.css`、`src/assets/styles/toggleswitch.css`＋元件內 `scoped lang="scss"`

