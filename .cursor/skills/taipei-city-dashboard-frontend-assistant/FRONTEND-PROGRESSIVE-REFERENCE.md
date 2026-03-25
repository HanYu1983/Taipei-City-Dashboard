# Taipei City Dashboard 前端工程師（漸進式披露參照）

此文件用來「快速做事、需要才深入」。閱讀順序請從上到下，但每次只抓最短的那一段使用。

## 0. 何時要用這份技能
- 需求包含：`UI/頁面/版面/樣式`、`新增/修改圖表或組件`、`新增 Dialog/通知`、`新增/修改路由`、`Map/Mapbox/圖層 toggle/filter`
- 目標：用專案現有架構（Vue3 + Router + Pinia + ApexCharts + Mapbox/Deck.gl）精準找到落點並完成實作

## 1. Level 1（最短可用流程，30 秒）
1. **先判斷 mode（畫面類型）**
   - `dashboard`：`src/views/DashboardView.vue`
   - `mapview`：`src/views/MapView.vue` + `src/components/map/MapContainer.vue`
   - `component/component-info`：`src/views/ComponentView.vue`、`src/views/ComponentInfoView.vue`
   - `embed`：`src/views/EmbedView.vue`
   - `admin`：admin views（常見是由 admin 元件自掛載）
2. **定義互動落點**
   - 圖表/卡片互動：`src/dashboardComponent/DashboardComponent.vue`
   - 地圖圖層行為：`src/store/mapStore.js`
   - 內容資料：`src/store/contentStore.js`
   - 彈窗狀態：`src/store/dialogStore.js`（`dialogs[dialogKey]`）
3. **驗證最小路徑**
   - 切頁後 URL/狀態正確
   - 沒有出現明顯 `loading/error` 異常
   - map 的 toggle/filter/feature click 轉到對應 store 方法

## 2. Level 2（定位更準：先找事件，再找責任）
### 2.1 你要改的是哪一種「事件」？
- 圖表 type 切換（按鈕）
- toggle on/off（地圖卡片開關）
- filter（依參數/依圖層）
- fly（飛到位置）
- info（打開更多資訊 dialog）
- 顯示/隱藏（settings/sidebar 影響）

### 2.2 典型責任分工（照這個找檔案）
- UI 與 emit：`src/dashboardComponent/DashboardComponent.vue`
- mode 內組合與事件接收：`src/views/DashboardView.vue` / `src/views/MapView.vue`
- 地圖控制容器（區/里/near/mobile layers/admin incident）：`src/components/map/MapContainer.vue`
- 真正地圖行為與資源管理：`src/store/mapStore.js`
- API 取資料與組裝 `chart_data/history_data`：`src/store/contentStore.js`
- 彈窗狀態：`src/store/dialogStore.js`
- 對話框畫面模板：`src/components/dialogs/*.vue`（多半透過 `src/components/dialogs/DialogContainer.vue` 顯示）

## 3. Level 3（依任務類型：去哪裡改？怎麼驗？）
### 3.1 新增圖表/組件（chart type）
落點：
1. 新增圖表元件：`src/dashboardComponent/components/<NewName>.vue`
2. 註冊顯示字串：`src/dashboardComponent/utilities/chartTypes.ts`
3. 分派 render：`src/dashboardComponent/DashboardComponent.vue`（`returnChartComponent` 的 `switch` 加 case）
驗證：
- `config.chart_config.types` 的字串能命中分派 key
- 元件能正確吃到 `:series` 與 `:chart_config`（缺資料就看 `contentStore.loading/error`）

### 3.2 新增 Dialog/通知
落點：
1. 加 key：`src/store/dialogStore.js` 的 `dialogs`（預設 `false`）
2. 新增元件：`src/components/dialogs/<NewDialog>.vue`
3. 掛載父層模板：確認「觸發該 key」的地方真的有 `<NewDialog />`
   - 常見掛載點：`App.vue`、`DashboardView/MapView`、`MapContainer.vue`、`SettingsBar.vue`
驗證：
- 從 `false -> true` 會出現畫面
- 關閉流程走到 `hideAllDialogs()` 或相應 key 設回 `false`

### 3.3 新增 Map toggle/filter/feature click
落點：
1. 卡片 UI emit：`src/dashboardComponent/DashboardComponent.vue`
2. mode 事件接收：`src/views/MapView.vue`（把 emit 轉成 `mapStore.xxx`）
3. 真正行為：`src/store/mapStore.js`（例如 `addToMapLayerList/filterByParam/clearByParamFilter/turnOn/turnOff/removePopup/...`）
4. 視覺圖層定義（若需要）：`src/assets/configs/mapbox/mapConfig.js`、`mapStyle.js`
驗證：
- `toggle/filter` 後 map layer 的可見性/資料來源是否符合預期
- 快速切換不應殘留 popup/overlay 或造成大量 `loadingLayers` 卡住

### 3.4 改路由/新增頁面
落點：
1. `src/router/index.js`：路由表、守衛（`router.beforeEach`）
2. 更新對應 mode 的視圖與 sidebar 顯示條件（注意 `authStore.currentPath`）
3. mode redirect（mobile/narrow）可能會導回 `/dashboard`，需一起檢查
驗證：
- 切頁後 URL/`currentPath` 正確
- `mapStore.clearEntireMap/clearOnlyLayers` 時機合理（避免資料/圖層殘留）

### 3.5 改樣式
落點：
- 全域變數：`src/assets/styles/globalStyles.css`
- chart tooltip/覆寫：`src/assets/styles/chartStyles.css`
- 元件專屬：各 `.vue` 內 `scoped lang="scss"`
驗證：
- 不要破壞其它頁的 scoped 範圍（優先使用 scoped/局部 class）

## 4. Level 4（常見坑位清單，出問題再看）
1. Dialog 「看得到 key 但畫面不出現」：通常是 Dialog 元件沒有掛在父層模板
2. 新增 chart type 「按鈕有但顯示錯」：多半是 `chartTypes.ts` 字串與 `returnChartComponent` case 對不起來
3. 切到 `mapview` 但 sidebar 不對：`authStore.currentPath` 的條件在 `App.vue` + redirect 守衛在 `router/index.js`
4. Map 切頁殘留：檢查 `router.beforeEach` 中 `mapStore.clear*` 觸發時機

## 5. 建議回覆模板（給自己/給同事）
每次實作後的回覆都用這三段：
1. `修改重點`：屬於哪一層級（頁面/組件/dialog/map/styles）
2. `將改哪些檔案`：列 3-6 個核心路徑
3. `如何驗證`：列 1-3 個可操作的驗證步驟

