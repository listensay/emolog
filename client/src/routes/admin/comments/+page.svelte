<script lang="ts">
	import { toast } from '$lib/stores/toast';
	import { getCommentList, deleteComment } from '$lib/api/comment';
	import type { Comment } from '$lib/api/comment';
	import { onMount } from 'svelte';
	import AdminPage from '$lib/components/admin/AdminPage.svelte';
	import AdminTable from '$lib/components/admin/AdminTable.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';

	let comments: Comment[] = $state([]);
	let isLoading = $state(false);
	let currentPage = $state(1);
	let pageSize = $state(10);
	let total = $state(0);

	let searchQuery = $state('');
	let selectedComments = $state<number[]>([]);

	const filteredComments = $derived(
		comments.filter((comment) => {
			const matchSearch =
				searchQuery === '' ||
				comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(comment.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
				(comment.email || '').toLowerCase().includes(searchQuery.toLowerCase());
			return matchSearch;
		})
	);

	onMount(async () => {
		await loadComments();
	});

	async function loadComments() {
		isLoading = true;
		try {
			const response = await getCommentList(currentPage, pageSize);
			comments = response.data.list;
			total = response.data.total;
		} catch (error) {
			toast.error('加载评论失败');
			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	async function handleDelete(id: number) {
		if (confirm('确定要删除这条评论吗?')) {
			try {
				await deleteComment(id);
				comments = comments.filter((c) => c.id !== id);
				toast.success('删除成功');
			} catch (error) {
				toast.error('删除失败');
				console.error(error);
			}
		}
	}

	async function handleBatchDelete() {
		if (selectedComments.length === 0) {
			toast.warning('请先选择要删除的评论');
			return;
		}
		if (confirm(`确定要删除选中的 ${selectedComments.length} 条评论吗?`)) {
			try {
				await Promise.all(selectedComments.map((id) => deleteComment(id)));
				comments = comments.filter((c) => !selectedComments.includes(c.id));
				selectedComments = [];
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

	function truncateContent(content: string, maxLength = 50) {
		if (content.length <= maxLength) return content;
		return content.substring(0, maxLength) + '...';
	}
</script>

<AdminPage
	title="评论管理"
	subtitle="管理所有用户评论"
	bind:searchQuery
	searchPlaceholder="搜索评论内容、用户名或邮箱..."
	{total}
	bind:currentPage
	bind:pageSize
	onBatchDelete={handleBatchDelete}
	selectedCount={selectedComments.length}
>
	<AdminTable items={filteredComments} {isLoading} bind:selectedIds={selectedComments} itemKey="id">
		{#snippet header()}
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				评论者
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				评论内容
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				关联文章
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				状态
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				评论时间
			</th>
			<th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
				操作
			</th>
		{/snippet}

		{#snippet row(comment)}
			<td class="px-6 py-4">
				<div class="text-sm font-medium text-slate-900">
					{comment.username || comment.user?.username || '匿名用户'}
				</div>
				<div class="text-xs text-slate-500 mt-1">{comment.email || '-'}</div>
			</td>
			<td class="px-6 py-4">
				<div class="text-sm text-slate-600 max-w-xs" title={comment.content}>
					{truncateContent(comment.content)}
				</div>
				{#if comment.parentCommentId}
					<div class="text-xs text-slate-400 mt-1">
						回复评论 #{comment.parentCommentId}
					</div>
				{/if}
			</td>
			<td class="px-6 py-4">
				<div class="text-sm text-slate-600">
					{#if comment.post}
						<a href="/admin/posts/{comment.post.id}" class="text-emerald-600 hover:text-emerald-900">
							{truncateContent(comment.post.title, 20)}
						</a>
					{:else}
						文章 #{comment.postId}
					{/if}
				</div>
			</td>
			<td class="px-6 py-4">
				<Badge variant={comment.isDeleted ? 'danger' : 'success'}>
					{comment.isDeleted ? '已删除' : '正常'}
				</Badge>
			</td>
			<td class="px-6 py-4">
				<div class="text-sm text-slate-600">{formatDate(comment.createdAt)}</div>
			</td>
			<td class="px-6 py-4 text-right">
				<div class="flex items-center justify-end gap-2">
					<button
						onclick={() => handleDelete(comment.id)}
						class="text-red-600 hover:text-red-900 text-sm font-medium"
					>
						删除
					</button>
				</div>
			</td>
		{/snippet}
	</AdminTable>
</AdminPage>
