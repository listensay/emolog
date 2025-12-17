<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getPost, incrementPostViews, incrementPostLikes, getPostList } from '$lib/api/post';
	import type { Post } from '$lib/api/post';
	import Author from '$lib/components/ui/Author.svelte';
	import Menu from '$lib/components/ui/Menu.svelte';
	import PostCard from '$lib/components/home/PostCard.svelte';

	let post: Post | null = $state(null);
	let relatedPosts: Post[] = $state([]);
	let isLoading = $state(true);
	let isLiking = $state(false);
	let hasLiked = $state(false);
	let error = $state('');

	const postId = $derived(Number($page.params.id));

	onMount(async () => {
		await loadPost();
		await loadRelatedPosts();
	});

	async function loadPost() {
		isLoading = true;
		error = '';
		try {
			const response = await getPost(postId);
			post = response.data;
			// 增加浏览量
			incrementPostViews(postId).catch(() => {});
			// 检查是否已点赞
			const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
			hasLiked = likedPosts.includes(postId);
		} catch (err: any) {
			error = err.message || '加载文章失败';
			console.error('加载文章失败:', err);
		} finally {
			isLoading = false;
		}
	}

	async function loadRelatedPosts() {
		try {
			const response = await getPostList(1, 4);
			// 过滤掉当前文章
			relatedPosts = response.data.list.filter(p => p.id !== postId).slice(0, 3);
		} catch (err) {
			console.error('加载相关文章失败:', err);
		}
	}

	async function handleLike() {
		if (isLiking || hasLiked || !post) return;
		isLiking = true;
		try {
			const response = await incrementPostLikes(postId);
			post = { ...post, likes: response.data.likes };
			hasLiked = true;
			// 保存已点赞的文章
			const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
			likedPosts.push(postId);
			localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
		} catch (err) {
			console.error('点赞失败:', err);
		} finally {
			isLiking = false;
		}
	}

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function formatReadingTime(content: string) {
		const wordCount = content.replace(/<[^>]*>/g, '').length;
		const minutes = Math.ceil(wordCount / 500);
		return `${minutes} 分钟阅读`;
	}
</script>

<svelte:head>
	{#if post}
		<title>{post.title} - Emolog</title>
		<meta name="description" content={post.description || post.title} />
	{/if}
</svelte:head>

<div class="flex min-h-screen">
	<!-- 侧边栏 -->
	<aside class="sticky top-0 h-screen bg-white w-72 border-r border-gray-200 flex-shrink-0">
		<div class="bg-gradient-to-br from-emerald-400 to-teal-500 p-4 py-6">
			<Author />
		</div>
		<Menu />
	</aside>

	<!-- 主内容区 -->
	<main class="flex-1 bg-slate-50">
		{#if isLoading}
			<!-- 加载骨架屏 -->
			<div class="animate-pulse">
				<div class="h-80 bg-slate-200"></div>
				<div class="max-w-4xl mx-auto p-6 space-y-4">
					<div class="h-8 bg-slate-200 rounded w-3/4"></div>
					<div class="h-4 bg-slate-200 rounded w-1/2"></div>
					<div class="space-y-3 mt-8">
						<div class="h-4 bg-slate-200 rounded"></div>
						<div class="h-4 bg-slate-200 rounded"></div>
						<div class="h-4 bg-slate-200 rounded w-5/6"></div>
					</div>
				</div>
			</div>
		{:else if error}
			<!-- 错误状态 -->
			<div class="flex items-center justify-center h-full">
				<div class="text-center">
					<svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
					</svg>
					<h3 class="text-lg font-medium text-slate-900 mb-1">{error}</h3>
					<button onclick={() => goto('/')} class="mt-4 text-emerald-600 hover:text-emerald-700 font-medium">
						返回首页
					</button>
				</div>
			</div>
		{:else if post}
			<!-- 文章详情 -->
			<article>
				<!-- 封面图 -->
				{#if post.cover}
					<div class="relative h-80 overflow-hidden">
						<img
							src={post.cover}
							alt={post.title}
							class="w-full h-full object-cover"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
					</div>
				{/if}

				<!-- 文章内容 -->
				<div class="max-w-4xl mx-auto px-6 py-8">
					<!-- 返回按钮 -->
					<button
						onclick={() => goto('/')}
						class="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
						</svg>
						返回文章列表
					</button>

					<!-- 标题区 -->
					<header class="mb-8">
						<!-- 标签 -->
						{#if post.tags && post.tags.length > 0}
							<div class="flex flex-wrap gap-2 mb-4">
								{#each post.tags as tag}
									<span class="px-3 py-1 text-sm font-medium bg-emerald-50 text-emerald-600 rounded-full">
										{tag.name}
									</span>
								{/each}
							</div>
						{/if}

						<!-- 标题 -->
						<h1 class="text-3xl font-bold text-slate-900 mb-4">{post.title}</h1>

						<!-- 元信息 -->
						<div class="flex flex-wrap items-center gap-4 text-sm text-slate-500">
							{#if post.author}
								<span class="flex items-center gap-2">
									<div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-medium">
										{post.author.username?.charAt(0).toUpperCase() || 'U'}
									</div>
									{post.author.username}
								</span>
							{/if}
							<span class="flex items-center gap-1">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
								</svg>
								{formatDate(post.createdAt)}
							</span>
							<span class="flex items-center gap-1">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
								</svg>
								{formatReadingTime(post.content)}
							</span>
							<span class="flex items-center gap-1">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
								</svg>
								{post.views} 次阅读
							</span>
						</div>
					</header>

					<!-- 文章正文 -->
					<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
						<div class="prose prose-slate prose-emerald max-w-none prose-headings:text-slate-900 prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-pre:bg-slate-900">
							{@html post.content}
						</div>
					</div>

					<!-- 文章底部操作 -->
					<div class="mt-8 flex items-center justify-between">
						<div class="flex items-center gap-4">
							<!-- 点赞按钮 -->
							<button
								onclick={handleLike}
								disabled={isLiking || hasLiked}
								class="flex items-center gap-2 px-4 py-2 rounded-full transition-all {hasLiked ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500'} disabled:cursor-not-allowed"
							>
								<svg class="w-5 h-5 {hasLiked ? 'fill-current' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
								</svg>
								<span>{hasLiked ? '已点赞' : '点赞'}</span>
								<span class="text-sm">({post.likes})</span>
							</button>

						</div>

						<!-- 更新时间 -->
						{#if post.updatedAt !== post.createdAt}
							<span class="text-sm text-slate-400">
								更新于 {formatDate(post.updatedAt)}
							</span>
						{/if}
					</div>

					<!-- 相关文章 -->
					{#if relatedPosts.length > 0}
						<section class="mt-12">
							<h2 class="text-xl font-bold text-slate-900 mb-6">相关文章</h2>
							<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
								{#each relatedPosts as relatedPost (relatedPost.id)}
									<a
										href="/posts/{relatedPost.id}"
										class="block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
									>
										{#if relatedPost.cover}
											<img
												src={relatedPost.cover}
												alt={relatedPost.title}
												class="w-full h-32 object-cover"
											/>
										{:else}
											<div class="w-full h-32 bg-gradient-to-br from-emerald-400 to-teal-500"></div>
										{/if}
										<div class="p-4">
											<h3 class="font-medium text-slate-900 line-clamp-2 hover:text-emerald-600 transition-colors">
												{relatedPost.title}
											</h3>
											<p class="text-sm text-slate-500 mt-2">{formatDate(relatedPost.createdAt)}</p>
										</div>
									</a>
								{/each}
							</div>
						</section>
					{/if}
				</div>
			</article>
		{/if}
	</main>
</div>

<style>
	/* Prose 样式覆盖 */
	:global(.prose h1) {
		font-size: 1.75rem;
		margin-top: 2rem;
		margin-bottom: 1rem;
	}
	:global(.prose h2) {
		font-size: 1.5rem;
		margin-top: 1.75rem;
		margin-bottom: 0.75rem;
	}
	:global(.prose h3) {
		font-size: 1.25rem;
		margin-top: 1.5rem;
		margin-bottom: 0.5rem;
	}
	:global(.prose p) {
		margin-bottom: 1rem;
		line-height: 1.75;
	}
	:global(.prose ul, .prose ol) {
		margin-bottom: 1rem;
		padding-left: 1.5rem;
	}
	:global(.prose li) {
		margin-bottom: 0.5rem;
	}
	:global(.prose blockquote) {
		border-left: 4px solid #10b981;
		padding-left: 1rem;
		color: #64748b;
		font-style: italic;
	}
	:global(.prose code) {
		background-color: #f1f5f9;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.875rem;
	}
	:global(.prose pre) {
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
	}
	:global(.prose pre code) {
		background-color: transparent;
		padding: 0;
	}
	:global(.prose img) {
		margin: 1.5rem auto;
	}
	:global(.prose table) {
		width: 100%;
		border-collapse: collapse;
		margin: 1.5rem 0;
	}
	:global(.prose th, .prose td) {
		border: 1px solid #e2e8f0;
		padding: 0.75rem;
		text-align: left;
	}
	:global(.prose th) {
		background-color: #f8fafc;
		font-weight: 600;
	}
</style>
