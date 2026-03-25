# 技術棧（你必須沿用）

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

