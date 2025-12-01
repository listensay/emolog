<script lang="ts">
import Button from '$lib/components/ui/Button.svelte';
import Input from '$lib/components/ui/Input.svelte';
import { goto } from '$app/navigation';
import { toast } from '$lib/stores/toast';
import { page } from '$app/state';

const postId = $derived(page.params.id);

// 模拟从后台获取文章数据
let title = $state('SvelteKit 5 新特性详解');
let category = $state('技术');
let tags = $state('Svelte, Web');
let content = $state(`# SvelteKit 5 新特性详解

SvelteKit 5 带来了许多令人兴奋的新特性...

## 主要特性

1. **Runes**: 全新的响应式系统
2. **Snippets**: 可复用的模板片段
3. **性能优化**: 更快的构建和运行时性能

## 总结

SvelteKit 5 是一个重大更新,为开发者提供了更好的开发体验。`);
let status = $state('published');
let coverImage = $state('https://picsum.photos/800/400');
let isLoading = $state(false);

async function handleSubmit() {
	if (!title.trim()) {
		toast.warning('请输入文章标题');
		return;
	}

	if (!content.trim()) {
		toast.warning('请输入文章内容');
		return;
	}

	isLoading = true;

	try {
		// 模拟保存
		await new Promise((resolve) => setTimeout(resolve, 1000));

		toast.success('文章保存成功!');
		goto('/admin/posts');
	} catch (error) {
		toast.error('保存失败,请重试');
	} finally {
		isLoading = false;
	}
}

function handleCancel() {
	goto('/admin/posts');
}

function handleDelete() {
	if (confirm('确定要删除这篇文章吗?此操作不可恢复。')) {
		toast.success('文章已删除');
		goto('/admin/posts');
	}
}
</script>

<div class="max-w-5xl mx-auto space-y-6">
	<!-- 页面标题 -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-slate-900">编辑文章</h1>
			<p class="text-sm text-slate-500 mt-1">文章ID: {postId}</p>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" onclick={handleDelete} class="text-red-600 border-red-300">
				删除文章
			</Button>
			<Button variant="ghost" onclick={handleCancel}>
				<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 19l-7-7m0 0l7-7m-7 7h18"
					></path>
				</svg>
				返回
			</Button>
		</div>
	</div>

	<!-- 编辑表单 -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- 主编辑区 -->
		<div class="lg:col-span-2 space-y-6">
			<!-- 基本信息 -->
			<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
				<h2 class="text-lg font-semibold text-slate-900">基本信息</h2>

				<Input
					id="title"
					label="文章标题"
					bind:value={title}
					placeholder="请输入文章标题..."
					required
				/>

				<div>
					<label class="block text-sm font-medium text-slate-700 mb-2">文章内容</label>
					<textarea
						bind:value={content}
						placeholder="开始写作..."
						rows="20"
						class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-mono text-sm"
					></textarea>
				</div>
			</div>
		</div>

		<!-- 侧边栏设置 -->
		<div class="space-y-6">
			<!-- 发布设置 -->
			<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
				<h3 class="text-lg font-semibold text-slate-900">发布设置</h3>

				<div>
					<label class="block text-sm font-medium text-slate-700 mb-2">状态</label>
					<select
						bind:value={status}
						class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
					>
						<option value="draft">草稿</option>
						<option value="published">已发布</option>
						<option value="pending">待审核</option>
					</select>
				</div>

				<div class="pt-4 border-t border-slate-200 space-y-2">
					<Button
						type="button"
						onclick={handleSubmit}
						loading={isLoading}
						class="w-full"
					>
						保存修改
					</Button>
					<Button variant="outline" onclick={handleCancel} class="w-full">
						取消
					</Button>
				</div>
			</div>

			<!-- 分类和标签 -->
			<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
				<h3 class="text-lg font-semibold text-slate-900">分类和标签</h3>

				<Input
					id="category"
					label="分类"
					bind:value={category}
					placeholder="例如: 技术"
				/>

				<div>
					<label for="tags" class="block text-sm font-medium text-slate-700 mb-2">
						标签
					</label>
					<input
						id="tags"
						type="text"
						bind:value={tags}
						placeholder="多个标签用逗号分隔"
						class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
					/>
					<p class="text-xs text-slate-500 mt-1">例如: JavaScript, Web, 前端</p>
				</div>
			</div>

			<!-- 封面图片 -->
			<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
				<h3 class="text-lg font-semibold text-slate-900">封面图片</h3>

				<Input
					id="coverImage"
					label="图片URL"
					bind:value={coverImage}
					placeholder="https://example.com/image.jpg"
				/>

				{#if coverImage}
					<div class="rounded-lg overflow-hidden border border-slate-200">
						<img src={coverImage} alt="封面预览" class="w-full h-40 object-cover" />
					</div>
				{:else}
					<div
						class="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center text-slate-400"
					>
						<svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
							></path>
						</svg>
						<p class="text-sm">暂无封面图片</p>
					</div>
				{/if}
			</div>

			<!-- 文章统计 -->
			<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
				<h3 class="text-lg font-semibold text-slate-900">文章统计</h3>

				<div class="space-y-2 text-sm">
					<div class="flex justify-between">
						<span class="text-slate-600">字数</span>
						<span class="font-medium">{content.length}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-600">预计阅读</span>
						<span class="font-medium">{Math.ceil(content.length / 500)} 分钟</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-600">浏览量</span>
						<span class="font-medium">1,234</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-600">评论数</span>
						<span class="font-medium">45</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
