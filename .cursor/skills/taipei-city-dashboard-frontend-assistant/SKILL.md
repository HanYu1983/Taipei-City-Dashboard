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

## 你的角色（必做）
你必須先確認需求落在以下哪個層級，再決定改哪些檔案：
1. **Routing/Pages**：`src/router/index.js`、`src/views/*.vue`
2. **Layout/Global UI**：`src/App.vue`（Nav/SideBar/Dialogs/定時更新等）
3. **Dialogs**：`src/store/dialogStore.js` + `src/components/dialogs/*`
4. **Dashboard UI（圖表組件渲染器）**：
   - `src/dashboardComponent/DashboardComponent.vue`
   - `src/dashboardComponent/components/*Chart*.vue`
   - `src/dashboardComponent/utilities/chartTypes.ts`
5. **Map UI（互動與圖層開關入口）**：
   - `src/views/MapView.vue`、`src/components/map/MapContainer.vue`
   - `src/store/mapStore.js`
   - `src/assets/configs/mapbox/mapConfig.js`、`mapStyle.js`
6. **狀態/資料流**：`src/store/*Store.js`、`src/router/axios.js`
7. **樣式系統**：`src/assets/styles/globalStyles.css`、`chartStyles.css`、以及各元件內 `scoped lang="scss"`

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

2. **定位入口檔案**
   - 頁面：`src/views/DashboardView.vue` / `MapView.vue` / `ComponentView.vue` / `ComponentInfoView.vue`
   - 地圖容器：`src/components/map/MapContainer.vue`
   - dashboard 組件渲染：`src/dashboardComponent/DashboardComponent.vue`
   - dialog：`src/App.vue` + `src/store/dialogStore.js` + 對應 `src/components/dialogs/*.vue`

   - Layout/Sidebar 提醒：`src/App.vue` 會依 `authStore.currentPath` 決定是否渲染 `SideBar`
     - 目前條件是 `authStore.currentPath === 'mapview'` 或 `authStore.currentPath === 'dashboard'`
     - `authStore.currentPath` 來源於 `src/router/index.js` 的 `router.beforeEach`（依 `to.name` 設定）
     - 因此「新增頁面但希望 SideBar 保留」時，必須同步調整 `src/App.vue` 的條件（以及確保 router 的 `name` 設計符合預期）

3. **決定資料流（State/Store vs 局部狀態）**
   - 需要跨元件共用或會牽動 API/地圖狀態：放到 `Pinia store`（`contentStore` / `mapStore` / `dialogStore` / `authStore` 等）
   - 僅元件內 UI 狀態：用 `ref/computed`，並搭配 `scoped` 樣式即可。

4. **實作（依需求類型）**
   - 新增圖表/組件：
     - 新增 `src/dashboardComponent/components/<NewName>.vue`
     - 在 `DashboardComponent.vue` 中加入對應類型分派（依現有 pattern）
     - 在 `chartTypes.ts` 登記對應名稱（避免 UI 顯示不一致）
   - 新增 Dialog：
     - 在 `src/store/dialogStore.js` 的 `dialogs` 加入新的 key（預設 `false`）
     - 新增/實作 `src/components/dialogs/<NewDialog>.vue`
     - 在 `src/App.vue` 的 template 內掛載該 dialog，條件以 `dialogStore.dialogs.<key>` 驅動
   - 新增 Map 互動/按鈕：
     - 按鈕或入口：放在 `MapView.vue` / `MapContainer.vue`
     - 真正圖層邏輯：呼叫 `src/store/mapStore.js` 對應 actions
     - 視覺圖層定義：必要時調整 `mapConfig.js` / `mapStyle.js`

5. **樣式規範**
   - 常見顏色/字型：優先用 `globalStyles.css` 的 CSS variables（例如 `--color-*`、`--font-*`）
   - 圖表 tooltip：用 `chartStyles.css` 的現成 classes（例如 `.chart-tooltip`、`.apexcharts-tooltip`）
   - 元件級特定樣式：用 `scoped lang="scss"`，避免大範圍影響。

6. **驗證（最小可驗證路徑）**
   - 若改到 routing：先確認路由切換正確且守衛不會把你導回 `/dashboard`
   - 若改到圖表：確認 `config.chart_config.types` 有對到新增的 chart type
   - 若改到 map：確認 mapStore 的 layer 開關與事件（toggle/filter）有正確連到 store actions
   - 若改到 dialog：確認 `dialogStore.dialogs.<key>` 能被觸發且顯示/關閉流程正確。

   - 若改到 layout/SideBar：點選新頁後確認 SideBar/NavBar/SettingsBar 是否符合預期（尤其 desktop vs mobile 分支）

## 關鍵檔案速查（照抄使用）
- `src/main.js`：Vue app 初始化 + 全域樣式
- `src/App.vue`：全域 Layout + Dialog 渲染 + 定時更新/Chatroom 顯示
- `src/router/index.js`：路由表 + beforeEach 守衛 + content/map store 初始化流程
- `src/router/axios.js`：API 請求統一攔截與錯誤通知
- `src/store/authStore.js`：登入/token/user 資料
- `src/store/contentStore.js`：dashboard/component 資料與 loading/error
- `src/store/mapStore.js`：Mapbox/Deck.gl 初始化、圖層管理、layer/filter/toggle
- `src/store/dialogStore.js`：所有 dialog 的開關狀態
- `src/views/DashboardView.vue`：一般 dashboard 的 DashboardComponent 清單
- `src/views/MapView.vue`：map 模式下的 DashboardComponent 清單與 toggle/filter
- `src/components/map/MapContainer.vue`：Mapbox 容器與圖層/控制入口
- `src/dashboardComponent/DashboardComponent.vue`：組件渲染器（chart component 的分派中心）
- `src/dashboardComponent/utilities/chartTypes.ts`：chart type 對照

## 你回覆給使用者的格式（建議）
當你要新增/修改 UI 時，回覆請包含以下三段（簡短即可）：
1. `修改重點`：你判斷需求屬於哪一類檔案層級（頁面/組件/dialog/map/styles）
2. `將改哪些檔案`：列出 3-6 個最核心檔案路徑
3. `如何驗證`：給出 1-3 個可操作的驗證步驟

