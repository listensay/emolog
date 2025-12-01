<script lang="ts">
import { auth } from '$lib/stores/auth';
import { goto } from '$app/navigation';
import { toast } from '$lib/stores/toast';
import Button from '$lib/components/ui/Button.svelte';

const authState = $derived($auth);

function handleLogout() {
	auth.logout();
	toast.info('已退出登录');
	goto('/auth/login');
}
</script>

<div class="p-8">
	<div class="max-w-4xl mx-auto">
		<div class="bg-white rounded-lg shadow-lg p-6">
			<div class="flex items-center justify-between mb-6">
				<h1 class="text-3xl font-bold text-slate-900">后台管理</h1>
				<Button variant="outline" onclick={handleLogout}>退出登录</Button>
			</div>

			{#if authState.user}
				<div class="bg-slate-50 rounded-lg p-4">
					<h2 class="text-lg font-semibold text-slate-700 mb-2">用户信息</h2>
					<div class="space-y-2 text-sm">
						<p><span class="font-medium">用户名:</span> {authState.user.username}</p>
						<p><span class="font-medium">邮箱:</span> {authState.user.email}</p>
						<p><span class="font-medium">ID:</span> {authState.user.id}</p>
					</div>
				</div>
			{/if}

			<div class="mt-6">
				<p class="text-slate-600">欢迎来到后台管理系统!</p>
			</div>
		</div>
	</div>
</div>
