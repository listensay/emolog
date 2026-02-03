<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { toast } from '$lib/stores/toast';
	import { onMount } from 'svelte';
	import { getAllCategories, CategoryType, type Category } from '$lib/api/category';
	import { getImageList, uploadImage, type Image } from '$lib/api/image';
	import { X, Upload, ImageIcon } from '@lucide/svelte';

	let { open = $bindable(false), onSelect = (_url: string) => {} } = $props();

	let categories: Category[] = $state([]);
	let images: Image[] = $state([]);
	let isLoading = $state(false);
	let isUploading = $state(false);
	let currentPage = $state(1);
	let pageSize = $state(12);
	let total = $state(0);

	let selectedCategoryId = $state<number | null>(null);
	let selectedImage = $state<Image | null>(null);

	let fileInput: HTMLInputElement;

	$effect(() => {
		if (open) {
			loadData();
		}
	});

	async function loadData() {
		await Promise.all([loadCategories(), loadImages()]);
	}

	async function loadCategories() {
		try {
			const response = await getAllCategories(CategoryType.IMAGE);
			categories = response.data;
		} catch (error) {
			console.error(error);
		}
	}

	async function loadImages() {
		isLoading = true;
		try {
			const response = await getImageList(currentPage, pageSize, selectedCategoryId);
			images = response.data.list;
			total = response.data.total;
		} catch (error) {
			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	function handleCategorySelect(categoryId: number | null) {
		selectedCategoryId = categoryId;
		currentPage = 1;
		selectedImage = null;
		loadImages();
	}

	async function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const files = input.files;
		if (!files || files.length === 0) return;

		isUploading = true;
		try {
			const result = await uploadImage({
				file: files[0],
				categoryId: selectedCategoryId !== null ? selectedCategoryId : undefined
			});
			toast.success('上传成功');
			selectedImage = result.data;
			await loadImages();
		} catch (error) {
			toast.error('上传失败');
			console.error(error);
		} finally {
			isUploading = false;
			input.value = '';
		}
	}

	function handleImageClick(image: Image) {
		selectedImage = image;
	}

	function handleConfirm() {
		if (selectedImage) {
			onSelect(selectedImage.url);
			open = false;
			selectedImage = null;
		} else {
			toast.warning('请选择一张图片');
		}
	}

	function handleClose() {
		open = false;
		selectedImage = null;
	}

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}
</script>

{#if open}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
			<!-- 头部 -->
			<div class="p-4 border-b border-slate-200 flex items-center justify-between">
				<h3 class="text-lg font-semibold text-slate-900">选择图片</h3>
				<button onclick={handleClose} class="text-slate-400 hover:text-slate-600">
					<X class="w-6 h-6" />
				</button>
			</div>

			<!-- 内容区 -->
			<div class="flex flex-1 overflow-hidden">
				<!-- 左侧分类 -->
				<div class="w-48 border-r border-slate-200 overflow-y-auto p-2">
					<button
						onclick={() => handleCategorySelect(null)}
						class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors {selectedCategoryId ===
						null
							? 'bg-emerald-600 text-white'
							: 'text-slate-700 hover:bg-slate-100'}"
					>
						未分类
					</button>
					{#each categories as category (category.id)}
						<button
							onclick={() => handleCategorySelect(category.id)}
							class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors {selectedCategoryId ===
							category.id
								? 'bg-emerald-600 text-white'
								: 'text-slate-700 hover:bg-slate-100'}"
						>
							{#if category.icon}
								<span class="mr-1">{category.icon}</span>
							{/if}
							{category.name}
						</button>
					{/each}
				</div>

				<!-- 右侧图片 -->
				<div class="flex-1 p-4 overflow-y-auto">
					<!-- 上传按钮 -->
					<div class="mb-4">
						<Button variant="outline" onclick={() => fileInput.click()} loading={isUploading}>
							<Upload class="w-4 h-4 mr-2" />
							上传图片
						</Button>
						<input
							type="file"
							accept="image/*"
							class="hidden"
							bind:this={fileInput}
							onchange={handleFileUpload}
						/>
					</div>

					{#if isLoading}
						<div class="flex items-center justify-center py-12">
							<p class="text-slate-500">加载中...</p>
						</div>
					{:else if images.length === 0}
						<div class="flex flex-col items-center justify-center py-12 text-slate-500">
							<ImageIcon class="w-12 h-12 text-slate-300 mb-3" />
							<p class="text-sm">暂无图片</p>
						</div>
					{:else}
						<div class="grid grid-cols-3 md:grid-cols-4 gap-3">
							{#each images as image (image.id)}
								<button
									onclick={() => handleImageClick(image)}
									class="aspect-square border rounded-lg overflow-hidden transition-all {selectedImage?.id ===
									image.id
										? 'ring-2 ring-emerald-500 border-emerald-500'
										: 'border-slate-200 hover:border-slate-300'}"
								>
									<img
										src={image.url}
										alt={image.name}
										class="w-full h-full object-cover"
										loading="lazy"
									/>
								</button>
							{/each}
						</div>

						<!-- 分页 -->
						{#if total > pageSize}
							<div class="mt-4 flex items-center justify-center gap-2">
								<Button
									variant="outline"
									disabled={currentPage === 1}
									onclick={() => {
										currentPage--;
										loadImages();
									}}
								>
									上一页
								</Button>
								<span class="text-sm text-slate-600">
									{currentPage} / {Math.ceil(total / pageSize)}
								</span>
								<Button
									variant="outline"
									disabled={currentPage * pageSize >= total}
									onclick={() => {
										currentPage++;
										loadImages();
									}}
								>
									下一页
								</Button>
							</div>
						{/if}
					{/if}
				</div>
			</div>

			<!-- 底部 -->
			<div class="p-4 border-t border-slate-200 flex items-center justify-between">
				<div class="text-sm text-slate-600">
					{#if selectedImage}
						已选择: {selectedImage.name} ({formatFileSize(selectedImage.size)})
					{:else}
						请选择一张图片或上传新图片
					{/if}
				</div>
				<div class="flex gap-3">
					<Button variant="outline" onclick={handleClose}>取消</Button>
					<Button onclick={handleConfirm} disabled={!selectedImage}>确定</Button>
				</div>
			</div>
		</div>
	</div>
{/if}
