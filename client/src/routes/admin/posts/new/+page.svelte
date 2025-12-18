<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import TiptapEditor from '$lib/components/TiptapEditor.svelte';
	import ImagePicker from '$lib/components/ImagePicker.svelte';
	import { goto } from '$app/navigation';
	import { toast } from '$lib/stores/toast';
	import { createPost } from '$lib/api/post';
	import { getAllCategories, CategoryType, type Category } from '$lib/api/category';
	import { getAllTags, createTag, type Tag } from '$lib/api/tag';
	import { auth } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	let title = $state('');
	let description = $state('');
	let content = $state('');
	let categoryId = $state('');
	let coverImage = $state('');
	let isLoading = $state(false);
	let categories = $state<Category[]>([]);
	let tags = $state<Tag[]>([]);
	let selectedTagIds = $state<number[]>([]);
	let newTagName = $state('');
	let isCreatingTag = $state(false);
	let showImagePicker = $state(false);

	onMount(async () => {
		try {
			const [categoryResponse, tagResponse] = await Promise.all([
				getAllCategories(CategoryType.POST),
				getAllTags()
			]);
			categories = categoryResponse.data;
			tags = tagResponse.data;
			if (categories.length > 0) {
				categoryId = categories[0].id.toString();
			}
		} catch (error) {
			console.error('加载数据失败', error);
		}
	});

	function toggleTag(tagId: number) {
		if (selectedTagIds.includes(tagId)) {
			selectedTagIds = selectedTagIds.filter((id) => id !== tagId);
		} else {
			selectedTagIds = [...selectedTagIds, tagId];
		}
	}

	async function handleCreateTag() {
		if (!newTagName.trim()) {
			toast.warning('请输入标签名称');
			return;
		}

		isCreatingTag = true;
		try {
			const response = await createTag({ name: newTagName.trim() });
			tags = [...tags, response.data];
			selectedTagIds = [...selectedTagIds, response.data.id];
			newTagName = '';
			toast.success('标签创建成功');
		} catch (error: any) {
			toast.error(error.message || '创建标签失败');
		} finally {
			isCreatingTag = false;
		}
	}

	function handleCoverSelect(url: string) {
		coverImage = url;
	}

	function removeCover() {
		coverImage = '';
	}

	async function handleSubmit() {
		if (!title.trim()) {
			toast.warning('请输入文章标题');
			return;
		}

		if (!content.trim()) {
			toast.warning('请输入文章内容');
			return;
		}

		if (!$auth.user?.id) {
			toast.error('请先登录');
			goto('/auth/login');
			return;
		}

		isLoading = true;

		try {
			await createPost({
				title: title.trim(),
				content,
				cover: coverImage || undefined,
				description: description.trim() || undefined,
				authorId: $auth.user?.id || 0,
				categoryId: parseInt(categoryId) || 1,
				tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined
			});

			toast.success('文章创建成功!');
			goto('/admin/posts');
		} catch (error) {
			toast.error('创建失败,请重试');
			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	function handleCancel() {
		if (title || content) {
			if (confirm('确定要放弃编辑吗?未保存的内容将丢失。')) {
				goto('/admin/posts');
			}
		} else {
			goto('/admin/posts');
		}
	}
</script>

<div class="max-w-5xl mx-auto space-y-6">
	<!-- 页面标题 -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-slate-900">新建文章</h1>
			<p class="text-sm text-slate-500 mt-1">创建一篇新的文章</p>
		</div>
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

	<!-- 编辑表单 -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- 主编辑区 -->
		<div class="lg:col-span-2 space-y-6">
			<!-- 基本信息 -->
			<div class="bg-white rounded-xl  border border-slate-200 p-6 space-y-4">
				<h2 class="text-lg font-semibold text-slate-900">基本信息</h2>

				<Input
					id="title"
					label="文章标题"
					bind:value={title}
					placeholder="请输入文章标题..."
					required
				/>

				<div>
					<label for="description" class="block text-sm font-medium text-slate-700 mb-2">
						文章描述
					</label>
					<textarea
						id="description"
						bind:value={description}
						placeholder="简要描述文章内容..."
						rows="3"
						class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
					></textarea>
					<p class="text-xs text-slate-500 mt-1">这将显示在文章列表中</p>
				</div>
			</div>

			<!-- 内容编辑 -->
			<div class="bg-white rounded-xl  border border-slate-200 p-6 space-y-4">
				<h2 class="text-lg font-semibold text-slate-900">文章内容</h2>
				<TiptapEditor
					bind:content
					class="text-base"
				/>
				<p class="text-xs text-slate-500">
					快捷键: Ctrl+B(粗体) | Ctrl+I(斜体) | Ctrl+U(下划线)
				</p>
			</div>
		</div>

		<!-- 侧边栏设置 -->
		<div class="space-y-6">
			<!-- 发布设置 -->
			<div class="bg-white rounded-xl  border border-slate-200 p-6 space-y-4">
				<h3 class="text-lg font-semibold text-slate-900">发布设置</h3>

				<div>
					<label for="categoryId" class="block text-sm font-medium text-slate-700 mb-2">
						分类
					</label>
					<select
						id="categoryId"
						bind:value={categoryId}
						class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
					>
						{#if categories.length === 0}
							<option value="">加载中...</option>
						{:else}
							{#each categories as category}
								<option value={category.id.toString()}>{category.name}</option>
							{/each}
						{/if}
					</select>
				</div>

				<!-- 标签选择 -->
				<div>
					<label class="block text-sm font-medium text-slate-700 mb-2">标签</label>
					<div class="flex flex-wrap gap-2 mb-3">
						{#each tags as tag (tag.id)}
							<button
								type="button"
								onclick={() => toggleTag(tag.id)}
								class="px-3 py-1 text-sm rounded-full transition-colors {selectedTagIds.includes(
									tag.id
								)
									? 'bg-emerald-600 text-white'
									: 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
							>
								{tag.name}
							</button>
						{/each}
						{#if tags.length === 0}
							<span class="text-sm text-slate-400">暂无标签</span>
						{/if}
					</div>
					<div class="flex gap-2">
						<input
							type="text"
							bind:value={newTagName}
							placeholder="新建标签..."
							class="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
							onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateTag())}
						/>
						<Button
							variant="outline"
							onclick={handleCreateTag}
							loading={isCreatingTag}
							class="text-sm px-3 py-1.5"
						>
							添加
						</Button>
					</div>
				</div>

				<div class="pt-4 border-t border-slate-200 space-y-2">
					<Button
						type="button"
						onclick={handleSubmit}
						loading={isLoading}
						class="w-full"
					>
						发布文章
					</Button>
					<Button variant="outline" onclick={handleCancel} class="w-full">
						保存草稿
					</Button>
					<Button variant="outline" onclick={handleCancel} class="w-full">
						取消
					</Button>
				</div>
			</div>

			<!-- 封面图片 -->
			<div class="bg-white rounded-xl  border border-slate-200 p-6 space-y-4">
				<h3 class="text-lg font-semibold text-slate-900">封面图片</h3>

				{#if coverImage}
					<div class="relative rounded-lg overflow-hidden border border-slate-200">
						<img src={coverImage} alt="封面预览" class="w-full h-40 object-cover" />
						<button
							type="button"
							onclick={removeCover}
							class="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
							title="移除封面"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
							</svg>
						</button>
					</div>
					<Button variant="outline" onclick={() => (showImagePicker = true)} class="w-full">
						更换封面
					</Button>
				{:else}
					<button
						type="button"
						onclick={() => (showImagePicker = true)}
						class="w-full border-2 border-dashed border-slate-300 rounded-lg p-8 text-center text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-colors cursor-pointer"
					>
						<svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
							></path>
						</svg>
						<p class="text-sm">点击选择封面图片</p>
					</button>
				{/if}
			</div>

			<!-- 文章统计 -->
			<div class="bg-white rounded-xl  border border-slate-200 p-6 space-y-4">
				<h3 class="text-lg font-semibold text-slate-900">文章统计</h3>

				<div class="space-y-2 text-sm">
					<div class="flex justify-between">
						<span class="text-slate-600">字数</span>
						<span class="font-medium">{content.replace(/<[^>]*>/g, '').length}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-600">预计阅读</span>
						<span class="font-medium">
							{Math.ceil(content.replace(/<[^>]*>/g, '').length / 500)}
							分钟
						</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-600">HTML字节</span>
						<span class="font-medium">{content.length}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- 封面图片选择器 -->
<ImagePicker bind:open={showImagePicker} onSelect={handleCoverSelect} />
