<script lang="ts">
	import type { Post } from '$lib/api/post';
	import { User, Calendar, Eye, Heart, MessageCircle } from '@lucide/svelte';

	interface Props {
		post: Post;
	}

	let { post }: Props = $props();

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

{#if post.cover}
	<!-- 海报样式：有封面 -->
	<a href="/posts/{post.id}" class="block h-72 relative rounded-xl overflow-hidden">
		<!-- 背景图片 -->
		<img src={post.cover} alt={post.title} class="w-full object-cover" />
		<!-- 渐变遮罩 -->
		<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
		<!-- 内容 -->
		<div class="absolute inset-0 p-5 flex flex-col justify-end">
			<!-- 标签 -->
			{#if post.tags && post.tags.length > 0}
				<div class="flex flex-wrap gap-2 mb-3">
					{#each post.tags.slice(0, 3) as tag}
						<span class="px-2 py-0.5 text-xs font-medium bg-white/20 text-white backdrop-blur-sm rounded-full">
							{tag.name}
						</span>
					{/each}
				</div>
			{/if}

			<!-- 标题 -->
			<h2 class="text-xl font-bold text-white mb-2 line-clamp-2">
				{post.title}
			</h2>

			<!-- 描述 -->
			{#if post.description}
				<p class="text-white/80 text-sm mb-3 line-clamp-2">
					{post.description}
				</p>
			{/if}

			<!-- 元信息 -->
			<div class="flex items-center justify-between text-xs text-white/70">
				<div class="flex items-center gap-3">
					{#if post.author}
						<span class="flex items-center gap-1">
							<User class="w-4 h-4" />
							{post.author.nickname || post.author.username}
						</span>
					{/if}
					<span class="flex items-center gap-1">
						<Calendar class="w-4 h-4" />
						{formatDate(post.createdAt)}
					</span>
				</div>

				<div class="flex items-center gap-3">
					<span class="flex items-center gap-1">
						<Eye class="w-4 h-4" />
						{post.views}
					</span>
					<span class="flex items-center gap-1">
						<MessageCircle class="w-4 h-4" />
						{post.commentCount || 0}
					</span>
					<span class="flex items-center gap-1">
						<Heart class="w-4 h-4" />
						{post.likes}
					</span>
				</div>
			</div>
		</div>
	</a>
{:else}
	<!-- 普通样式：无封面 -->
	<article class="bg-white rounded-xl border border-slate-200 overflow-hidden">
		<div class="p-5">
			<!-- 标签 -->
			{#if post.tags && post.tags.length > 0}
				<div class="flex flex-wrap gap-2 mb-3">
					{#each post.tags.slice(0, 3) as tag}
						<span class="px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-600 rounded-full">
							{tag.name}
						</span>
					{/each}
				</div>
			{/if}

			<!-- 标题 -->
			<h2 class="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
				<a href="/posts/{post.id}">
					{post.title}
				</a>
			</h2>

			<!-- 描述 -->
			{#if post.description}
				<p class="text-slate-600 text-sm mb-4 line-clamp-2">
					{post.description}
				</p>
			{/if}

			<!-- 元信息 -->
			<div class="flex items-center justify-between text-xs text-slate-500">
				<div class="flex items-center gap-3">
					{#if post.author}
						<span class="flex items-center gap-1">
							<User class="w-4 h-4" />
							{post.author.nickname || post.author.username}
						</span>
					{/if}
					<span class="flex items-center gap-1">
						<Calendar class="w-4 h-4" />
						{formatDate(post.createdAt)}
					</span>
				</div>

				<div class="flex items-center gap-3">
					<span class="flex items-center gap-1">
						<Eye class="w-4 h-4" />
						{post.views}
					</span>
					<span class="flex items-center gap-1">
						<MessageCircle class="w-4 h-4" />
						{post.commentCount || 0}
					</span>
					<span class="flex items-center gap-1">
						<Heart class="w-4 h-4" />
						{post.likes}
					</span>
				</div>
			</div>
		</div>
	</article>
{/if}
