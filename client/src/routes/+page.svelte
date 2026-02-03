<script lang="ts">
	import HomeLayout from '$lib/components/layout/HomeLayout.svelte';
	import PostCard from '$lib/components/home/PostCard.svelte';
	import { getPostList } from '$lib/api/post';
	import type { Post } from '$lib/api/post';
	import type { SiteConfig } from '$lib/api/config';
	import { FileText, Loader2 } from '@lucide/svelte';

	interface Props {
		data: {
			posts: Post[];
			total: number;
			page: number;
			pageSize: number;
			siteConfig: SiteConfig;
		};
	}

	let { data }: Props = $props();

	let posts: Post[] = $state(data.posts);
	let currentPage = $state(data.page);
	let pageSize = $state(data.pageSize);
	let total = $state(data.total);
	let isLoading = $state(false);
	let hasMore = $derived(currentPage * pageSize < total);

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

<svelte:head>
	<title>{data.siteConfig.site_title}</title>
</svelte:head>

<HomeLayout>
	<div class="mx-auto">
		<!-- 文章列表 -->
		{#if posts.length === 0}
			<!-- 空状态 -->
			<div class="bg-white rounded-xl border border-slate-200 p-12 text-center">
				<FileText class="w-16 h-16 text-slate-300 mx-auto mb-4" />
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
								<Loader2 class="h-4 w-4 animate-spin" />
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
