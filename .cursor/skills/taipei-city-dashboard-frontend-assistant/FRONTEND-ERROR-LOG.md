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

