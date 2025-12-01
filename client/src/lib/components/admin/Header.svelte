<script lang="ts">
import { auth } from '$lib/stores/auth';
import { goto } from '$app/navigation';
import { toast } from '$lib/stores/toast';
import Button from '$lib/components/ui/Button.svelte';
import type { Snippet } from 'svelte';

const authState = $derived($auth);

let { title, subtitle }: { title?: Snippet; subtitle?: Snippet } = $props();

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
					{#if title}
						{@render title()}
					{:else}
						仪表盘
					{/if}
				</h2>
				<p class="text-sm text-slate-500 mt-1">
					{#if subtitle}
						{@render subtitle()}
					{:else}
						欢迎回来!
					{/if}
				</p>
			</div>

			<!-- 右侧：用户信息 -->
			<div class="flex items-center gap-4">
				<!-- 通知 -->
				<button
					class="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
					title="通知"
				>
					<svg
						class="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
						></path>
					</svg>
					<span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
				</button>

				<!-- 用户信息 -->
				{#if authState.user}
					<div class="flex items-center gap-3 pl-4 border-l border-slate-200">
						<div class="text-right">
							<p class="text-sm font-medium text-slate-900">
								{authState.user.username}
							</p>
							<p class="text-xs text-slate-500">
								{authState.user.email}
							</p>
						</div>
						<div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
							{authState.user.username.charAt(0).toUpperCase()}
						</div>
					</div>
				{/if}

				<!-- 退出按钮 -->
				<Button variant="ghost" onclick={handleLogout} class="text-slate-600">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
						></path>
					</svg>
				</Button>
			</div>
		</div>
	</div>
</header>
