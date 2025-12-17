<script lang="ts">
	import HomeLayout from '$lib/components/layout/HomeLayout.svelte';
	import PostCard from '$lib/components/home/PostCard.svelte';
	import { getPostList } from '$lib/api/post';
	import type { Post } from '$lib/api/post';
	import { onMount } from 'svelte';

	let posts: Post[] = $state([]);
	let isLoading = $state(true);
	let currentPage = $state(1);
	let pageSize = $state(10);
	let total = $state(0);
	let hasMore = $derived(currentPage * pageSize < total);

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
			console.error('加载文章失败:', error);
		} finally {
			isLoading = false;
		}
	}

	async function loadMore() {
		if (!hasMore || isLoading) return;
		currentPage++;
		isLoading = true;
		try {
			const response = await getPostList(currentPage, pageSize);
			posts = [...posts, ...response.data.list];
		} catch (error) {
			console.error('加载更多文章失败:', error);
			currentPage--;
		} finally {
			isLoading = false;
		}
	}
</script>

<HomeLayout>
	<div class="mx-auto">
		<!-- 页面标题 -->
		<div class="mb-6">
			<h1 class="text-2xl font-bold text-slate-900">最新文章</h1>
		</div>

		<!-- 文章列表 -->
		{#if isLoading && posts.length === 0}
			<!-- 加载骨架屏 -->
			<div class="space-y-4">
				{#each Array(3) as _}
					<div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
						<div class="h-48 bg-slate-200"></div>
						<div class="p-5 space-y-3">
							<div class="h-4 bg-slate-200 rounded w-1/4"></div>
							<div class="h-6 bg-slate-200 rounded w-3/4"></div>
							<div class="h-4 bg-slate-200 rounded w-full"></div>
							<div class="flex justify-between">
								<div class="h-4 bg-slate-200 rounded w-1/3"></div>
								<div class="h-4 bg-slate-200 rounded w-1/4"></div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else if posts.length === 0}
			<!-- 空状态 -->
			<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
				<svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
				</svg>
				<h3 class="text-lg font-medium text-slate-900 mb-1">暂无文章</h3>
				<p class="text-slate-500 text-sm">还没有发布任何文章</p>
			</div>
		{:else}
			<!-- 文章列表 -->
			<div class="space-y-4">
				{#each posts as post (post.id)}
					<PostCard {post} />
				{/each}
			</div>

			<!-- 加载更多 -->
			{#if hasMore}
				<div class="mt-6 text-center">
					<button
						onclick={loadMore}
						disabled={isLoading}
						class="px-6 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if isLoading}
							<span class="flex items-center gap-2">
								<svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								加载中...
							</span>
						{:else}
							加载更多
						{/if}
					</button>
				</div>
			{:else if posts.length > 0}
				<div class="mt-6 text-center text-slate-500 text-sm">
					已经到底啦 ~
				</div>
			{/if}
		{/if}
	</div>
</HomeLayout>
