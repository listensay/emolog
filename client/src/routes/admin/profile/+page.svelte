<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import ImagePicker from '$lib/components/ImagePicker.svelte';
	import { toast } from '$lib/stores/toast';
	import { auth } from '$lib/stores/auth';
	import { getCurrentUser, updateProfile, changePassword } from '$lib/api/user';
	import type { User } from '$lib/api/user';
	import { onMount } from 'svelte';

	let user: User | null = $state(null);
	let isLoading = $state(true);
	let isSavingProfile = $state(false);
	let isSavingPassword = $state(false);

	// 基本资料表单
	let nickname = $state('');
	let avatar = $state('');

	// 图片选择器状态
	let imagePickerOpen = $state(false);

	// 修改密码表单
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

	// 表单错误
	let profileErrors = $state({ nickname: '', avatar: '' });
	let passwordErrors = $state({ currentPassword: '', newPassword: '', confirmPassword: '' });

	onMount(async () => {
		await loadUser();
	});

	async function loadUser() {
		isLoading = true;
		try {
			const response = await getCurrentUser();
			user = response.data;
			nickname = user.nickname || '';
			avatar = user.avatar || '';
		} catch (error) {
			toast.error('加载用户资料失败');
			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	async function handleSaveProfile() {
		profileErrors = { nickname: '', avatar: '' };

		isSavingProfile = true;
		try {
			const response = await updateProfile({ nickname, avatar: avatar || undefined });
			user = response.data;

			// 更新 auth store 中的用户信息
			auth.updateUser({
				nickname: user.nickname,
				avatar: user.avatar
			});

			toast.success('资料更新成功');
		} catch (error: any) {
			toast.error(error.message || '更新失败');
		} finally {
			isSavingProfile = false;
		}
	}

	async function handleChangePassword() {
		passwordErrors = { currentPassword: '', newPassword: '', confirmPassword: '' };

		// 验证
		let hasError = false;
		if (!currentPassword) {
			passwordErrors.currentPassword = '请输入当前密码';
			hasError = true;
		}
		if (!newPassword) {
			passwordErrors.newPassword = '请输入新密码';
			hasError = true;
		} else if (newPassword.length < 6) {
			passwordErrors.newPassword = '新密码至少6个字符';
			hasError = true;
		}
		if (!confirmPassword) {
			passwordErrors.confirmPassword = '请确认新密码';
			hasError = true;
		} else if (newPassword !== confirmPassword) {
			passwordErrors.confirmPassword = '两次输入的密码不一致';
			hasError = true;
		}

		if (hasError) return;

		isSavingPassword = true;
		try {
			await changePassword({ currentPassword, newPassword });
			toast.success('密码修改成功');
			// 清空表单
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
		} catch (error: any) {
			toast.error(error.message || '密码修改失败');
		} finally {
			isSavingPassword = false;
		}
	}

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="space-y-6">
	{#if isLoading}
		<div class="bg-white rounded-xl border border-slate-200 p-8">
			<div class="animate-pulse space-y-4">
				<div class="h-20 w-20 bg-slate-200 rounded-full mx-auto"></div>
				<div class="h-4 bg-slate-200 rounded w-1/3 mx-auto"></div>
				<div class="h-4 bg-slate-200 rounded w-1/4 mx-auto"></div>
			</div>
		</div>
	{:else if user}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- 左侧：用户信息卡片 -->
			<div class="lg:col-span-1">
				<div class="bg-white rounded-xl border border-slate-200 p-6">
					<div class="text-center">
						<!-- 头像 -->
						{#if user.avatar}
							<img
								src={user.avatar}
								alt={user.username}
								class="w-24 h-24 rounded-full object-cover mx-auto mb-4"
							/>
						{:else}
							<div class="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
								{user.username.charAt(0).toUpperCase()}
							</div>
						{/if}

						<!-- 用户名 -->
						<h2 class="text-xl font-bold text-slate-900">{user.username}</h2>
						{#if user.nickname}
							<p class="text-slate-500">{user.nickname}</p>
						{/if}

						<!-- 邮箱 -->
						<p class="text-sm text-slate-400 mt-2">{user.email}</p>

						<!-- 状态 -->
						<div class="mt-4">
							<span class="px-3 py-1 text-xs rounded-full {user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
								{user.isActive ? '正常' : '已禁用'}
							</span>
						</div>

						<!-- 注册时间 -->
						<div class="mt-4 pt-4 border-t border-slate-200">
							<p class="text-xs text-slate-400">注册于</p>
							<p class="text-sm text-slate-600">{formatDate(user.createdAt)}</p>
						</div>
					</div>
				</div>
			</div>

			<!-- 右侧：设置表单 -->
			<div class="lg:col-span-2 space-y-6">
				<!-- 基本资料 -->
				<div class="bg-white rounded-xl border border-slate-200 p-6">
					<h3 class="text-lg font-semibold text-slate-900 mb-4">基本资料</h3>

					<div class="space-y-4">
						<div>
							<label class="block text-sm font-medium text-slate-700 mb-1">用户名</label>
							<input
								type="text"
								value={user.username}
								disabled
								class="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
							/>
							<p class="text-xs text-slate-400 mt-1">用户名不可修改</p>
						</div>

						<div>
							<label class="block text-sm font-medium text-slate-700 mb-1">邮箱</label>
							<input
								type="email"
								value={user.email}
								disabled
								class="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
							/>
							<p class="text-xs text-slate-400 mt-1">邮箱不可修改</p>
						</div>

						<Input
							label="昵称"
							bind:value={nickname}
							error={profileErrors.nickname}
							placeholder="请输入昵称"
						/>

						<!-- 头像选择 -->
						<div>
							<label class="block text-sm font-medium text-slate-700 mb-2">头像</label>
							<div class="flex items-center gap-4">
								<!-- 头像预览 -->
								{#if avatar}
									<img
										src={avatar}
										alt="头像预览"
										class="w-16 h-16 rounded-full object-cover border border-slate-200"
									/>
								{:else}
									<div class="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xl font-bold">
										{user?.username.charAt(0).toUpperCase() || 'U'}
									</div>
								{/if}
								<div class="flex flex-col gap-2">
									<Button variant="outline" onclick={() => imagePickerOpen = true}>
										选择图片
									</Button>
									{#if avatar}
										<button
											type="button"
											onclick={() => avatar = ''}
											class="text-sm text-red-600 hover:text-red-700"
										>
											移除头像
										</button>
									{/if}
								</div>
							</div>
						</div>

						<div class="pt-2">
							<Button onclick={handleSaveProfile} loading={isSavingProfile}>
								保存资料
							</Button>
						</div>
					</div>
				</div>

				<!-- 修改密码 -->
				<div class="bg-white rounded-xl border border-slate-200 p-6">
					<h3 class="text-lg font-semibold text-slate-900 mb-4">修改密码</h3>

					<div class="space-y-4">
						<Input
							label="当前密码"
							type="password"
							bind:value={currentPassword}
							error={passwordErrors.currentPassword}
							placeholder="请输入当前密码"
						/>

						<Input
							label="新密码"
							type="password"
							bind:value={newPassword}
							error={passwordErrors.newPassword}
							placeholder="请输入新密码（至少6个字符）"
						/>

						<Input
							label="确认新密码"
							type="password"
							bind:value={confirmPassword}
							error={passwordErrors.confirmPassword}
							placeholder="请再次输入新密码"
						/>

						<div class="pt-2">
							<Button onclick={handleChangePassword} loading={isSavingPassword}>
								修改密码
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- 图片选择器 -->
<ImagePicker
	bind:open={imagePickerOpen}
	onSelect={(url) => {
		avatar = url;
	}}
/>
