<script lang="ts">
	import { browser } from '$app/environment';
	import { incrementPostViews, incrementPostLikes } from '$lib/api/post';
	import type { Post } from '$lib/api/post';
	import type { SiteConfig } from '$lib/api/config';
	import { getCommentsByPost, createComment, type Comment } from '$lib/api/comment';
	import HomeLayout from '$lib/components/layout/HomeLayout.svelte';
	import CommentList from '$lib/components/CommentList.svelte';
	import CommentForm from '$lib/components/CommentForm.svelte';
	import { Calendar, Clock, Eye, Heart, MessageCircle } from '@lucide/svelte';
	import { toast } from '$lib/stores/toast';
	import { auth } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	interface Props {
		data: {
			post: Post;
			siteConfig: SiteConfig;
		};
	}

	let { data }: Props = $props();

	let post: Post = $state(data.post);
	let isLiking = $state(false);
	let hasLiked = $state(false);
	let comments: Comment[] = $state([]);
	let commentTotal = $state(0);
	let isLoadingComments = $state(false);
	let isSubmittingComment = $state(false);
	let replyToComment: Comment | null = $state(null);
	let showTopCommentForm = $state(true);

	// 客户端初始化
	$effect(() => {
		if (browser && post) {
			// 增加浏览量
			incrementPostViews(post.id).catch(() => {});
			// 检查是否已点赞
			const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
			hasLiked = likedPosts.includes(post.id);
		}
	});

	onMount(async () => {
		await loadComments();
	});

	async function loadComments() {
		isLoadingComments = true;
		try {
			const response = await getCommentsByPost(post.id, 1, 100);
			comments = response.data.list;
			commentTotal = response.data.total;
		} catch (err) {
			console.error('加载评论失败:', err);
			toast.error('加载评论失败');
		} finally {
			isLoadingComments = false;
		}
	}

	async function handleLike() {
		if (isLiking || hasLiked || !post) return;
		isLiking = true;
		try {
			const response = await incrementPostLikes(post.id);
			post = { ...post, likes: response.data.likes };
			hasLiked = true;
			// 保存已点赞的文章
			const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
			likedPosts.push(post.id);
			localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
		} catch (err) {
			console.error('点赞失败:', err);
		} finally {
			isLiking = false;
		}
	}

	async function handleCommentSubmit(data: {
		username?: string;
		email?: string;
		url?: string;
		content: string;
		parentCommentId?: number;
	}) {
		isSubmittingComment = true;
		try {
			await createComment({
				...data,
				postId: post.id,
				userId: $auth.user?.id
			});
			toast.success('评论发表成功');
			replyToComment = null;
			showTopCommentForm = true;
			await loadComments();
		} catch (err: any) {
			toast.error(err.message || '评论发表失败');
			throw err;
		} finally {
			isSubmittingComment = false;
		}
	}

	function handleReply(comment: Comment) {
		replyToComment = comment;
		showTopCommentForm = false;
		// 不需要滚动，表单会出现在评论下方
	}

	function handleCancelReply() {
		replyToComment = null;
		showTopCommentForm = true;
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
	<title>{post.title} - {data.siteConfig.site_title}</title>
	<meta name="description" content={post.description || post.title} />
	{#if post.tags && post.tags.length > 0}
		<meta name="keywords" content={post.tags.map(t => t.name).join(',')} />
	{/if}
	<!-- Open Graph -->
	<meta property="og:title" content={post.title} />
	<meta property="og:description" content={post.description || post.title} />
	<meta property="og:type" content="article" />
	{#if post.cover}
		<meta property="og:image" content={post.cover} />
	{/if}
</svelte:head>

<HomeLayout showBackButton={true}>
	<!-- 文章详情 -->
	<article class="w-full">
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
			<h1 class="text-2xl md:text-3xl font-bold text-slate-900 mb-4">{post.title}</h1>

			<!-- 元信息 -->
			<div class="flex flex-wrap items-center gap-3 md:gap-4 text-sm text-slate-500">
				<span class="flex items-center gap-1">
					<Calendar class="w-4 h-4" />
					{formatDate(post.createdAt)}
				</span>
				<span class="flex items-center gap-1">
					<Clock class="w-4 h-4" />
					{formatReadingTime(post.content)}
				</span>
				<span class="flex items-center gap-1">
					<Eye class="w-4 h-4" />
					{post.views} 次阅读
				</span>
			</div>
		</header>

		<!-- 文章正文 -->
		<div class="bg-white rounded-xl border border-slate-200 p-4 md:p-8 overflow-hidden">
			<div class="prose max-sm:prose-sm prose-slate prose-emerald prose-headings:text-slate-900 prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-pre:bg-slate-900 max-w-full">
				{@html post.content}
			</div>
		</div>

		<!-- 文章底部信息 -->
		<div class="mt-8 space-y-4">
			<!-- 更新时间 -->
			{#if post.updatedAt !== post.createdAt}
				<div class="text-sm text-slate-400">
					更新于 {formatDate(post.updatedAt)}
				</div>
			{/if}

			<!-- 点赞和评论 -->
			<div class="flex items-center gap-4">
				<!-- 点赞按钮 -->
				<button
					onclick={handleLike}
					disabled={isLiking || hasLiked}
					class="flex items-center gap-2 px-4 py-2 rounded-full transition-all {hasLiked ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500'} disabled:cursor-not-allowed"
				>
					<Heart class="w-5 h-5 {hasLiked ? 'fill-current' : ''}" />
					<span>{hasLiked ? '已点赞' : '点赞'}</span>
					<span class="text-sm">({post.likes})</span>
				</button>

				<!-- 评论数 -->
				<a
					href="#comments"
					class="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
				>
					<MessageCircle class="w-5 h-5" />
					<span>评论</span>
					<span class="text-sm">({commentTotal})</span>
				</a>
			</div>
		</div>

		<!-- 评论区 -->
		<section id="comments" class="mt-12">
			<h2 class="text-2xl font-bold text-slate-900 mb-6">
				评论 ({commentTotal})
			</h2>

			<!-- 顶部评论表单（仅在不回复时显示） -->
			{#if showTopCommentForm}
				<div id="comment-form" class="mb-8">
					<CommentForm
						postId={post.id}
						replyTo={null}
						onSubmit={handleCommentSubmit}
						isSubmitting={isSubmittingComment}
					/>
				</div>
			{/if}

			<!-- 评论列表 -->
			{#if isLoadingComments}
				<div class="text-center py-12 text-slate-400">
					<p>加载评论中...</p>
				</div>
			{:else}
				<CommentList
					comments={comments}
					onReply={handleReply}
					replyToComment={replyToComment}
					onSubmitReply={handleCommentSubmit}
					onCancelReply={handleCancelReply}
					isSubmitting={isSubmittingComment}
				/>
			{/if}
		</section>

	</article>
</HomeLayout>
