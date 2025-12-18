<script lang="ts">
import { auth } from '$lib/stores/auth';

const authState = $derived($auth);

// 模拟数据
const stats = [
	{ label: '总文章', value: '156', icon: '📝', color: 'bg-blue-500', trend: '+12%' },
	{ label: '总访问量', value: '12.5K', icon: '👁️', color: 'bg-green-500', trend: '+8%' },
	{ label: '评论数', value: '892', icon: '💬', color: 'bg-purple-500', trend: '+23%' },
	{ label: '用户数', value: '2,341', icon: '👥', color: 'bg-orange-500', trend: '+5%' }
];

const recentPosts = [
	{ title: 'SvelteKit 5 新特性详解', views: 1234, comments: 45, date: '2024-03-15' },
	{ title: '深入理解 TypeScript', views: 892, comments: 32, date: '2024-03-14' },
	{ title: 'Tailwind CSS 最佳实践', views: 756, comments: 28, date: '2024-03-13' },
	{ title: 'Web 性能优化指南', views: 2103, comments: 67, date: '2024-03-12' }
];
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
			<div class="bg-white rounded-xl p-6  border border-slate-200 hover:shadow-md transition-shadow">
				<div class="flex items-start justify-between">
					<div>
						<p class="text-sm text-slate-600 mb-1">{stat.label}</p>
						<p class="text-3xl font-bold text-slate-900">{stat.value}</p>
						<p class="text-sm text-green-600 mt-2">{stat.trend}</p>
					</div>
					<div class="w-12 h-12 {stat.color} rounded-lg flex items-center justify-center text-2xl">
						{stat.icon}
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- 最近文章 -->
	<div class="bg-white rounded-xl  border border-slate-200">
		<div class="p-6 border-b border-slate-200">
			<h3 class="text-lg font-bold text-slate-900">最近文章</h3>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-slate-50 border-b border-slate-200">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
							标题
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
							浏览量
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
							评论
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
							日期
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-200">
					{#each recentPosts as post}
						<tr class="hover:bg-slate-50 transition-colors">
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm font-medium text-slate-900">{post.title}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-slate-600">{post.views}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-slate-600">{post.comments}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-slate-600">{post.date}</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- 快捷操作 -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<a
			href="/admin/posts"
			class="bg-white rounded-xl p-6  border border-slate-200 hover:shadow-md hover:border-emerald-300 transition-all group"
		>
			<div class="text-3xl mb-3">📝</div>
			<h4 class="text-lg font-bold text-slate-900 mb-2">创建文章</h4>
			<p class="text-sm text-slate-600">开始写一篇新文章</p>
			<div class="mt-4 text-emerald-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
				前往 →
			</div>
		</a>

		<a
			href="/admin/categories"
			class="bg-white rounded-xl p-6  border border-slate-200 hover:shadow-md hover:border-teal-300 transition-all group"
		>
			<div class="text-3xl mb-3">🏷️</div>
			<h4 class="text-lg font-bold text-slate-900 mb-2">分类管理</h4>
			<p class="text-sm text-slate-600">管理文章分类</p>
			<div class="mt-4 text-teal-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
				前往 →
			</div>
		</a>

		<a
			href="/admin/settings"
			class="bg-white rounded-xl p-6  border border-slate-200 hover:shadow-md hover:border-emerald-300 transition-all group"
		>
			<div class="text-3xl mb-3">⚙️</div>
			<h4 class="text-lg font-bold text-slate-900 mb-2">系统设置</h4>
			<p class="text-sm text-slate-600">配置系统参数</p>
			<div class="mt-4 text-emerald-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
				前往 →
			</div>
		</a>
	</div>
</div>
