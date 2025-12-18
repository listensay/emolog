<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { goto } from '$app/navigation';
	import { toast } from '$lib/stores/toast';
	import { getPostList, deletePost } from '$lib/api/post';
	import type { Post } from '$lib/api/post';
	import { onMount } from 'svelte';

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

	function handleSelectAll(e: Event) {
		const checked = (e.target as HTMLInputElement).checked;
		if (checked) {
			selectedPosts = filteredPosts.map((p) => p.id);
		} else {
			selectedPosts = [];
		}
	}

	function handleSelectPost(id: number) {
		if (selectedPosts.includes(id)) {
			selectedPosts = selectedPosts.filter((p) => p !== id);
		} else {
			selectedPosts = [...selectedPosts, id];
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

	function getStatusBadge(post: Post) {
		if (post.isDeleted) return { text: '已删除', color: 'bg-red-100 text-red-800' };
		return { text: '已发布', color: 'bg-green-100 text-green-800' };
	}

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('zh-CN');
	}
</script>

<div class="space-y-6">
	<!-- 页面标题 -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-slate-900">文章管理</h1>
			<p class="text-sm text-slate-500 mt-1">管理你的所有文章</p>
		</div>
		<Button onclick={() => goto('/admin/posts/new')}>
			<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 4v16m8-8H4"
				></path>
			</svg>
			新建文章
		</Button>
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
						placeholder="搜索文章标题或作者..."
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
			{#if selectedPosts.length > 0}
				<Button variant="outline" onclick={handleBatchDelete} class="text-red-600 border-red-300">
					删除选中 ({selectedPosts.length})
				</Button>
			{/if}
		</div>
	</div>

	<!-- 文章列表 -->
	<div class="bg-white rounded-xl  border border-slate-200 overflow-hidden">
		<div class="overflow-x-auto">
			{#if isLoading}
				<div class="px-6 py-12 text-center text-slate-500">
					<p>加载中...</p>
				</div>
			{:else if filteredPosts.length === 0}
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
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							></path>
						</svg>
						<p class="text-lg font-medium">暂无文章</p>
						<p class="text-sm mt-1">创建你的第一篇文章吧!</p>
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
									checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
									class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
								/>
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
							>
								标题
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
							>
								状态
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
							>
								数据
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
							>
								作者
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
							>
								创建时间
							</th>
							<th
								class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"
							>
								操作
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-200">
						{#each filteredPosts as post (post.id)}
							<tr class="hover:bg-slate-50 transition-colors">
								<td class="px-6 py-4">
									<input
										type="checkbox"
										checked={selectedPosts.includes(post.id)}
										onchange={() => handleSelectPost(post.id)}
										class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
									/>
								</td>
								<td class="px-6 py-4">
									<div class="text-sm font-medium text-slate-900">{post.title}</div>
									<div class="text-xs text-slate-500 mt-1">{post.description}</div>
								</td>
								<td class="px-6 py-4">
									<span class="px-2 py-1 text-xs rounded-full {getStatusBadge(post).color}">
										{getStatusBadge(post).text}
									</span>
								</td>
								<td class="px-6 py-4">
									<div class="text-xs text-slate-600">
										<div>👁️ {post.views}</div>
										<div>❤️ {post.likes}</div>
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
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>

		<!-- 分页 -->
		{#if !isLoading && filteredPosts.length > 0}
			<div class="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
				<div class="text-sm text-slate-600">
					显示 {filteredPosts.length} / {total} 条结果
				</div>
				<div class="flex gap-2">
					<Button
						variant="outline"
						disabled={currentPage === 1}
						onclick={() => {
							currentPage--;
							loadPosts();
						}}
					>
						上一页
					</Button>
					<Button variant="outline" disabled={currentPage * pageSize >= total} onclick={() => {
						currentPage++;
						loadPosts();
					}}>
						下一页
					</Button>
				</div>
			</div>
		{/if}
	</div>
</div>
