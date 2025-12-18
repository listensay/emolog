<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { toast } from '$lib/stores/toast';
	import { getCommentList, deleteComment } from '$lib/api/comment';
	import type { Comment } from '$lib/api/comment';
	import { onMount } from 'svelte';

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

	function handleSelectAll(e: Event) {
		const checked = (e.target as HTMLInputElement).checked;
		if (checked) {
			selectedComments = filteredComments.map((c) => c.id);
		} else {
			selectedComments = [];
		}
	}

	function handleSelectComment(id: number) {
		if (selectedComments.includes(id)) {
			selectedComments = selectedComments.filter((c) => c !== id);
		} else {
			selectedComments = [...selectedComments, id];
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

	function getStatusBadge(comment: Comment) {
		if (comment.isDeleted) return { text: '已删除', color: 'bg-red-100 text-red-800' };
		return { text: '正常', color: 'bg-green-100 text-green-800' };
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

<div class="space-y-6">
	<!-- 页面标题 -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-slate-900">评论管理</h1>
			<p class="text-sm text-slate-500 mt-1">管理所有用户评论</p>
		</div>
	</div>

	<!-- 搜索和筛选 -->
	<div class="bg-white rounded-xl  border border-slate-200 p-4">
		<div class="flex flex-col md:flex-row gap-4">
			<!-- 搜索框 -->
			<div class="flex-1">
				<div class="relative">
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="搜索评论内容、用户名或邮箱..."
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
			{#if selectedComments.length > 0}
				<Button variant="outline" onclick={handleBatchDelete} class="text-red-600 border-red-300">
					删除选中 ({selectedComments.length})
				</Button>
			{/if}
		</div>
	</div>

	<!-- 评论列表 -->
	<div class="bg-white rounded-xl  border border-slate-200 overflow-hidden">
		<div class="overflow-x-auto">
			{#if isLoading}
				<div class="px-6 py-12 text-center text-slate-500">
					<p>加载中...</p>
				</div>
			{:else if filteredComments.length === 0}
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
								d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
							></path>
						</svg>
						<p class="text-lg font-medium">暂无评论</p>
						<p class="text-sm mt-1">还没有用户发表评论</p>
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
									checked={selectedComments.length === filteredComments.length && filteredComments.length > 0}
									class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
								/>
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
							>
								评论者
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
							>
								评论内容
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
							>
								关联文章
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
							>
								状态
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
							>
								评论时间
							</th>
							<th
								class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"
							>
								操作
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-200">
						{#each filteredComments as comment (comment.id)}
							<tr class="hover:bg-slate-50 transition-colors">
								<td class="px-6 py-4">
									<input
										type="checkbox"
										checked={selectedComments.includes(comment.id)}
										onchange={() => handleSelectComment(comment.id)}
										class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
									/>
								</td>
								<td class="px-6 py-4">
									<div class="text-sm font-medium text-slate-900">
										{comment.username || comment.user?.username || '匿名用户'}
									</div>
									<div class="text-xs text-slate-500 mt-1">{comment.email || '-'}</div>
								</td>
								<td class="px-6 py-4">
									<div class="text-sm text-slate-600 max-w-xs">
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
									<span class="px-2 py-1 text-xs rounded-full {getStatusBadge(comment).color}">
										{getStatusBadge(comment).text}
									</span>
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
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>

		<!-- 分页 -->
		{#if !isLoading && filteredComments.length > 0}
			<div class="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
				<div class="text-sm text-slate-600">
					显示 {filteredComments.length} / {total} 条结果
				</div>
				<div class="flex gap-2">
					<Button
						variant="outline"
						disabled={currentPage === 1}
						onclick={() => {
							currentPage--;
							loadComments();
						}}
					>
						上一页
					</Button>
					<Button variant="outline" disabled={currentPage * pageSize >= total} onclick={() => {
						currentPage++;
						loadComments();
					}}>
						下一页
					</Button>
				</div>
			</div>
		{/if}
	</div>
</div>
