<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { LogOut } from '@lucide/svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { toast } from '$lib/stores/toast';
	import { goto } from '$app/navigation';

	const authState = $derived($auth);

	function handleLogout() {
		auth.logout();
		toast.info('已退出登录');
		goto('/auth/login');
	}
</script>

<div class="p-6 border-b border-slate-200">
	{#if authState.user}
		<div class="flex flex-col items-center text-center">
			<div class="relative mb-4">
				{#if authState.user.avatar}
					<img
						src={authState.user.avatar}
						alt={authState.user.username}
						class="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
					/>
				{:else}
					<div class="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
						{authState.user.username.charAt(0).toUpperCase()}
					</div>
				{/if}
				<span class="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></span>
			</div>

			<h3 class="text-lg font-bold text-slate-900 mb-1">
				{authState.user.nickname || authState.user.username}
			</h3>
			<p class="text-sm text-slate-500 mb-4">
				{authState.user.email}
			</p>

			<div class="flex gap-2 w-full">
				<Button variant="outline" class="flex-1 text-xs" href="/admin/profile">
					个人资料
				</Button>
				<Button variant="ghost" class="px-3" onclick={handleLogout} title="退出登录">
					<LogOut class="w-4 h-4" />
				</Button>
			</div>
		</div>
	{/if}
</div>
