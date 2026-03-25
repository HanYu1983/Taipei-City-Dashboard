# Taipei City Dashboard 前端關鍵邏輯（架構參照）

目標：讓你在「改 UI / 改路由 / 新增 View / 新增互動 / 串 API」時，能用固定路線快速定位責任邊界與資料流。

閱讀策略：先看每章的「你要看哪些檔案」，再決定要不要往下鑽 Level 3/4 的細節。

---

## 1. 入口與全域初始化

1. `src/main.js`
- 負責：掛載 Vue、套用全域樣式（`globalStyles.css`、`chartStyles.css`、`toggleswitch.css`）、使用 `pinia`、安裝 `vue3-apexcharts`、註冊 `horizontalWheel` 指令
- 重點：`pinia.use(...)` 會把帶有 `options.debounce` 的 store actions 做 debounce 包裝

2. `src/App.vue`
- 負責：
  - 全域 Layout（決定是否顯示 SideBar/SettingsBar/AdminSideBar/ComponentSideBar）
  - 全域 dialog/通知/ChatBox/InitialWarning/LogIn 的掛載
  - 定時更新（chartTimer/crowdingTimer/timeTimer/mrtTimer）與對 map 的刷新邏輯
- 你要特別看：
  - `reloadChartData` / `reloadCrowdingChartData` / `reloadMapData` / `reload3DMRTMapData`
  - template 中依 `authStore.currentPath` 分支的 layout

你要看哪些檔案：
- `src/main.js`
- `src/App.vue`

---

## 2. UI LAYOUT 架構（誰決定 SideBar？）

Layout 分支是由 `authStore.currentPath` 決定的（關鍵由 router beforeEach 寫入）。

1. `mapview` / `dashboard`：顯示
- `SideBar`（`src/components/utilities/bars/SideBar.vue`）
- `SettingsBar`（`src/components/utilities/bars/SettingsBar.vue`）
- `RouterView`（畫面內容由 `DashboardView` / `MapView` 提供）

2. `admin`：顯示
- `AdminSideBar`（`src/components/utilities/bars/AdminSideBar.vue`）
- `RouterView`（例如 `src/views/admin/AdminDashboard.vue`）

3. `component`（`authStore.currentPath.includes('component')`）
- `ComponentSideBar`（`src/components/utilities/bars/ComponentSideBar.vue`）
- `RouterView`（例如 `ComponentView` / `ComponentInfoView`）

4. 其他（例如 `embed` 等）
- 不顯示上述 sidebars，直接 `router-view`

你要看哪些檔案：
- `src/App.vue`
- `src/router/index.js`（currentPath 怎麼被設定）
- `src/components/utilities/bars/SideBar.vue`
- `src/components/utilities/bars/SettingsBar.vue`
- `src/components/utilities/bars/ComponentSideBar.vue`
- `src/components/utilities/bars/AdminSideBar.vue`

---

## 3. UI ROUTING 方法（路由怎麼驅動資料流）

路由由 `src/router/index.js` 管理，並且有多段 `router.beforeEach`。

### 3.1 路由表
- `dashboard`：`src/views/DashboardView.vue`
- `mapview`：`src/views/MapView.vue`
- `component`：`src/views/ComponentView.vue`
- `component-info`：`src/views/ComponentInfoView.vue`
- `embed`：`src/views/EmbedView.vue`
- `admin/*`：admin views

### 3.2 beforeEach 的「4 種責任」
1. 設定 `authStore.currentPath`
- 規則：如果 `to.name.includes('admin')` → `currentPath = 'admin'`，否則 `currentPath = to.name`

2. 行動裝置 redirect（mobile + narrow）
- 限制在某些 `to.name` 允許情境，否則 redirect 到 `/dashboard`
- 這會影響你新增 View 時是否「看起來像被導回 dashboard」

3. 未登入 redirect
- admin / component / component-info 有 token 條件

4. content/map store 初始化（跟資料流直接相關）
- 到 `/dashboard` 或 `/mapview`
  - `contentStore.clearEditDashboard()`
  - `contentStore.setRouteParams(to.path, to.query.index, to.query.city)`
  - mapStore layer 處理：`mapview` 才會保留/更新層；切出 mapview 會 `mapStore.clearEntireMap()`

你要看哪些檔案：
- `src/router/index.js`
- `src/store/authStore.js`（`currentPath` 如何用）

---

## 4. 通用 UI 組成 SOP（元件怎麼重用、怎麼分工）

這個專案的「最核心通用元件」是：
- `src/dashboardComponent/DashboardComponent.vue`：同一套 UI/控制邏輯，同時支援 `dashboard` / `map` / `preview` / `halfmap` 等 mode。

### 4.1 DashboardComponent（分派中心 + emit 事件源）
1. 依 `props.mode` 決定：
- 是否顯示 map toggle
- 是否顯示 chart 控制（切 chart type）
- footer 行為（info 按鈕/tooltip）

2. 依 `config.chart_config.types` 決定：
- 顯示哪些 chart type
- 對應到 `returnChartComponent(name, svg?)`（一個 switch 內 import 對應元件/對應 SVG）

3. 對外 emit 的事件（Map/Views/Stores 的串接點）
- `toggle(value, map_config)`：在 map mode toggle on/off
- `filterByParam(map_filter, map_config, x, y)`
- `filterByLayer(map_config, layer)`
- `clearByParamFilter(map_config)`
- `clearByLayerFilter(map_config)`
- `fly(location)`：若圖表提供 fly UX
- `changeCity(city)`：select city 更新（MapView/DashboardView 會同步 store）
- `info(config)`：更多資訊（MoreInfo dialog）

你要看哪些檔案：
- `src/dashboardComponent/DashboardComponent.vue`
- `src/dashboardComponent/utilities/chartTypes.ts`
- `src/views/DashboardView.vue`
- `src/views/MapView.vue`

### 4.2 Views 的通用 pattern（Dashboard/Map/Preview/Info）
1. `DashboardView.vue`
- 若 dashboard 是 map-layers：以 `mode="halfmap"` 顯示卡片並搭配 toggle/filter 事件（轉成 mapStore 呼叫）
- 若 dashboard 只是一般 charts：以 `mode="half"` 顯示卡片
- 顯示 loading/error/empty 提示（都由 `contentStore.loading/error` 驅動）

2. `MapView.vue`
- 仍用 `DashboardComponent` 當「卡片控制入口」
- 另外固定渲染 `MapContainer`（Mapbox 畫面與底層控制）

3. `ComponentView.vue`
- 用 `DashboardComponent mode="preview"` 做元件瀏覽平台（搭配 search bar）
- 點 `info` 會用 router push 到 `component-info`

4. `ComponentInfoView.vue`
- 顯示一個元件的全量資訊：`DashboardComponent + HistoryChart + ReportIssue + DownloadData + EmbedComponent`
- history/來源資訊都來自 `dialogStore.moreInfoContent`（由 router/guard 或 contentStore 初始化填好）

5. `EmbedView.vue`
- 直接在頁面 onMounted 用 API 抓 `/component/:id/all`，再逐一抓每個 component 的 chart_data，交給 `DashboardComponent` 選 city 顯示

你要看哪些檔案：
- `src/views/DashboardView.vue`
- `src/views/MapView.vue`
- `src/views/ComponentView.vue`
- `src/views/ComponentInfoView.vue`
- `src/views/EmbedView.vue`

---

## 5. UI 組成與後端 API 的關係（誰呼叫什麼）

原則：API 呼叫通常集中在 store（`contentStore/authStore/mapStore`）或特定 view（`EmbedView`）。

### 5.1 contentStore：dashboard/component/圖表資料的 API 聚合
1. `setDashboards()`
- `GET /dashboard/`
- 組裝 dashboards map、personal dashboards、favorites

2. `setRouteParams(mode, index, city)`
- 呼叫順序：`setDashboards()`（視 dashboards 是否為空）→ `setCurrentDashboardAllContent()`

3. `setCurrentDashboardAllContent()`
- `GET /dashboard/:index`
- 拿到該 dashboard 的 components metadata
- 再呼叫 `setCurrentDashboardAllChartData()`

4. `setCurrentDashboardAllChartData()`
- 對 `cityDashboard.components` 逐一抓：
  - `GET /component/:componentId/chart?city=...`（並帶 timeframe params，依 `time_from/time_to` 判斷）
  - 若 component 有 history_config，則抓：
    - `GET /component/:componentId/history?...`

5. mapview 相關：`setMapLayers(city)`
- `GET /dashboard/map-layers-${city}`（拿 map layers component metadata）
- 再對每個 layer component：
  - `GET /component/:componentId/chart?city=...` 取得 chart_data

6. component-info：`getCurrentComponentData(index, city)`
- `GET /component/?filter...` 取得 component config（寫到 `dialogStore.moreInfoContent`）
- 再逐筆抓：
  - `GET /component/:id/chart?...`
  - 若 history_config：`GET /component/:id/history?...`

你要看哪些檔案：
- `src/store/contentStore.js`
- `src/components/dialogs/MoreInfo.vue`（如何用 `dialogStore.moreInfoContent` 渲染）
- `src/views/ComponentInfoView.vue`

### 5.2 authStore：登入/使用者資訊
- token 在 `localStorage`，`initialChecks()` 會：
  - `GET /user/me` 取使用者資料
  - 可能觸發 mapStore `fetchViewPoints()`

登入 API：
- email：`POST /auth/login`
- Taipei Pass：`GET /auth/callback?code=...`

你要看哪些檔案：
- `src/store/authStore.js`

### 5.3 mapStore：地圖幾何與圖層渲染行為（Mapbox/Deck.gl）
mapStore 的「API」多跟 geo_server/mapData 有關（取決於 layer config.source/type）：
- local geojson：`axios.get(/mapData/${index}.geojson)` → `addGeojsonSource()`
- raster/vector TMS：透過 `mapbox` source tiles（`geo_server/gwc/service/tms/...`）
- 有些特殊圖層可能會直接用 `axios.get(location.origin + /geo_server/taipei_vioc/ows?...typeName=...)`

你要看哪些檔案：
- `src/store/mapStore.js`
- `src/assets/configs/mapbox/mapConfig.js`
- `src/assets/configs/mapbox/mapStyle.js`

### 5.4 router/axios：請求攔截器與錯誤通知
- `src/router/axios.js` 統一：
  - request：附 token、設定 loading/error flags
  - response error：401/403/429/500 統一轉成 dialogStore notification

你要看哪些檔案：
- `src/router/axios.js`

---

## 6. Store 資料與事件流（事件如何變成畫面/圖層）

下面用「事件鏈」描述最常見的互動路徑。

### 6.1 切頁（dashboard/mapview/component-info）
1. 使用者路由導到新頁
2. `router.beforeEach`：
   - 呼叫 `contentStore.setRouteParams()`（dashboard/mapview）
   - 或呼叫 `contentStore.getCurrentComponentData()`（component-info）
   - 並且觸發 `mapStore.clear*`（依是否還在 mapview）
3. store 完成 API 抓取後，views 透過 `contentStore.loading/error/currentDashboard` 渲染對應 UI

你要看哪些檔案：
- `src/router/index.js`
- `src/store/contentStore.js`
- `src/views/DashboardView.vue`
- `src/views/MapView.vue`

### 6.2 map 卡片 toggle/filter
1. 使用者在 `DashboardComponent` 操作 toggle/filter
2. `DashboardComponent` emit：
- `toggle(value, map_config)` 或 `filterByParam(...)`
3. `MapView.vue` 的 handlers：
- 轉成 `mapStore` actions（例如 `addToMapLayerList` / `clearByParamFilter` / `filterByLayer` 等）
4. `mapStore` 更新 mapbox/deck layers，`loadingLayers` 也會影響 UI/行為（例如 shouldDisable）

你要看哪些檔案：
- `src/dashboardComponent/DashboardComponent.vue`
- `src/views/MapView.vue`
- `src/store/mapStore.js`

### 6.3 定時更新（App.vue → contentStore / mapStore）
1. `App.vue` onMounted 設定 timers
2. `reloadChartData` 每到頻率會呼叫：
- `contentStore.updateCurrentDashboardAllChartData()`
- 若某些 personal update boards 對應：`reloadMapData()`
3. 針對特定 metroKeys：`updateCurrentDashboardCertainChartData()`

你要看哪些檔案：
- `src/App.vue`
- `src/store/contentStore.js`

---

## 7. 新增 View 的通用 SOP（照做就不容易漏）

### 7.1 Step 1：先決定新增 View 的「責任模式」
- 這個 View 是哪類資料需求？
  - 需要 dashboard charts（用 `contentStore.currentDashboard`）
  - 需要 map（是否要保留/初始化 mapbox：`mapStore.initializeMapBox` / `clear*`）
  - 需要 component browsing（用 `contentStore.getAllComponents`）
  - 需要 embed（自取 `/component/:id/all`）

### 7.2 Step 2：新增路由（`src/router/index.js`）
1. 加入 `routes[]`：path、name、component
2. 更新 mobile/narrow redirect 的允許列表（如果該 view 也要在行動版可用）
3. 判斷是否需要 token：
   - 若非 public：要確保未登入時 guard 不會亂導回 dashboard

### 7.3 Step 3：確保 layout 顯示條件正確（`src/App.vue`）
新增路由後，`authStore.currentPath` 會跟著 `to.name` 變動。
- 如果你希望 sidebars 出現：
  - 需要在 `App.vue` 的 template 增加新分支或擴展既有分支條件
- 如果不希望 sidebars 出現：
  - 讓它走到 `v-else` 的 `router-view` 即可

### 7.4 Step 4：決定 store 初始化位置（`router.beforeEach` or view onMounted）
常見兩種方式：
1. 由 router guard 注入：
   - 類似 dashboard/mapview/component-info：讓 `beforeEach` 呼叫 store 初始化
2. 由 view 自己抓：
   - 類似 embed：`EmbedView` onMounted 自己抓 `/component/:id/all`

注意 mapStore：
- router guard 目前會在非 `/mapview` 時執行 `mapStore.clearEntireMap()`
- 若你新 View 也要依賴地圖狀態，要調整這段策略

你要看哪些檔案：
- `src/router/index.js`
- `src/App.vue`
- `src/store/contentStore.js`
- `src/store/mapStore.js`

---

## 8. 你接下來最該看的「文件路線」
為了快速熟悉專案而不是只看片段，建議順序：
1. `src/router/index.js`（先把路由->store->layout 的骨架看懂）
2. `src/App.vue`（再看定時更新與 layout 分支）
3. `src/store/contentStore.js`（把 API 如何組裝 dashboard/component 資料理解）
4. `src/store/mapStore.js`（把 toggle/filter/popup/layers 的行為理解）
5. `src/dashboardComponent/DashboardComponent.vue`（把 UI 事件 emit 及 chart 分派理解）
6. `src/views/DashboardView.vue` / `src/views/MapView.vue`（把事件接起來）
7. `src/components/map/MapContainer.vue`（把 map 容器與控件理解）

