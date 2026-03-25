# 錯誤處理日誌（必讀，持續更新）

每次遇到前端行為錯誤（導頁錯誤、狀態錯亂、地圖互動失效、dialog 沒出現等），都要把以下資訊寫進來：症狀 → 根因 → 修正 → 驗證 → 預防規則。

---

### 2026-03-25 SideBar 導向錯誤：從 `/ui-test` 點其他儀表板都變回 `/ui-test`

- 症狀
  - 先進入 `/ui-test`，再從左側點 `長照關懷`、`圖資資訊` 等儀表板，頁面會被導回 `/ui-test`（或等價地生成錯誤 URL）。
- 根因
  - `src/components/utilities/miscellaneous/SideBarTab.vue` 的 `tabLink` 非 admin 情況下會用當前頁面的 `route.path` 當 base path：`route.path?index=...`。
  - 當目前路徑是 `/ui-test` 時，base path 變成 `/ui-test`，就會產生 `/ui-test?index=...`，導致體感像「一直回到測試頁」。
- 修正
  - 在 `src/components/utilities/miscellaneous/SideBarTab.vue` 改成「非 admin 時依目前 `authStore.currentPath` 決定目標路徑」：
    - 只有在目前是 `mapview` 才導到 `/mapview`
    - 其它（包含 `ui-test`）一律導到 `/dashboard`
  - 同時修正 admin query 組裝，避免多餘 `?` 的 URL 變形。
- 驗證方式（必做）
  - 使用 `browserMCP`：
    - 先進 `http://localhost:8080/dashboard?index=ltc_care_tpe&city=taipei`
    - 點 `測試用儀表板` → 再點 `長照關懷` → 確認 URL 正確回 `/dashboard?index=ltc_care_tpe&city=taipei`
    - 再從 `/ui-test` 點 `圖資資訊` → 確認 URL 正確回 `/dashboard?index=map-layers-taipei&city=taipei`
- 預防規則（寫在技能裡）
  - Sidebar/導航的非 admin link 組裝不要用 `route.path` 當 base path（route 會隨目前頁變動）。
  - 導頁應以「目標模式」為準（本專案：`dashboard` vs `mapview`），並用 `authStore.currentPath` 決策。

---

### 2026-03-25 測試儀表板重整錯亂：`/ui-test` 模式缺少 store 初始化

- 症狀
  - 測試用儀表板使用 `/ui-test` 獨立 route 時，包含重新整理後會造成 UI 錯亂/狀態不一致（體感與既有 `/dashboard?index=...&city=...` 模式不同）。
  - 修正後期確認「測試應走 dashboard query 模式」：`/dashboard?index=test&city=taipei`。
- 根因
  - `src/router/index.js` 的內容初始化邏輯主要針對 `/dashboard` 與 `/mapview`：
    - `/ui-test` 走 `contentStore.clearCurrentDashboard()`，不會呼叫 `contentStore.setRouteParams(...)` 那條初始化鏈。
  - `App.vue` 仍會渲染 `SideBar/SettingsBar`，而它們依賴 `contentStore.currentDashboard` / `dashboards` 等狀態；在 `/ui-test` 重整後 store 未正確初始化，就容易出現 UI 異常。
- 修正
  - 將側邊欄「測試用儀表板」從獨立 `/ui-test` 移到台北儀表板子菜單：
    - 導向改成 `http://localhost:8080/dashboard?index=test&city=taipei`（並用 query 設定前端注入模式）。
  - 在 `src/router/index.js` 增加前端-only 的 test-dashboard 分支：
    - 當 `to.path === '/dashboard' && to.query.index === 'test' && to.query.city === 'taipei'` 時，
      - `contentStore.setDashboards(true)` 只取得儀表板清單，避免打不存在的 `/dashboard/test` 後端 API
      - 直接注入 `contentStore.currentDashboard / components`，讓 UI 走一致的 `/dashboard` 初始化流程。
  - 在 `src/views/DashboardView.vue` 依 `route.query.index/city` 將測試元件注入 `contentStore.currentDashboard.components`，並禁用該注入元件的 favorite/delete 互動，避免打後端收藏/刪除 API。
- 驗證方式（必做）
  - 直接開啟（或點側邊欄）：
    - `http://localhost:8080/dashboard?index=test&city=taipei`
  - 重新整理：
    - 驗證注入的測試元件仍會正確渲染
    - 側邊欄/設定列標題不會在 refresh 後變成空值或錯誤狀態
- 預防規則（寫在技能裡，未來遇到類似錯就直接套）
  - 不要只靠建立「新 route + App.vue 顯示區塊」就當作測試頁；若 `SideBar/SettingsBar/DashboardView` 依賴 `contentStore.currentDashboard` 或 `dashboards`，測試 route 也必須走同等級的 store 初始化（或做前端-only 注入）。
  - 若你要測試用 `/dashboard?index=...&city=...`，就確保測試導向與初始化流程一致；避免使用 `/ui-test` 這種與專案初始化假設不一致的獨立 route（尤其在 refresh 情境下）。

