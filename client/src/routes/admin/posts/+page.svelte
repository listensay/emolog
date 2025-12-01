<script lang="ts">
import Button from '$lib/components/ui/Button.svelte';
import { goto } from '$app/navigation';
import { toast } from '$lib/stores/toast';

// 模拟文章数据
let posts = $state([
	{
		id: 1,
		title: 'SvelteKit 5 新特性详解',
		category: '技术',
		tags: ['Svelte', 'Web'],
		status: '已发布',
		views: 1234,
		comments: 45,
		author: '张三',
		createdAt: '2024-03-15',
		updatedAt: '2024-03-15'
	},
	{
		id: 2,
		title: '深入理解 TypeScript',
		category: '编程',
		tags: ['TypeScript', 'JavaScript'],
		status: '草稿',
		views: 0,
		comments: 0,
		author: '李四',
		createdAt: '2024-03-14',
		updatedAt: '2024-03-14'
	},
	{
		id: 3,
		title: 'Tailwind CSS 最佳实践',
		category: '前端',
		tags: ['CSS', 'Tailwind'],
		status: '已发布',
		views: 756,
		comments: 28,
		author: '王五',
		createdAt: '2024-03-13',
		updatedAt: '2024-03-13'
	},
	{
		id: 4,
		title: 'Web 性能优化指南',
		category: '技术',
		tags: ['性能', '优化'],
		status: '已发布',
		views: 2103,
		comments: 67,
		author: '赵六',
		createdAt: '2024-03-12',
		updatedAt: '2024-03-12'
	},
	{
		id: 5,
		title: 'React vs Vue 对比分析',
		category: '框架',
		tags: ['React', 'Vue'],
		status: '待审核',
		views: 543,
		comments: 12,
		author: '孙七',
		createdAt: '2024-03-11',
		updatedAt: '2024-03-11'
	}
]);

let searchQuery = $state('');
let selectedStatus = $state('all');
let selectedPosts = $state<number[]>([]);

const filteredPosts = $derived(
	posts.filter((post) => {
		const matchSearch =
			searchQuery === '' ||
			post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			post.author.toLowerCase().includes(searchQuery.toLowerCase());
		const matchStatus = selectedStatus === 'all' || post.status === selectedStatus;
		return matchSearch && matchStatus;
	})
);

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

function handleDelete(id: number) {
	if (confirm('确定要删除这篇文章吗?')) {
		posts = posts.filter((p) => p.id !== id);
		toast.success('删除成功');
	}
}

function handleBatchDelete() {
	if (selectedPosts.length === 0) {
		toast.warning('请先选择要删除的文章');
		return;
	}
	if (confirm(`确定要删除选中的 ${selectedPosts.length} 篇文章吗?`)) {
		posts = posts.filter((p) => !selectedPosts.includes(p.id));
		selectedPosts = [];
		toast.success('批量删除成功');
	}
}

function getStatusColor(status: string) {
	const colors = {
		已发布: 'bg-green-100 text-green-800',
		草稿: 'bg-gray-100 text-gray-800',
		待审核: 'bg-yellow-100 text-yellow-800'
	};
	return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
	<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
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

			<!-- 状态筛选 -->
			<select
				bind:value={selectedStatus}
				class="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
			>
				<option value="all">全部状态</option>
				<option value="已发布">已发布</option>
				<option value="草稿">草稿</option>
				<option value="待审核">待审核</option>
			</select>

			<!-- 批量操作 -->
			{#if selectedPosts.length > 0}
				<Button variant="outline" onclick={handleBatchDelete} class="text-red-600 border-red-300">
					删除选中 ({selectedPosts.length})
				</Button>
			{/if}
		</div>
	</div>

	<!-- 文章列表 -->
	<div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
		<div class="overflow-x-auto">
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
							分类
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
						>
							标签
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
							</td>
							<td class="px-6 py-4">
								<div class="text-sm text-slate-600">{post.category}</div>
							</td>
							<td class="px-6 py-4">
								<div class="flex flex-wrap gap-1">
									{#each post.tags as tag}
										<span class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
											{tag}
										</span>
									{/each}
								</div>
							</td>
							<td class="px-6 py-4">
								<span class="px-2 py-1 text-xs rounded-full {getStatusColor(post.status)}">
									{post.status}
								</span>
							</td>
							<td class="px-6 py-4">
								<div class="text-xs text-slate-600">
									<div>👁️ {post.views}</div>
									<div>💬 {post.comments}</div>
								</div>
							</td>
							<td class="px-6 py-4">
								<div class="text-sm text-slate-600">{post.author}</div>
							</td>
							<td class="px-6 py-4">
								<div class="text-sm text-slate-600">{post.createdAt}</div>
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
					{:else}
						<tr>
							<td colspan="9" class="px-6 py-12 text-center text-slate-500">
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
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- 分页 -->
		<div class="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
			<div class="text-sm text-slate-600">
				显示 {filteredPosts.length} 条结果
			</div>
			<div class="flex gap-2">
				<Button variant="outline" disabled>上一页</Button>
				<Button variant="outline" disabled>下一页</Button>
			</div>
		</div>
	</div>
</div>
