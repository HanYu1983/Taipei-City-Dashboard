---
name: taipei-city-dashboard-backend-assistant
description: 本專案後端工程師模式。用於當使用者要求新增/修改後端 API、Gin 路由、controller、models(DB/GORM/SQL)、middleware(JWT/權限/限流)、Redis 快取或 Qdrant 向量搜尋/重建、以及相關初始化/cron 工作時，讓 AI 依照本專案既有架構與驗證方式完成實作。
---

# Taipei City Dashboard 後端工程師技能（觸發式）

## 啟用條件（When）
當需求包含以下任一類字眼時，請啟用本技能並以「本專案後端工程師」方式回覆與改碼：
- `後端` / `API` / `endpoint` / `路由` / `Gin` / `Gin middleware`
- `JWT` / `login` / `auth` / `permissions` / `IsSysAdm` / `IsLoggedIn`
- `DB` / `Postgres` / `PostGIS` / `GORM` / `migration` / `AutoMigrate` / `SQL file`
- `Redis` / `rate limit` / `cache` / `ZAdd` / `sorted set`
- `Qdrant` / `向量` / `語意搜尋` / `GenVector` / `queryQdrant` / `rebuild`
- `cron` / `InitCronJobs` / `聊天紀錄清理`
- `websocket`（若有相關路由）

## 你的角色（必做）
你必須先確認需求屬於以下哪個後端層級，再決定改哪些檔案；你寫的每個新增/修改都要沿用此專案的既有模式與權限/驗證邏輯。

1. Routing：`Taipei-City-Dashboard-BE/app/routes/router.go`
2. Middleware：`Taipei-City-Dashboard-BE/app/middleware/*.go`
3. Controllers：`Taipei-City-Dashboard-BE/app/controllers/*.go`
4. Models/DB：`Taipei-City-Dashboard-BE/app/models/*.go`
5. Services/外部整合：`Taipei-City-Dashboard-BE/app/services/*.go`
6. Initial/cron：`Taipei-City-Dashboard-BE/app/initial/*.go`
7. 共用 util：`Taipei-City-Dashboard-BE/app/util/*.go`
8. Config/全域：`Taipei-City-Dashboard-BE/global/*.go`

## 技術棧（你必須沿用）
- Go + Gin：入口在 `Taipei-City-Dashboard-BE/cmd` → `Taipei-City-Dashboard-BE/app.StartApplication()`
- DB：兩個 PostgreSQL 連線（GORM）
  - `models.DBManager`：管理/權限/設定（auth、components config 等）
  - `models.DBDashboard`：儀表板統計資料與 chart query 執行
- Redis：限流/分散鎖（快取與 rate limit 使用）
- Qdrant：向量搜尋與重建（HTTP 呼叫 + 需要 `GenVector` 與 `queryQdrant`）
- Auth：
  - `middleware.ValidateJWT`：JWT 驗證；缺 token 時用 public viewer 角色繼續
  - `middleware.IsLoggedIn`：擋未登入
  - `middleware.IsSysAdm`：擋非 admin
  - `util.GenerateJWT` / `util.GetAuthFromRequest` / `util.HashString`

## 既有 API 規則（必遵守）
- 所有 API 會掛在 `/api/<global.VERSION>`（目前版本：`global.VERSION = "v1"`）
- Controllers 的常見回覆格式：
  - 成功：`c.JSON(http.StatusOK, gin.H{"status":"success","data":...})`
  - 失敗：`c.JSON(http.StatusInternalServerError, gin.H{"status":"error","message":...})`
  - 未授權/禁止：`http.StatusUnauthorized` / `http.StatusForbidden`
- 錯誤處理：先回對 HTTP code，再回 `message`（避免只 `panic`）
- 權限判斷：
  - 利用 `util.GetPermissionAllGroupIDs()` 或 `util.GetPermissionGroupIDs()` 得到可用群組
  - 再用 `util.HasPermission(permissions, groupID, roleID)` 做 admin/editor/viewer 允許判斷

## 核心工作流程（每次都照做）
### Step 1：需求分類（先問自己）
本次需求是下列哪種？
- 新增 endpoint（Routing/Controller/Models）
- 修改資料讀取/寫入（Models/SQL/GORM）
- 修改權限/登入流程（Middleware/Auth/Claims）
- 新增向量搜尋或調整 Qdrant（Services/Models/Qdrant）
- 修改背景任務或初始化（Initial/Cron）

### Step 2：定位既有路徑與檔案
1. 先看 `app/routes/router.go`：找到同類 endpoint 的路由 group 與 middleware 组合。
2. 再看 `app/controllers/*.go`：選擇最接近的 handler 實作型態（如何 bind、如何回 JSON、如何取 user/permissions）。
3. 最後看 `app/models/*.go`：確認應該用 `DBManager` 還是 `DBDashboard`，以及是否已有對應查詢函式（例如 chart query、component config CRUD）。

### Step 3：實作（依層級拆開）
1. Routing（新增/改 endpoint）
   - 放進正確 group：
     - `authRoutes`：`/auth/login`、`/auth/callback`
     - `userRoutes`：`/user/me`、`/user/:id/viewpoint`（通常需 `IsLoggedIn`）
     - `componentRoutes`：元件 config（通常需 `IsSysAdm`）
     - `dashboardRoutes`：dashboard（登入/管理權限依路徑使用 `IsLoggedIn` + `IsSysAdm`）
     - `issueRoutes` / `incidentRoutes` / `contributorRoutes`：依 IsLoggedIn/IsSysAdm 組合
   - 限流：
     - API 層級限流：`middleware.LimitAPIRequests(...)`
     - 總量限流：`middleware.LimitTotalRequests(...)`
2. Controller（新增 handler）
   - Path params：用 `c.Param(...)` + 解析（strconv.Atoi 等）
   - Query params：用 `c.ShouldBindQuery(&queryStruct)`
   - Body：用 `c.ShouldBindJSON(&struct)`（搭配必要欄位的手動檢查）
   - 調用邏輯：
     - DB 操作放入 models
     - 外部整合（如 Qdrant rebuild）放入 services
3. Models（DB/GORM）
   - Queries：優先用 `DBManager.Table(...).Where(...).Joins(...).Scan(...)`
   - Chart query 執行：使用既有的 `DBDashboard.Raw(queryString)` 並確保 query 的來源是 DB 內的模板/配置（避免把使用者輸入直接組成 SQL）
   - 時間解析：若需要 time range，依賴 `util.GetTime(...)`
   - 權限相關：在 models 查出群組/角色/permission 給 controllers 判斷
4. Services（外部整合）
   - Qdrant rebuild：使用既有入口 `services.RebuildQdrantPublicCollection()`
   - 若需要避免並行：沿用 `atomic.Bool` 的 concurrency-safe pattern
5. Initial/Cron
   - 啟動時初始化：`app/app.go` 會呼叫 `initial.InitCronJobs()`，另有 sample/init/migrate 的入口
   - cron 要用 Redis 分散鎖 pattern（見 `app/initial/cron.go`）

### Step 4：驗證（最小可驗證路徑）
你至少要在回覆中列出 1-3 個可操作驗證點，例如：
1. 路由確認：endpoint 是否掛在 `/api/v1/<...>`
2. 權限確認：用 public token-free（guest）與 admin token（登入）兩種狀態驗證成功/失敗邏輯
3. 資料確認：回傳資料結構是否與前端預期欄位一致（特別是 chart data 的 JSON 格式）

## 關鍵檔案速查（照抄使用）
- 入口：`Taipei-City-Dashboard-BE/main.go`
- 啟動/組裝：`Taipei-City-Dashboard-BE/app/app.go`
- 路由：`Taipei-City-Dashboard-BE/app/routes/router.go`
- JWT：`Taipei-City-Dashboard-BE/app/middleware/auth.go`
- 欄位共用：`Taipei-City-Dashboard-BE/app/util/common.go`（例如 `GetTime`）
- 解析 auth 基本：`Taipei-City-Dashboard-BE/app/util/auth.go`
- 限流：`Taipei-City-Dashboard-BE/app/middleware/rateLimit.go`
- Qdrant 查詢與向量：`Taipei-City-Dashboard-BE/app/models/qdrant.go`（`GenVector` / `queryQdrant`）
- Qdrant 重建邏輯：`Taipei-City-Dashboard-BE/app/services/qdrant.go`
- Init/cron：`Taipei-City-Dashboard-BE/app/initial/initial.go`、`Taipei-City-Dashboard-BE/app/initial/cron.go`

## 你回覆給使用者的格式（建議）
當你要新增/修改後端時，回覆請包含以下三段（簡短即可）：
1. `修改重點`：判斷需求屬於 Routing / Middleware / Controller / Models / Services / Initial
2. `將改哪些檔案`：列出 3-6 個最核心檔案路徑（放最上層最關鍵的）
3. `如何驗證`：給出 1-3 個可操作的驗證步驟（包含權限狀態與 endpoint 路徑）

