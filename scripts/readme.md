# Docker 本地啟動腳本

本資料夾提供一個用於在本機啟動 Taipei City Dashboard（含 DB、Qdrant、前後端）的腳本。

## 前置需求

1. 啟動 Docker 引擎（Docker Desktop 或其他方式）。
2. 檢查 `docker/.env` 是否存在。
   - 若不存在，腳本會先把 `docker/.env.template` 複製成 `docker/.env`，但你仍需要填入標註必填的環境變數後再重跑。
3. 確保你已填好以下常見必填項目（以 `docker/.env.template` 註解為準）：
   - `VITE_MAPBOXTOKEN`：地圖渲染使用
   - `DASHBOARD_DEFAULT_USERNAME` / `DASHBOARD_DEFAULT_Email` / `DASHBOARD_DEFAULT_PASSWORD`：預設管理員帳密
   - `DB_DASHBOARD_PASSWORD` / `DB_MANAGER_PASSWORD`：Postgres 密碼
   - `QDRANT_API_KEY`：Qdrant 連線驗證使用

## 指令用法

腳本路徑：

`./scripts/run-local-dashboard.sh`

### 啟動整套服務

`./scripts/run-local-dashboard.sh`

會依序執行：建立 `br_dashboard` network -> 啟動 DB/Qdrant -> 跑 init（前端 npm install、後端 migrate/init）-> 啟動完整服務。

啟動完成後，開啟：

`https://localhost:8080`

### 重新初始化資料庫

`./scripts/run-local-dashboard.sh reinit-db`

會先執行 `docker-compose-db.yaml down -v` 清掉 DB volumes，再重跑整套啟動流程。

### 執行 Qdrant 向量匯入/升級

`./scripts/run-local-dashboard.sh vector-db-upgrade`

會跑 compose 裡的 `vector-db-upgrade` service（將 PostgreSQL 資料轉為向量並寫入 Qdrant）。

### 顯示說明

`./scripts/run-local-dashboard.sh help`

