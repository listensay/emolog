<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import ImagePicker from '$lib/components/ImagePicker.svelte';
	import Profile from '$lib/components/layout/Profile.svelte';
	import { toast } from '$lib/stores/toast';
	import { auth } from '$lib/stores/auth';
	import { pageTitle, pageSubtitle } from '$lib/stores/admin';
	import { getCurrentUser, updateProfile, changePassword } from '$lib/api/user';
	import type { User, UserLink } from '$lib/api/user';
	import { onMount } from 'svelte';
	import { Plus, Trash2, GripVertical, Pencil } from '@lucide/svelte';

	$effect(() => {
		pageTitle.set('个人资料');
		pageSubtitle.set('管理个人信息和密码');
	});

	let user: User | null = $state(null);
	let isLoading = $state(true);
	let isSavingProfile = $state(false);
	let isSavingPassword = $state(false);

	// 基本资料表单
	let nickname = $state('');
	let bio = $state('');
	let avatar = $state('');
	let profileBackground = $state('');

	// Links 管理
	let links = $state<UserLink[]>([]);
	let isAddingLink = $state(false);
	let newLink = $state<UserLink>({ order: 0, icon: '', name: '', url: '' });
	let editingLinkIndex = $state<number | null>(null);
	let editingLink = $state<UserLink>({ order: 0, icon: '', name: '', url: '' });

	// 图片选择器状态
	let avatarPickerOpen = $state(false);
	let backgroundPickerOpen = $state(false);
	let linkIconPickerOpen = $state(false);
	let editLinkIconPickerOpen = $state(false);

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
			bio = user.bio || '';
			avatar = user.avatar || '';
			profileBackground = user.profileBackground || '';
			links = user.links || [];
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
			const response = await updateProfile({
				nickname,
				bio: bio || undefined,
				avatar: avatar || undefined,
				profileBackground: profileBackground || undefined,
				links: links.length > 0 ? links : undefined
			});
			user = response.data;

			// 更新 auth store 中的用户信息
			auth.updateUser({
				nickname: user.nickname ?? undefined,
				avatar: user.avatar ?? undefined
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

	async function saveLinks() {
		try {
			await updateProfile({
				nickname,
				bio: bio || undefined,
				avatar: avatar || undefined,
				profileBackground: profileBackground || undefined,
				links: links.length > 0 ? links : undefined
			});
			toast.success('链接已保存');
		} catch (error: any) {
			toast.error(error.message || '保存链接失败');
		}
	}

	function startAddLink() {
		isAddingLink = true;
		newLink = { order: links.length + 1, icon: '', name: '', url: '' };
	}

	async function confirmAddLink() {
		if (!newLink.name.trim()) {
			toast.warning('请输入链接名称');
			return;
		}
		if (!newLink.url.trim()) {
			toast.warning('请输入链接地址');
			return;
		}

		links = [...links, { ...newLink }];
		isAddingLink = false;
		newLink = { order: 0, icon: '', name: '', url: '' };
		await saveLinks();
	}

	function cancelAddLink() {
		isAddingLink = false;
		newLink = { order: 0, icon: '', name: '', url: '' };
	}

	async function removeLink(index: number) {
		links = links.filter((_, i) => i !== index);
		// 重新排序
		links = links.map((link, i) => ({ ...link, order: i + 1 }));
		await saveLinks();
	}

	function startEditLink(index: number) {
		editingLinkIndex = index;
		editingLink = { ...links[index] };
	}

	async function saveEditLink() {
		if (editingLinkIndex === null) return;
		if (!editingLink.name.trim()) {
			toast.warning('请输入链接名称');
			return;
		}
		if (!editingLink.url.trim()) {
			toast.warning('请输入链接地址');
			return;
		}
		links = links.map((link, i) => i === editingLinkIndex ? { ...editingLink } : link);
		editingLinkIndex = null;
		editingLink = { order: 0, icon: '', name: '', url: '' };
		await saveLinks();
	}

	function cancelEditLink() {
		editingLinkIndex = null;
		editingLink = { order: 0, icon: '', name: '', url: '' };
	}
</script>

<div class="space-y-6">
	{#if isLoading}
		<div class="bg-white rounded-xl border border-slate-200 p-8">
			<div class="animate-pulse space-y-4">
				<div class="h-4 bg-slate-200 rounded w-1/3"></div>
				<div class="h-10 bg-slate-200 rounded"></div>
				<div class="h-4 bg-slate-200 rounded w-1/4"></div>
			</div>
		</div>
	{:else if user}
		<div class="space-y-6">
				<!-- 个人资料预览 -->
				<div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
					<Profile
						avatar={avatar || undefined}
						nickname={nickname || user.username}
						bio={bio || undefined}
						profileBackground={profileBackground || undefined}
						{links}
						showMenu={false}
					/>
					<div class="flex justify-center gap-3 p-4">
						<Button variant="outline" onclick={() => avatarPickerOpen = true}>
							更换头像
						</Button>
						<Button variant="outline" onclick={() => backgroundPickerOpen = true}>
							更换背景图
						</Button>
						{#if avatar}
							<button
								type="button"
								onclick={() => avatar = ''}
								class="text-sm text-red-600 hover:text-red-700 px-3"
							>
								移除头像
							</button>
						{/if}
						{#if profileBackground}
							<button
								type="button"
								onclick={() => profileBackground = ''}
								class="text-sm text-red-600 hover:text-red-700 px-3"
							>
								移除背景图
							</button>
						{/if}
					</div>
				</div>

				<!-- 基本资料 -->
				<div class="bg-white rounded-xl border border-slate-200 p-6">
					<h3 class="text-lg font-semibold text-slate-900 mb-4">基本资料</h3>

					<div class="space-y-4">
						<Input
							label="用户名"
							value={user.username}
							disabled
							class="bg-slate-50 text-slate-500 cursor-not-allowed"
						/>
						<p class="text-xs text-slate-400 -mt-3">用户名不可修改</p>

						<Input
							label="邮箱"
							type="email"
							value={user.email}
							disabled
							class="bg-slate-50 text-slate-500 cursor-not-allowed"
						/>
						<p class="text-xs text-slate-400 -mt-3">邮箱不可修改</p>

						<Input
							label="昵称"
							bind:value={nickname}
							error={profileErrors.nickname}
							placeholder="请输入昵称"
						/>

						<Input
							label="个性签名"
							bind:value={bio}
							placeholder="请输入个性签名"
						/>

						<div class="pt-2">
							<Button onclick={handleSaveProfile} loading={isSavingProfile}>
								保存资料
							</Button>
						</div>
					</div>
				</div>

				<!-- Links 管理 -->
				<div class="bg-white rounded-xl border border-slate-200 p-6">
					<h3 class="text-lg font-semibold text-slate-900 mb-4">Links 管理</h3>

					<!-- 添加按钮 -->
					{#if !isAddingLink}
						<Button variant="outline" onclick={startAddLink}>
							<Plus class="w-4 h-4 mr-2" />
							添加链接
						</Button>
					{/if}

					<!-- 添加链接表单 -->
					{#if isAddingLink}
						<div class="border border-slate-200 rounded-lg p-4 mb-4 bg-slate-50">
							<div class="grid grid-cols-12 gap-3 items-end">
								<div class="col-span-1">
									<label class="block text-xs font-medium text-slate-600 mb-1">序号</label>
									<input
										type="number"
										bind:value={newLink.order}
										placeholder="1"
										class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
									/>
								</div>
								<div class="col-span-2">
									<label class="block text-xs font-medium text-slate-600 mb-1">图标</label>
									<div class="flex items-center gap-2">
										{#if newLink.icon}
											<img src={newLink.icon} alt="图标" class="w-8 h-8 rounded object-cover border border-slate-200" />
										{:else}
											<div class="w-8 h-8 rounded bg-slate-200 flex items-center justify-center text-slate-400 text-xs">无</div>
										{/if}
										<Button variant="outline" onclick={() => linkIconPickerOpen = true}>
											选择
										</Button>
									</div>
								</div>
								<div class="col-span-3">
									<label class="block text-xs font-medium text-slate-600 mb-1">名称</label>
									<Input
										bind:value={newLink.name}
										placeholder="GitHub"
									/>
								</div>
								<div class="col-span-4">
									<label class="block text-xs font-medium text-slate-600 mb-1">链接</label>
									<Input
										bind:value={newLink.url}
										placeholder="https://github.com/username"
									/>
								</div>
								<div class="col-span-2 flex gap-2">
									<Button onclick={confirmAddLink}>完成</Button>
									<Button variant="outline" onclick={cancelAddLink}>取消</Button>
								</div>
							</div>
						</div>
					{/if}

					<!-- Links 列表 -->
					{#if links.length > 0}
						<div class="mt-4 space-y-2">
							{#each links as link, index (index)}
								{#if editingLinkIndex === index}
									<!-- 编辑模式 -->
									<div class="border border-emerald-300 rounded-lg p-4 bg-emerald-50">
										<div class="grid grid-cols-12 gap-3 items-end">
											<div class="col-span-1">
												<label class="block text-xs font-medium text-slate-600 mb-1">序号</label>
												<input
													type="number"
													bind:value={editingLink.order}
													placeholder="1"
													class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
												/>
											</div>
											<div class="col-span-2">
												<label class="block text-xs font-medium text-slate-600 mb-1">图标</label>
												<div class="flex items-center gap-2">
													{#if editingLink.icon}
														<img src={editingLink.icon} alt="图标" class="w-8 h-8 rounded object-cover border border-slate-200" />
													{:else}
														<div class="w-8 h-8 rounded bg-slate-200 flex items-center justify-center text-slate-400 text-xs">无</div>
													{/if}
													<Button variant="outline" onclick={() => editLinkIconPickerOpen = true}>
														选择
													</Button>
												</div>
											</div>
											<div class="col-span-3">
												<label class="block text-xs font-medium text-slate-600 mb-1">名称</label>
												<Input
													bind:value={editingLink.name}
													placeholder="GitHub"
												/>
											</div>
											<div class="col-span-4">
												<label class="block text-xs font-medium text-slate-600 mb-1">链接</label>
												<Input
													bind:value={editingLink.url}
													placeholder="https://github.com/username"
												/>
											</div>
											<div class="col-span-2 flex gap-2">
												<Button onclick={saveEditLink}>保存</Button>
												<Button variant="outline" onclick={cancelEditLink}>取消</Button>
											</div>
										</div>
									</div>
								{:else}
									<!-- 显示模式 -->
									<div class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
										<GripVertical class="w-4 h-4 text-slate-400 cursor-move" />
										<span class="w-8 text-center text-sm text-slate-500">{link.order}</span>
										{#if link.icon}
											<img src={link.icon} alt="图标" class="w-8 h-8 rounded object-cover border border-slate-200" />
										{:else}
											<div class="w-8 h-8 rounded bg-slate-200 flex items-center justify-center text-slate-400 text-xs">无</div>
										{/if}
										<span class="w-24 text-sm font-medium text-slate-900">{link.name}</span>
										<span class="flex-1 text-sm text-slate-500 truncate" title={link.url}>{link.url}</span>
										<button
											type="button"
											onclick={() => startEditLink(index)}
											class="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded"
										>
											<Pencil class="w-4 h-4" />
										</button>
										<button
											type="button"
											onclick={() => removeLink(index)}
											class="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
										>
											<Trash2 class="w-4 h-4" />
										</button>
									</div>
								{/if}
							{/each}
						</div>
					{:else if !isAddingLink}
						<p class="mt-4 text-sm text-slate-500">暂无链接，点击上方按钮添加</p>
					{/if}

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
	{/if}
</div>

<!-- 头像选择器 -->
<ImagePicker
	bind:open={avatarPickerOpen}
	onSelect={(url: string) => {
		avatar = url;
	}}
/>

<!-- 背景图选择器 -->
<ImagePicker
	bind:open={backgroundPickerOpen}
	onSelect={(url: string) => {
		profileBackground = url;
	}}
/>

<!-- 链接图标选择器 -->
<ImagePicker
	bind:open={linkIconPickerOpen}
	onSelect={(url: string) => {
		newLink.icon = url;
	}}
/>

<!-- 编辑链接图标选择器 -->
<ImagePicker
	bind:open={editLinkIconPickerOpen}
	onSelect={(url: string) => {
		editingLink.icon = url;
	}}
/>
