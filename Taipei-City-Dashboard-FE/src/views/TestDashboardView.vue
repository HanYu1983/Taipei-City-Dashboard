<!-- Developed by Taipei Urban Intelligence Center 2023-2024 -->
<script setup>
// 這裡主要是放「測試用 UI」的容器頁面
</script>

<template>
	<div class="testdashboard">
		<div class="testdashboard-content">
			<span>test_dashboard</span>
			<h2>測試儀表板</h2>
			<p>這裡可以放你的測式/測試 UI。</p>
		</div>
	</div>
</template>

<style scoped lang="scss">
.testdashboard {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: calc(var(--vh) * 100 - 127px);
	margin: var(--font-m);
	overflow-y: auto;
	text-align: center;

	&-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		span {
			margin-bottom: var(--font-ms);
			font-family: var(--font-icon);
			font-size: 2rem;
		}

		p {
			margin-top: var(--font-s);
			color: var(--color-complement-text);
			font-size: var(--font-s);
		}
	}
}
</style>

