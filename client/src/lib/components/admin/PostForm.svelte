<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import TiptapEditor from '$lib/components/TiptapEditor.svelte';
	import ImagePicker from '$lib/components/ImagePicker.svelte';
	import { toast } from '$lib/stores/toast';
	import { createTag, type Tag } from '$lib/api/tag';
	import type { Category } from '$lib/api/category';
	import type { Post } from '$lib/api/post';
	import { ArrowLeft, ImagePlus, X, Eye, Heart } from '@lucide/svelte';

	interface Props {
		mode: 'create' | 'edit';
		post?: Post | null;
		categories: Category[];
		tags: Tag[];
		onSubmit: () => void;
		onCancel: () => void;
		isSubmitting?: boolean;
		isPage?: boolean; // 是否为页面模式
		pageTypeOptions?: Array<{ value: string; label: string }>; // 页面类型选项
		// Bindable values
		title: string;
		description: string;
		content: string;
		categoryId: string;
		coverImage: string;
		selectedTagIds: number[];
		pageType?: string; // 页面类型
	}

	let {
		mode,
		post = null,
		categories,
		tags = $bindable([]),
		onSubmit,
		onCancel,
		isSubmitting = false,
		isPage = false,
		pageTypeOptions = [],
		title = $bindable(''),
		description = $bindable(''),
		content = $bindable(''),
		categoryId = $bindable(''),
		coverImage = $bindable(''),
		selectedTagIds = $bindable([]),
		pageType = $bindable('')
	}: Props = $props();

	let newTagName = $state('');
	let isCreatingTag = $state(false);
	let showImagePicker = $state(false);

	const pageTitle = $derived(
		isPage
			? mode === 'create'
				? '新建页面'
				: '编辑页面'
			: mode === 'create'
				? '新建文章'
				: '编辑文章'
	);
	const pageSubtitle = $derived(
		isPage
			? mode === 'create'
				? '创建一个新的页面'
				: '编辑你的页面'
			: mode === 'create'
				? '创建一篇新的文章'
				: '编辑你的文章'
	);
	const submitButtonText = $derived(
		isPage
			? mode === 'create'
				? '发布页面'
				: '更新页面'
			: mode === 'create'
				? '发布文章'
				: '更新文章'
	);

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
</script>

<div class="space-y-6">
	<div>
		<Button variant="ghost" onclick={onCancel}>
			<ArrowLeft class="w-5 h-5 mr-2" />
			返回
		</Button>
	</div>

	<!-- 编辑表单 -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- 主编辑区 -->
		<div class="lg:col-span-2 space-y-6">
			<!-- 基本信息 -->
			<div class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
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
			<div class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
				<h2 class="text-lg font-semibold text-slate-900">文章内容</h2>
				<TiptapEditor bind:content class="text-base" />
				<p class="text-xs text-slate-500">
					快捷键: Ctrl+B(粗体) | Ctrl+I(斜体) | Ctrl+U(下划线)
				</p>
			</div>
		</div>

		<!-- 侧边栏设置 -->
		<div class="space-y-6">
			<!-- 发布设置 -->
			<div class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
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
						<Input
							bind:value={newTagName}
							placeholder="新建标签..."
							class="flex-1 text-sm"
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

				<!-- 页面类型选择（仅页面模式） -->
				{#if isPage && pageTypeOptions.length > 0}
					<div>
						<label for="pageType" class="block text-sm font-medium text-slate-700 mb-2">
							页面类型 <span class="text-red-500">*</span>
						</label>
						<select
							id="pageType"
							bind:value={pageType}
							class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
						>
							{#each pageTypeOptions as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
						<p class="text-xs text-slate-500 mt-1">选择页面的类型，不同类型的页面可以有不同的展示方式</p>
					</div>
				{/if}

				<div class="pt-4 border-t border-slate-200 space-y-2">
					<Button type="button" onclick={onSubmit} loading={isSubmitting} class="w-full">
						{submitButtonText}
					</Button>
					{#if mode === 'create'}
						<Button variant="outline" onclick={onCancel} class="w-full"> 保存草稿 </Button>
					{/if}
					<Button variant="outline" onclick={onCancel} class="w-full"> 取消 </Button>
				</div>
			</div>

			<!-- 文章信息（仅编辑模式） -->
			{#if mode === 'edit' && post}
				<div class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
					<h3 class="text-lg font-semibold text-slate-900">文章信息</h3>

					<div class="space-y-3 text-sm">
						<div class="flex justify-between items-center">
							<span class="text-slate-600">浏览次数</span>
							<span class="font-medium flex items-center gap-1">
								<Eye class="w-4 h-4" />
								{post.views}
							</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-slate-600">点赞数</span>
							<span class="font-medium flex items-center gap-1">
								<Heart class="w-4 h-4" />
								{post.likes}
							</span>
						</div>
						<div class="flex justify-between">
							<span class="text-slate-600">创建时间</span>
							<span class="font-medium"
								>{new Date(post.createdAt).toLocaleDateString('zh-CN')}</span
							>
						</div>
						<div class="flex justify-between">
							<span class="text-slate-600">最后修改</span>
							<span class="font-medium"
								>{new Date(post.updatedAt).toLocaleDateString('zh-CN')}</span
							>
						</div>
					</div>
				</div>
			{/if}

			<!-- 封面图片 -->
			<div class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
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
							<X class="w-4 h-4" />
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
						<ImagePlus class="w-12 h-12 mx-auto mb-2" />
						<p class="text-sm">点击选择封面图片</p>
					</button>
				{/if}
			</div>

			<!-- 文章统计 -->
			<div class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
				<h3 class="text-lg font-semibold text-slate-900">文章统计</h3>
				<div class="space-y-2 text-sm">
					<div class="flex justify-between">
						<span class="text-slate-600">字数</span>
						<span class="font-medium">{content.replace(/<[^>]*>/g, '').length}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- 封面图片选择器 -->
<ImagePicker bind:open={showImagePicker} onSelect={handleCoverSelect} />
