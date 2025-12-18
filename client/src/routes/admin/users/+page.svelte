<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { toast } from '$lib/stores/toast';
	import { getUserList, deleteUser, updateUser } from '$lib/api/user';
	import type { User } from '$lib/api/user';
	import { onMount } from 'svelte';

	let users: User[] = $state([]);
	let isLoading = $state(false);
	let currentPage = $state(1);
	let pageSize = $state(10);
	let total = $state(0);

	let searchQuery = $state('');
	let selectedUsers = $state<number[]>([]);

	const filteredUsers = $derived(
		users.filter((user) => {
			const matchSearch =
				searchQuery === '' ||
				user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
				user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(user.nickname || '').toLowerCase().includes(searchQuery.toLowerCase());
			return matchSearch;
		})
	);

	onMount(async () => {
		await loadUsers();
	});

	async function loadUsers() {
		isLoading = true;
		try {
			const response = await getUserList(currentPage, pageSize);
			users = response.data.list;
			total = response.data.total;
		} catch (error) {
			toast.error('加载用户列表失败');
			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	function handleSelectAll(e: Event) {
		const checked = (e.target as HTMLInputElement).checked;
		if (checked) {
			selectedUsers = filteredUsers.map((u) => u.id);
		} else {
			selectedUsers = [];
		}
	}

	function handleSelectUser(id: number) {
		if (selectedUsers.includes(id)) {
			selectedUsers = selectedUsers.filter((u) => u !== id);
		} else {
			selectedUsers = [...selectedUsers, id];
		}
	}

	async function handleToggleStatus(user: User) {
		try {
			await updateUser(user.id, { isActive: !user.isActive });
			users = users.map((u) =>
				u.id === user.id ? { ...u, isActive: !u.isActive } : u
			);
			toast.success(user.isActive ? '已禁用用户' : '已启用用户');
		} catch (error) {
			toast.error('操作失败');
			console.error(error);
		}
	}

	async function handleDelete(id: number) {
		if (confirm('确定要删除此用户吗？此操作不可恢复！')) {
			try {
				await deleteUser(id);
				users = users.filter((u) => u.id !== id);
				toast.success('删除成功');
			} catch (error) {
				toast.error('删除失败');
				console.error(error);
			}
		}
	}

	async function handleBatchDelete() {
		if (selectedUsers.length === 0) {
			toast.warning('请先选择要删除的用户');
			return;
		}
		if (confirm(`确定要删除选中的 ${selectedUsers.length} 个用户吗？此操作不可恢复！`)) {
			try {
				await Promise.all(selectedUsers.map((id) => deleteUser(id)));
				users = users.filter((u) => !selectedUsers.includes(u.id));
				selectedUsers = [];
				toast.success('批量删除成功');
			} catch (error) {
				toast.error('删除失败');
				console.error(error);
			}
		}
	}

	function getStatusBadge(user: User) {
		if (user.isActive) return { text: '正常', color: 'bg-green-100 text-green-800' };
		return { text: '已禁用', color: 'bg-red-100 text-red-800' };
	}

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="space-y-6">
	<!-- 页面标题 -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-slate-900">用户管理</h1>
			<p class="text-sm text-slate-500 mt-1">管理系统用户账户</p>
		</div>
	</div>

	<!-- 搜索和筛选 -->
	<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
		<div class="flex flex-col md:flex-row gap-4">
			<!-- 搜索框 -->
			<div class="flex-1">
				<div class="relative">
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="搜索用户名、邮箱或昵称..."
						class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
					/>
					<svg
						class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						></path>
					</svg>
				</div>
			</div>

			<!-- 批量操作 -->
			{#if selectedUsers.length > 0}
				<Button variant="outline" onclick={handleBatchDelete} class="text-red-600 border-red-300">
					删除选中 ({selectedUsers.length})
				</Button>
			{/if}
		</div>
	</div>

	<!-- 用户列表 -->
	<div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
		<div class="overflow-x-auto">
			{#if isLoading}
				<div class="px-6 py-12 text-center text-slate-500">
					<p>加载中...</p>
				</div>
			{:else if filteredUsers.length === 0}
				<div class="px-6 py-12 text-center text-slate-500">
					<div class="flex flex-col items-center">
						<svg
							class="w-16 h-16 text-slate-300 mb-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
							></path>
						</svg>
						<p class="text-lg font-medium">暂无用户</p>
						<p class="text-sm mt-1">还没有注册用户</p>
					</div>
				</div>
			{:else}
				<table class="w-full">
					<thead class="bg-slate-50 border-b border-slate-200">
						<tr>
							<th class="px-6 py-3 text-left">
								<input
									type="checkbox"
									onchange={handleSelectAll}
									checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
									class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
								/>
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
							>
								用户信息
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
							>
								邮箱
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
							>
								状态
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
							>
								注册时间
							</th>
							<th
								class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"
							>
								操作
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-200">
						{#each filteredUsers as user (user.id)}
							<tr class="hover:bg-slate-50 transition-colors">
								<td class="px-6 py-4">
									<input
										type="checkbox"
										checked={selectedUsers.includes(user.id)}
										onchange={() => handleSelectUser(user.id)}
										class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
									/>
								</td>
								<td class="px-6 py-4">
									<div class="flex items-center gap-3">
										{#if user.avatar}
											<img
												src={user.avatar}
												alt={user.username}
												class="w-10 h-10 rounded-full object-cover"
											/>
										{:else}
											<div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-medium">
												{user.username.charAt(0).toUpperCase()}
											</div>
										{/if}
										<div>
											<div class="text-sm font-medium text-slate-900">{user.username}</div>
											{#if user.nickname}
												<div class="text-xs text-slate-500">{user.nickname}</div>
											{/if}
										</div>
									</div>
								</td>
								<td class="px-6 py-4">
									<div class="text-sm text-slate-600">{user.email}</div>
								</td>
								<td class="px-6 py-4">
									<span class="px-2 py-1 text-xs rounded-full {getStatusBadge(user).color}">
										{getStatusBadge(user).text}
									</span>
								</td>
								<td class="px-6 py-4">
									<div class="text-sm text-slate-600">{formatDate(user.createdAt)}</div>
								</td>
								<td class="px-6 py-4 text-right">
									<div class="flex items-center justify-end gap-2">
										<button
											onclick={() => handleToggleStatus(user)}
											class="text-slate-600 hover:text-slate-900 text-sm font-medium"
										>
											{user.isActive ? '禁用' : '启用'}
										</button>
										<button
											onclick={() => handleDelete(user.id)}
											class="text-red-600 hover:text-red-900 text-sm font-medium"
										>
											删除
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>

		<!-- 分页 -->
		{#if !isLoading && filteredUsers.length > 0}
			<div class="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
				<div class="text-sm text-slate-600">
					显示 {filteredUsers.length} / {total} 条结果
				</div>
				<div class="flex gap-2">
					<Button
						variant="outline"
						disabled={currentPage === 1}
						onclick={() => {
							currentPage--;
							loadUsers();
						}}
					>
						上一页
					</Button>
					<Button variant="outline" disabled={currentPage * pageSize >= total} onclick={() => {
						currentPage++;
						loadUsers();
					}}>
						下一页
					</Button>
				</div>
			</div>
		{/if}
	</div>
</div>
