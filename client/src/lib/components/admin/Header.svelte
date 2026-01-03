<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { pageTitle, pageSubtitle } from '$lib/stores/admin';
	import { goto } from '$app/navigation';
	import { toast } from '$lib/stores/toast';
	import Button from '$lib/components/ui/Button.svelte';
	import { Bell, LogOut } from '@lucide/svelte';

	const authState = $derived($auth);

	function handleLogout() {
		auth.logout();
		toast.info('已退出登录');
		goto('/auth/login');
	}
</script>

<header class="bg-white border-b border-slate-200 sticky top-0 z-10">
	<div class="px-6 py-4">
		<div class="flex items-center justify-between">
			<!-- 左侧：页面标题 -->
			<div>
				<h2 class="text-2xl font-bold text-slate-900">
					{$pageTitle || '仪表盘'}
				</h2>
				{#if $pageSubtitle}
					<p class="text-sm text-slate-500 mt-1">
						{$pageSubtitle}
					</p>
				{/if}
			</div>

			<!-- 右侧：用户信息 -->
			<div class="flex items-center gap-4">
				<!-- 通知 -->
				<button
					class="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
					title="通知"
				>
					<Bell class="w-6 h-6" />
					<span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
				</button>

				<!-- 用户信息 -->
				{#if authState.user}
					<a href="/admin/profile" class="flex items-center gap-3 pl-4 border-l border-slate-200 hover:opacity-80 transition-opacity">
						<div class="text-right">
							<p class="text-sm font-medium text-slate-900">
								{authState.user.nickname || authState.user.username}
							</p>
							<p class="text-xs text-slate-500">
								{authState.user.email}
							</p>
						</div>
						{#if authState.user.avatar}
							<img
								src={authState.user.avatar}
								alt={authState.user.username}
								class="w-10 h-10 rounded-full object-cover"
							/>
						{:else}
							<div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
								{authState.user.username.charAt(0).toUpperCase()}
							</div>
						{/if}
					</a>
				{/if}

				<!-- 退出按钮 -->
				<Button variant="ghost" onclick={handleLogout} class="text-slate-600">
					<LogOut class="w-5 h-5" />
				</Button>
			</div>
		</div>
	</div>
</header>
