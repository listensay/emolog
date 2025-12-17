<script lang="ts">
	import type { Post } from '$lib/api/post';

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

<article class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
	{#if post.cover}
		<a href="/posts/{post.id}" class="block">
			<img
				src={post.cover}
				alt={post.title}
				class="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
			/>
		</a>
	{/if}

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
			<a href="/posts/{post.id}" class="hover:text-emerald-600 transition-colors">
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
				<!-- 作者 -->
				{#if post.author}
					<span class="flex items-center gap-1">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
						</svg>
						{post.author.username}
					</span>
				{/if}
				<!-- 日期 -->
				<span class="flex items-center gap-1">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
					</svg>
					{formatDate(post.createdAt)}
				</span>
			</div>

			<!-- 统计 -->
			<div class="flex items-center gap-3">
				<span class="flex items-center gap-1">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
					</svg>
					{post.views}
				</span>
				<span class="flex items-center gap-1">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
					</svg>
					{post.likes}
				</span>
			</div>
		</div>
	</div>
</article>
