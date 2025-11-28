<script lang="ts">
import Input from '$lib/components/ui/Input.svelte';
import Button from '$lib/components/ui/Button.svelte';
import Form from '$lib/components/ui/Form.svelte';
import { login } from '$lib/api/auth';
import { goto } from '$app/navigation';

let email = $state('');
let password = $state('');
let isLoading = $state(false);
let errorMessage = $state('');

async function handleSubmit() {
    // 清除之前的错误信息
    errorMessage = '';

    // 表单验证
    if (!email || !password) {
        errorMessage = '请输入用户名和密码';
        return;
    }

    isLoading = true;

    try {
        const response = await login({
            usernameOrEmail: email,
            password
        });

        // 保存 token 到 localStorage
        if (response.data?.access_token) {
            localStorage.setItem('token', response.data.access_token);
        }

        // 保存用户信息（可选）
        if (response.data?.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        console.log('登录成功:', response);

        // 跳转到首页或管理页面
        goto('/admin');
    } catch (error: any) {
        console.error('登录失败:', error);
        errorMessage = error.message || '登录失败，请检查用户名和密码';
    } finally {
        isLoading = false;
    }
}
</script>

<div class="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8 bg-white p-8 border border-slate-200">
		<div class="text-center">
			<h2 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">
				欢迎回来 👏
			</h2>
			<p class="mt-2 text-sm text-slate-600">
                请输入您的账号密码后点击登录，即可开始使用工作台！
			</p>
		</div>

		{#if errorMessage}
			<div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
				{errorMessage}
			</div>
		{/if}

		<Form onsubmit={handleSubmit}>
			<div class="space-y-4">
				<Input
					id="email"
					label="用户名或邮箱"
					type="email"
					placeholder="you@example.com"
					bind:value={email}
					required
					autocomplete="email"
				/>

				<div class="space-y-1">
					<Input
						id="password"
						label="密码"
						type="password"
						placeholder="••••••••"
						bind:value={password}
						required
						autocomplete="current-password"
					/>
				</div>
			</div>

			<Button type="submit" class="w-full" loading={isLoading}>
				登录
			</Button>
		</Form>

		<div class="text-center text-sm">
			<span class="text-slate-600">没有账号？</span>
			<a
				href="/auth/register"
				class="font-medium text-indigo-600 hover:text-indigo-500 ml-1"
			>
				立即注册
			</a>
		</div>
	</div>
</div>