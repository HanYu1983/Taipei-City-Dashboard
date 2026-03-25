# 關鍵檔案速查（照抄使用）

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

