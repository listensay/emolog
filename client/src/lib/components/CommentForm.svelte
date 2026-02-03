<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { auth } from '$lib/stores/auth';
	import { X } from '@lucide/svelte';
	import type { Comment } from '$lib/api/comment';

	interface Props {
		postId: number;
		replyTo?: Comment | null;
		onSubmit: (data: { username?: string; email?: string; url?: string; content: string; parentCommentId?: number }) => Promise<void>;
		onCancel?: () => void;
		isSubmitting?: boolean;
	}

	let { postId, replyTo = null, onSubmit, onCancel, isSubmitting = false }: Props = $props();

	let username = $state('');
	let email = $state('');
	let url = $state('');
	let content = $state('');
	let errors = $state({ username: '', email: '', url: '', content: '' });

	// 如果已登录，不需要填写用户名和邮箱
	const isLoggedIn = $derived($auth.isAuthenticated);

	function validateEmail(email: string) {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(email);
	}

	function validateUrl(url: string) {
		if (!url.trim()) return true; // URL 是可选的
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	}

	async function handleSubmit() {
		errors = { username: '', email: '', url: '', content: '' };

		// 验证
		if (!isLoggedIn) {
			if (!username.trim()) {
				errors.username = '请输入昵称';
				return;
			}
			if (!email.trim()) {
				errors.email = '请输入邮箱';
				return;
			}
			if (!validateEmail(email)) {
				errors.email = '邮箱格式不正确';
				return;
			}
			if (url.trim() && !validateUrl(url)) {
				errors.url = '网址格式不正确';
				return;
			}
		}

		if (!content.trim()) {
			errors.content = '请输入评论内容';
			return;
		}

		try {
			await onSubmit({
				username: isLoggedIn ? undefined : username.trim(),
				email: isLoggedIn ? undefined : email.trim(),
				url: isLoggedIn ? undefined : (url.trim() || undefined),
				content: content.trim(),
				parentCommentId: replyTo?.id
			});

			// 清空表单
			content = '';
			if (!isLoggedIn) {
				username = '';
				email = '';
				url = '';
			}
		} catch (error) {
			console.error('提交评论失败:', error);
		}
	}
</script>

<div class="bg-white rounded-xl border border-slate-200 p-6">
	<!-- 标题 -->
	<div class="flex items-center justify-between mb-4">
		<h3 class="text-lg font-semibold text-slate-900">
			{#if replyTo}
				回复 @{replyTo.user?.username || replyTo.username || '匿名用户'}
			{:else}
				发表评论
			{/if}
		</h3>
		{#if replyTo && onCancel}
			<button
				onclick={onCancel}
				class="text-slate-400 hover:text-slate-600 transition-colors"
				title="取消回复"
			>
				<X class="w-5 h-5" />
			</button>
		{/if}
	</div>

	<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
		<!-- 如果未登录，显示用户名和邮箱输入框 -->
		{#if !isLoggedIn}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input
					label="昵称"
					bind:value={username}
					placeholder="请输入昵称"
					error={errors.username}
					required
				/>
				<Input
					label="邮箱"
					type="email"
					bind:value={email}
					placeholder="请输入邮箱（不会公开）"
					error={errors.email}
					required
				/>
			</div>
			<Input
				label="网址"
				type="url"
				bind:value={url}
				placeholder="https://example.com（可选）"
				error={errors.url}
			/>
		{:else}
			<div class="flex items-center gap-2 text-sm text-slate-600">
				<div
					class="w-8 h-8 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-medium"
				>
					{$auth.user?.username?.charAt(0).toUpperCase() || 'U'}
				</div>
				<span>以 <strong>{$auth.user?.username}</strong> 的身份评论</span>
			</div>
		{/if}

		<!-- 评论内容 -->
		<div>
			<label for="comment-content" class="block text-sm font-medium text-slate-700 mb-2">
				评论内容 <span class="text-red-500">*</span>
			</label>
			<textarea
				id="comment-content"
				bind:value={content}
				placeholder={replyTo ? `回复 @${replyTo.user?.username || replyTo.username || '匿名用户'}...` : '说点什么吧...'}
				rows="4"
				class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
				class:border-red-500={errors.content}
			></textarea>
			{#if errors.content}
				<p class="mt-1 text-sm text-red-500">{errors.content}</p>
			{/if}
		</div>

		<!-- 提交按钮 -->
		<div class="flex items-center justify-between">
			<div class="flex gap-2">
				{#if replyTo && onCancel}
					<Button variant="outline" onclick={onCancel} type="button">
						取消
					</Button>
				{/if}
				<Button type="submit" loading={isSubmitting}>
					{replyTo ? '回复' : '发表评论'}
				</Button>
			</div>
		</div>
	</form>
</div>
