<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from '$lib/stores/toast';
	import { getPostList, deletePost } from '$lib/api/post';
	import type { Post } from '$lib/api/post';
	import { onMount } from 'svelte';
	import { Eye, Heart } from '@lucide/svelte';
	import AdminPage from '$lib/components/admin/AdminPage.svelte';
	import AdminTable from '$lib/components/admin/AdminTable.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';

	let posts: Post[] = $state([]);
	let isLoading = $state(false);
	let currentPage = $state(1);
	let pageSize = $state(10);
	let total = $state(0);

	let searchQuery = $state('');
	let selectedPosts = $state<number[]>([]);

	const filteredPosts = $derived(
		posts.filter((post) => {
			const matchSearch =
				searchQuery === '' ||
				post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(post.author?.username || '').toLowerCase().includes(searchQuery.toLowerCase());
			return matchSearch;
		})
	);

	onMount(async () => {
		await loadPosts();
	});

	async function loadPosts() {
		isLoading = true;
		try {
			const response = await getPostList(currentPage, pageSize);
			posts = response.data.list;
			total = response.data.total;
		} catch (error) {
			toast.error('加载文章失败');
			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	async function handleDelete(id: number) {
		if (confirm('确定要删除这篇文章吗?')) {
			try {
				await deletePost(id);
				posts = posts.filter((p) => p.id !== id);
				toast.success('删除成功');
			} catch (error) {
				toast.error('删除失败');
				console.error(error);
			}
		}
	}

	async function handleBatchDelete() {
		if (selectedPosts.length === 0) {
			toast.warning('请先选择要删除的文章');
			return;
		}
		if (confirm(`确定要删除选中的 ${selectedPosts.length} 篇文章吗?`)) {
			try {
				await Promise.all(selectedPosts.map((id) => deletePost(id)));
				posts = posts.filter((p) => !selectedPosts.includes(p.id));
				selectedPosts = [];
				toast.success('批量删除成功');
			} catch (error) {
				toast.error('删除失败');
				console.error(error);
			}
		}
	}

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('zh-CN');
	}
</script>

<AdminPage
	title="文章管理"
	subtitle="管理你的所有文章"
	createUrl="/admin/posts/new"
	createText="新建文章"
	bind:searchQuery
	searchPlaceholder="搜索文章标题或作者..."
	{total}
	bind:currentPage
	bind:pageSize
	onBatchDelete={handleBatchDelete}
	selectedCount={selectedPosts.length}
>
	<AdminTable items={filteredPosts} {isLoading} bind:selectedIds={selectedPosts} itemKey="id">
		{#snippet header()}
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-1/3">
				标题
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				状态
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				数据
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				作者
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				创建时间
			</th>
			<th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
				操作
			</th>
		{/snippet}

		{#snippet row(post)}
			<td class="px-6 py-4">
				<div class="text-sm font-medium text-slate-900 line-clamp-1" title={post.title}>{post.title}</div>
				<div class="text-xs text-slate-500 mt-1 line-clamp-1" title={post.description}>{post.description}</div>
			</td>
			<td class="px-6 py-4">
				<Badge variant={post.isDeleted ? 'danger' : 'success'}>
					{post.isDeleted ? '已删除' : '已发布'}
				</Badge>
			</td>
			<td class="px-6 py-4">
				<div class="text-xs text-slate-600 flex items-center gap-3">
					<div class="flex items-center gap-1">
						<Eye class="w-3.5 h-3.5" />
						{post.views}
					</div>
					<div class="flex items-center gap-1">
						<Heart class="w-3.5 h-3.5" />
						{post.likes}
					</div>
				</div>
			</td>
			<td class="px-6 py-4">
				<div class="text-sm text-slate-600">{post.author?.username || '未知'}</div>
			</td>
			<td class="px-6 py-4">
				<div class="text-sm text-slate-600">{formatDate(post.createdAt)}</div>
			</td>
			<td class="px-6 py-4 text-right">
				<div class="flex items-center justify-end gap-2">
					<button
						onclick={() => goto(`/admin/posts/${post.id}`)}
						class="text-emerald-600 hover:text-emerald-900 text-sm font-medium"
					>
						编辑
					</button>
					<button
						onclick={() => handleDelete(post.id)}
						class="text-red-600 hover:text-red-900 text-sm font-medium"
					>
						删除
					</button>
				</div>
			</td>
		{/snippet}
	</AdminTable>
</AdminPage>
