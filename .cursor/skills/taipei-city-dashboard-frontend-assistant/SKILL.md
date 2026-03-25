---
name: taipei-city-dashboard-frontend-assistant
description: 專案專用前端工程師模式。用於當使用者要求「新增/修改 UI、增加圖表/組件、調整地圖互動、改頁面/路由、做彈窗/通知」時，讓 AI 依照本專案既有架構（Vue3 + Router + Pinia + ApexCharts + Mapbox/Deck.gl）精準定位檔案並完成實作。
---

# Taipei City Dashboard 前端工程師技能（觸發式）

當你看到使用者的需求包含下列任一類字眼時，請啟用本技能並以「本專案前端工程師」的方式回覆與改碼：
- `UI` / `頁面` / `版面` / `介面` / `樣式`
- `新增組件` / `新增圖表` / `Chart`
- `新增 Dialog` / `新增彈窗` / `通知`
- `新增路由` / `修改路由` / `導覽`
- `Map` / `地圖` / `Mapbox` / `Deck.gl` / `圖層` / `toggle/filter`

## 參考文件（必讀，按順序）
1. 先讀 `FRONTEND-KEY-LOGIC.md`：建立「專案前端架構理解」（UI LAYOUT、UI ROUTING、COMPONENT 通用 SOP、STORE/事件流、與後端 API 關係、新增 View SOP）。
2. 再讀 `FRONTEND-PROGRESSIVE-REFERENCE.md`：用 Level 模式快速定位「當下這個需求」要怎麼落點與怎麼驗證。
3. 完成上述兩份後，才開始依需求把檔案定位到具體修改點。

## 你的角色（必做）
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

## 技術棧（你必須沿用）
- `Vue 3` + `Vite`
- `vue-router`：頁面/守衛/導向
- `Pinia`：`src/store/*`
- `ApexCharts`：透過 `vue3-apexcharts`，樣式多在 `src/assets/styles/chartStyles.css`
- 地圖：
  - `mapbox-gl`（Mapbox 原生）
  - `@deck.gl/mapbox`（疊加層）
  - `three` / `threebox-plugin`（模型/3D）
- 圖示：`material-icons`（`DashboardComponent.vue` 有載入）
- 樣式：
  - 全域變數與 base：`globalStyles.css`
  - 圖表 tooltip/覆寫：`chartStyles.css`
  - 元件內：`<style scoped lang="scss">`（優先用 scss 方式調整）

## 核心工作流程（每次都照做）
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
     - Dialog 顯示只看 `dialogStore.dialogs[dialogKey]`，但 Dialog 元件必須存在於「掛載它的父層模板」裡（常見掛載點：`App.vue`、`DashboardView/MapView`、`MapContainer`、`SettingsBar`）

3. **決定資料流（State/Store vs 局部狀態）**
   - 需要跨元件共用或會牽動 API/地圖狀態：放到 `Pinia store`（`contentStore` / `mapStore` / `dialogStore` / `authStore` 等）
   - 僅元件內 UI 狀態：用 `ref/computed`，並搭配 `scoped` 樣式即可。

4. **實作（依需求類型）**
   - 新增圖表/組件（chart type）：
     - 新增 `src/dashboardComponent/components/<NewName>.vue`
     - 更新顯示名稱：`src/dashboardComponent/utilities/chartTypes.ts`（新增 `NewName: "顯示名稱"`）
     - 更新分派：`src/dashboardComponent/DashboardComponent.vue`
       - import 新元件
       - `returnChartComponent(name)` 的 `switch` 加入對應 case
     - 確保 type 字串一致：`config.chart_config.types` 要能命中 `chartTypes.ts` 與 `DashboardComponent.vue` 的分派 key
   - 新增 Dialog：
     - 在 `src/store/dialogStore.js` 的 `dialogs` 加入新的 key（預設 `false`）
     - 新增/實作 `src/components/dialogs/<NewDialog>.vue`，用 `DialogContainer dialog="<key>"` 包住內容
     - 找正確掛載點：確認「觸發該 key」的父層 template 裡已經有 `<NewDialog />`（常見：`App.vue`、`DashboardView/MapView`、`MapContainer`、`SettingsBar`）
   - 新增 Map 互動/按鈕（toggle/filter/fly/feature click）：
     - 入口 UI 與事件轉發：`src/views/MapView.vue`（接住 `DashboardComponent` 的 emit 後呼叫 `mapStore`）
     - 行為落地：`src/store/mapStore.js`（例如 `addToMapLayerList`、`filterByParam`、`turnOffMapLayerVisibility`、`removePopup` 等）
     - 視覺圖層定義：必要時調整 `src/assets/configs/mapbox/mapConfig.js` / `mapStyle.js`
     - 若是地圖容器控制（區/里/near/mobile layers/管理員災害/地標）→ 主要看 `src/components/map/MapContainer.vue`

5. **樣式規範**
   - 常見顏色/字型：優先用 `globalStyles.css` 的 CSS variables（例如 `--color-*`、`--font-*`）
   - 圖表 tooltip：用 `src/assets/styles/chartStyles.css` 的現成 classes（例如 `.chart-tooltip`、`.apexcharts-tooltip`）
   - 元件級特定樣式：用 `scoped lang="scss"`，避免大範圍影響。

6. **驗證（最小可驗證路徑）**
   - 若改到 routing：
     - 確認 `src/router/index.js` 的 `router.beforeEach` 仍正確呼叫 `contentStore.setRouteParams(...)`（dashboard/mapview）
     - 確認 `mapStore.clearEntireMap/clearOnlyLayers` 的時機符合預期（避免切頁殘留 layer/source）
   - 若改到圖表：
     - 確認 `config.chart_config.types` 的字串能命中 `DashboardComponent.vue` 的 `returnChartComponent` 分派
     - 確認對應 chart 元件能正確使用 `:series`、`:chart_config`（必要時看 contentStore 是否進入 loading/error）
   - 若改到 map：
     - 確認 toggle/filter 事件真的導到 `src/store/mapStore.js` 對應方法
     - 觀察 `mapStore.loadingLayers` 與 `currentVisibleLayers` 的變化，並確認 popup/3D/overlay 不會殘留異常
   - 若改到 dialog：
     - 確認 `dialogStore.dialogs.<key>` 會從 `false → true`
     - 確認 DialogContainer 所在的父層真的掛載了該元件（UI 才會出現；只改 store 不夠）
     - 關閉流程回到 `hideAllDialogs()` 或將該 key 設回 `false`
   - 若改到 layout/SideBar：
     - 點選新頁後確認 `SideBar/SettingsBar` 與手機/窄螢幕 redirect 行為都符合預期

## 關鍵檔案速查（照抄使用）
- `src/main.js`：Vue app 初始化 + 全域樣式（global/chart/toggleswitch）
- `src/App.vue`：全域 Layout（依 `authStore.currentPath` 渲染 SideBar/SettingsBar/AdminSideBar/ComponentSideBar）＋ 定時更新/Chatroom + 全局 InitialWarning/LogIn
- `src/router/index.js`：路由表 + beforeEach 守衛（`contentStore.setRouteParams`、`mapStore.clear*`）＋ `currentPath` 設定
- `src/router/axios.js`：API 請求統一攔截與錯誤通知（token + notification）
- `src/store/authStore.js`：登入/token/user/device + `currentPath` + device 判斷
- `src/store/contentStore.js`：dashboard/component 資料、`chart_data/history_data`、loading/error
- `src/store/mapStore.js`：Mapbox/Deck.gl 初始化、圖層管理（add/turnOn/turnOff/filter/clear）、popup/viewpoints、3D MRT
- `src/store/dialogStore.js`：dialogs key 開關狀態與通知內容
- `src/components/dialogs/DialogContainer.vue`：以 `dialog` prop 顯示對應 modal
- `src/views/DashboardView.vue`：一般 dashboard 的 DashboardComponent 清單（含 MoreInfo/ReportIssue）
- `src/views/MapView.vue`：map 模式下 DashboardComponent 清單（toggle/filter/fly 事件轉發）
- `src/components/map/MapContainer.vue`：Mapbox 容器與控制按鈕（區/里/near/mobile layers/admin incident）＋部分 dialogs
- `src/components/utilities/bars/SideBar.vue`：左側儀表板清單（expand/collapse）
- `src/components/utilities/bars/SettingsBar.vue`：頁面層級設定入口（設定/addPin/mobile navigation）
- `src/dashboardComponent/DashboardComponent.vue`：組件渲染器（chart 元件分派）＋ emit 互動事件
- `src/dashboardComponent/utilities/chartTypes.ts`：chart type 顯示名稱對照表

## 錯誤處理日誌（必讀，持續更新）
每次遇到前端行為錯誤（導頁錯誤、狀態錯亂、地圖互動失效、dialog 沒出現等），都要把以下資訊寫進來：症狀 → 根因 → 修正 → 驗證 → 預防規則。

### 2026-03-25 SideBar 導向錯誤：從 `/ui-test` 點其他儀表板都變回 `/ui-test`
- 症狀
  - 先進入 `/ui-test`，再從左側點 `長照關懷`、`圖資資訊` 等儀表板，頁面會被導回 `/ui-test`（或等價地生成錯誤 URL）。
- 根因
  - `src/components/utilities/miscellaneous/SideBarTab.vue` 的 `tabLink` 非 admin 情況下會用當前頁面的 `route.path` 當 base path：`route.path?index=...`。
  - 當目前路徑是 `/ui-test` 時，base path 變成 `/ui-test`，就會產生 `/ui-test?index=...`，導致整體體感像「一直回到測試頁」。
- 修正
  - 在 `src/components/utilities/miscellaneous/SideBarTab.vue` 改成「非 admin 時依目前 `authStore.currentPath` 決定目標路徑」：
    - 只有在目前是 `mapview` 才導到 `/mapview`
    - 其它（包含 `ui-test`）一律導到 `/dashboard`
  - 同時修正 admin query 組裝，避免多餘 `?` 的 URL 變形。
- 影響範圍
  - 左側儀表板清單的非 admin 連結生成邏輯（所有像 `/ui-test` 這種非 `/dashboard` / `/mapview` route 的起點）。
- 驗證方式（必做）
  - 使用 `browserMCP`：
    - 先進 `http://localhost:8080/dashboard?index=ltc_care_tpe&city=taipei`
    - 點 `測試用儀表板` → 再點 `長照關懷` → 確認 URL 正確回 `/dashboard?index=ltc_care_tpe&city=taipei`
    - 再從 `/ui-test` 點 `圖資資訊` → 確認 URL 正確回 `/dashboard?index=map-layers-taipei&city=taipei`
- 預防規則（寫在技能裡，未來遇到類似錯就直接套）
  - Sidebar/導航的非 admin link 組裝不要用 `route.path` 當 base path（route 會隨目前頁變動）。
  - 導頁應以「目標模式」為準（本專案：`dashboard` vs `mapview`），並用 `authStore.currentPath` 決策。

## 你回覆給使用者的格式（建議）
當你要新增/修改 UI 時，回覆請包含以下三段（簡短即可）：
1. `修改重點`：你判斷需求屬於哪一類檔案層級（頁面/組件/dialog/map/styles）
2. `將改哪些檔案`：列出 3-6 個最核心檔案路徑
3. `如何驗證`：給出 1-3 個可操作的驗證步驟

