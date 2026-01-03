<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { pageTitle, pageSubtitle } from '$lib/stores/admin';
	import { FileText, Eye, MessageCircle, Users, ArrowRight, FolderOpen, Settings } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { getPostList } from '$lib/api/post';
	import { getCommentList } from '$lib/api/comment';
	import { getUserList } from '$lib/api/user';
	import type { Post } from '$lib/api/post';

	const authState = $derived($auth);

	let stats = $state([
		{ label: '总文章', value: '0', icon: FileText, color: 'bg-blue-500', trend: '-' },
		{ label: '总访问量', value: '-', icon: Eye, color: 'bg-green-500', trend: '-' },
		{ label: '评论数', value: '0', icon: MessageCircle, color: 'bg-purple-500', trend: '-' },
		{ label: '用户数', value: '0', icon: Users, color: 'bg-orange-500', trend: '-' }
	]);

	$effect(() => {
		pageTitle.set('仪表盘');
		pageSubtitle.set('欢迎回到管理后台');
	});

	let recentPosts: Post[] = $state([]);

	onMount(async () => {
		await loadDashboardData();
	});

	async function loadDashboardData() {
		try {
			// 并行加载数据
			const [postsRes, commentsRes, usersRes] = await Promise.all([
				getPostList(1, 4), // 获取最新4篇文章
				getCommentList(1, 1), // 仅获取总数
				getUserList(1, 1) // 仅获取总数
			]);

			// 更新统计数据
			stats[0].value = postsRes.data.total.toString();
			stats[2].value = commentsRes.data.total.toString();
			stats[3].value = usersRes.data.total.toString();

			// 计算总浏览量 (仅作为示例，实际可能需要后端聚合接口)
			// 这里暂时只统计当前页文章的总浏览量，或者留空
			const currentViews = postsRes.data.list.reduce((acc, post) => acc + (post.views || 0), 0);
			stats[1].value = currentViews.toString() + '+';

			// 更新最近文章
			recentPosts = postsRes.data.list;

		} catch (error) {
			console.error('Failed to load dashboard data:', error);
		}
	}

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('zh-CN');
	}
</script>

<div class="space-y-6">
	<!-- 欢迎卡片 -->
	{#if authState.user}
		<div class="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
			<h2 class="text-2xl font-bold mb-2">
				欢迎回来, {authState.user.username}! 👋
			</h2>
			<p class="text-emerald-100">
				今天是个美好的一天,让我们开始工作吧!
			</p>
		</div>
	{/if}

	<!-- 统计卡片 -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		{#each stats as stat}
			<div class="bg-white rounded-xl p-6  border border-slate-200">
				<div class="flex items-start justify-between">
					<div>
						<p class="text-sm text-slate-600 mb-1">{stat.label}</p>
						<p class="text-3xl font-bold text-slate-900">{stat.value}</p>
						<p class="text-sm text-slate-400 mt-2">{stat.trend !== '-' ? stat.trend : '暂无趋势数据'}</p>
					</div>
					<div class="w-12 h-12 {stat.color} rounded-lg flex items-center justify-center text-white">
						<svelte:component this={stat.icon} class="w-6 h-6" />
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- 快捷操作 -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<a
			href="/admin/posts"
			class="bg-white rounded-xl p-6  border border-slate-200 group"
		>
			<div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
				<FileText class="w-6 h-6 text-emerald-600" />
			</div>
			<h4 class="text-lg font-bold text-slate-900 mb-2">创建文章</h4>
			<p class="text-sm text-slate-600">管理与发布内容</p>
			<div class="mt-4 text-emerald-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
				前往 <ArrowRight class="w-4 h-4" />
			</div>
		</a>

		<a
			href="/admin/categories"
			class="bg-white rounded-xl p-6  border border-slate-200 group"
		>
			<div class="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-3">
				<FolderOpen class="w-6 h-6 text-teal-600" />
			</div>
			<h4 class="text-lg font-bold text-slate-900 mb-2">分类管理</h4>
			<p class="text-sm text-slate-600">组织文章结构</p>
			<div class="mt-4 text-teal-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
				前往 <ArrowRight class="w-4 h-4" />
			</div>
		</a>

		<a
			href="/admin/users"
			class="bg-white rounded-xl p-6  border border-slate-200 group"
		>
			<div class="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-3">
				<Users class="w-6 h-6 text-slate-600" />
			</div>
			<h4 class="text-lg font-bold text-slate-900 mb-2">用户管理</h4>
			<p class="text-sm text-slate-600">查看注册用户</p>
			<div class="mt-4 text-emerald-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
				前往 <ArrowRight class="w-4 h-4" />
			</div>
		</a>
	</div>
</div>
