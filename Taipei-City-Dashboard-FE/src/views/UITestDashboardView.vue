<!-- Developed by Taipei Urban Intelligence Center 2023-2024 -->
<script setup>
const title = "測試用儀表板";
</script>

<template>
  <div class="uitest">
    <h2>{{ title }}</h2>
    <p>
      此頁面用於測試新增的前端 COMPONENT。先用純 UI/文案佔位，之後再把待測 COMPONENT 接到這裡。
    </p>
    <div class="uitest-card">
      <p>待測 COMPONENT：TODO</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.uitest {
  width: 100%;
  height: 100%;
  padding: 16px 20px;
  overflow-y: auto;

  h2 {
    font-size: var(--font-m);
    font-weight: 500;
    margin: 0 0 8px;
  }

  p {
    color: var(--color-complement-text);
    line-height: 1.6;
    margin: 0 0 12px;
  }

  &-card {
    background-color: var(--color-component-background);
    border: solid 1px var(--color-border);
    border-radius: 8px;
    padding: 16px;
    max-width: 980px;
  }
}
</style>

