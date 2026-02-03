<script lang="ts">
	import { toast } from '$lib/stores/toast';
	import { getUserList, deleteUser, updateUser } from '$lib/api/user';
	import type { User } from '$lib/api/user';
	import { onMount } from 'svelte';
	import AdminPage from '$lib/components/admin/AdminPage.svelte';
	import AdminTable from '$lib/components/admin/AdminTable.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { pageTitle, pageSubtitle } from '$lib/stores/admin';

	let users: User[] = $state([]);
	let isLoading = $state(false);
	let currentPage = $state(1);
	let pageSize = $state(10);
	let total = $state(0);

	let searchQuery = $state('');
	let selectedUsers = $state<number[]>([]);

	$effect(() => {
		pageTitle.set('用户管理');
		pageSubtitle.set('管理系统用户账户');
	});

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

<AdminPage
	bind:searchQuery
	searchPlaceholder="搜索用户名、邮箱或昵称..."
	{total}
	bind:currentPage
	bind:pageSize
	onBatchDelete={handleBatchDelete}
	selectedCount={selectedUsers.length}
>
	<AdminTable items={filteredUsers} {isLoading} bind:selectedIds={selectedUsers} itemKey="id">
		{#snippet header()}
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				用户信息
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				邮箱
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				状态
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				注册时间
			</th>
			<th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
				操作
			</th>
		{/snippet}

		{#snippet row(user)}
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
				<Badge variant={user.isActive ? 'success' : 'danger'}>
					{user.isActive ? '正常' : '已禁用'}
				</Badge>
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
		{/snippet}
	</AdminTable>
</AdminPage>
