# 核心工作流程（每次都照做）

1. **需求解析**
  - 問自己：要改的是頁面/路由、對話框、dashboard 組件、地圖互動，還是單純樣式？
  - 找「觸發點」：例如使用者點擊按鈕、切換開關、選擇 dashboard/component、或 map layer 的 toggle/filter。

2. **定位入口檔案（先分模式）**
  - 前置：若是「架構/流程層級」的前端改動（layout/routing/store/event flow/新增 view），請先確認已完成：
    - `FRONTEND-KEY-LOGIC.md` → `FRONTEND-PROGRESSIVE-REFERENCE.md` 的閱讀
  - 先判斷目前在哪種模式（依路由與畫面結構；路由守衛也會影響結果）：
    - `dashboard`：`src/views/DashboardView.vue`
    - `mapview`：`src/views/MapView.vue` ＋ `src/components/map/MapContainer.vue`
    - `component/component-info`：`src/views/ComponentView.vue`、`src/views/ComponentInfoView.vue`
    - `embed`：`src/views/EmbedView.vue`
    - `admin`：admin views（Dialogs 常由 admin 元件自行掛載）
  - Layout/Sidebar 提醒（最常踩坑）：
    - `src/App.vue` 在 `authStore.currentPath === 'mapview' || 'dashboard'` 時才渲染 `SideBar/SettingsBar`
    - `authStore.currentPath` 由 `src/router/index.js` 的 `router.beforeEach` 設定（依 `to.name`；admin 另處理）
    - mobile/narrow 會觸發 router redirect，可能造成「你以為在某頁，其實被導回 dashboard」
  - 圖表/互動/對話框的入口關鍵點：
    - 圖表 UI 與互動 emit：`src/dashboardComponent/DashboardComponent.vue`
    - 地圖圖層行為：`src/store/mapStore.js`
    - Dialog 顯示只看 `dialogStore.dialogs[dialogKey]`，但 Dialog 元件必須存在於「掛載它的父層模板」裡

3. **決定資料流（State/Store vs 局部狀態）**
  - 需要跨元件共用或會牽動 API/地圖狀態：放到 `Pinia store`
  - 僅元件內 UI 狀態：用 `ref/computed`，並搭配 `scoped` 樣式即可。

4. **實作（依需求類型）**
  - 新增圖表/組件（chart type）：
    - 新增 `src/dashboardComponent/components/<NewName>.vue`
    - 更新顯示名稱：`src/dashboardComponent/utilities/chartTypes.ts`
    - 更新分派：`src/dashboardComponent/DashboardComponent.vue`（switch 加 case）
    - 確保 `config.chart_config.types` 字串一致
  - 新增 Dialog：
    - 在 `src/store/dialogStore.js` 的 `dialogs` 加 key（預設 `false`）
    - 新增元件 `src/components/dialogs/<NewDialog>.vue`，用 `DialogContainer dialog="<key>"`
    - 確認觸發該 key 的父層模板真的掛載了 `<NewDialog />`
  - 新增 Map 互動/按鈕（toggle/filter/fly/feature click）：
    - 入口 UI 與事件轉發：`src/views/MapView.vue`
    - 行為落地：`src/store/mapStore.js`
    - 視覺圖層定義（必要時）：`src/assets/configs/mapbox/mapConfig.js` / `mapStyle.js`

5. **樣式規範**
  - 優先用 `globalStyles.css` 的 CSS variables
  - 圖表 tooltip：用 `src/assets/styles/chartStyles.css`
  - 元件級特定樣式：用 `scoped lang="scss"`

6. **驗證（最小可驗證路徑）**
  - 若改到 routing：
    - 確認 `src/router/index.js` 的 `router.beforeEach` 呼叫 `contentStore.setRouteParams(...)`
    - 確認 `mapStore.clearEntireMap/clearOnlyLayers` 時機符合預期
  - 若改到圖表：
    - 確認 `config.chart_config.types` 能命中 `DashboardComponent.vue` 的分派
  - 若改到 map：
    - 確認 toggle/filter 真的導到 `src/store/mapStore.js` 對應方法
    - 觀察 `loadingLayers` 與 `currentVisibleLayers` 變化，popup/3D/overlay 不殘留
  - 若改到 dialog：
    - 確認 `dialogStore.dialogs.<key>` `false -> true`
    - 關閉能回到 `hideAllDialogs()` 或相應 key 回到 `false`

