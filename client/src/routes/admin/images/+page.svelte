<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { toast } from '$lib/stores/toast';
	import { onMount } from 'svelte';
	import { getAllCategories, CategoryType, type Category } from '$lib/api/category';
	import {
		getImageList,
		uploadImage,
		deleteImage,
		updateImage,
		batchDeleteImages,
		type Image
	} from '$lib/api/image';
	import { Plus, Search, ImageIcon, Upload, Edit, Copy, Trash2, X, Check } from '@lucide/svelte';

	let categories: Category[] = $state([]);
	let images: Image[] = $state([]);
	let isLoading = $state(false);
	let isUploading = $state(false);
	let currentPage = $state(1);
	let pageSize = $state(20);
	let total = $state(0);

	// 当前选中的分类 ID，null 表示未分类
	let selectedCategoryId = $state<number | null>(null);
	let selectedImages = $state<number[]>([]);

	// 新建分类弹窗
	let showNewCategoryModal = $state(false);
	let newCategoryName = $state('');
	let newCategoryDescription = $state('');
	let isCreatingCategory = $state(false);

	// 编辑图片弹窗
	let showEditModal = $state(false);
	let editingImage = $state<Image | null>(null);
	let editImageName = $state('');
	let editImageCategoryId = $state<number | null>(null);

	// 文件上传
	let fileInput: HTMLInputElement;

	onMount(async () => {
		await Promise.all([loadCategories(), loadImages()]);
	});

	async function loadCategories() {
		try {
			const response = await getAllCategories(CategoryType.IMAGE);
			categories = response.data;
		} catch (error) {
			toast.error('加载分类失败');
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
			toast.error('加载图片失败');
			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	function handleCategorySelect(categoryId: number | null) {
		selectedCategoryId = categoryId;
		currentPage = 1;
		selectedImages = [];
		loadImages();
	}

	async function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const files = input.files;
		if (!files || files.length === 0) return;

		isUploading = true;
		const uploadPromises = Array.from(files).map((file) =>
			uploadImage({
				file,
				categoryId: selectedCategoryId !== null ? selectedCategoryId : undefined
			})
		);

		try {
			await Promise.all(uploadPromises);
			toast.success(`成功上传 ${files.length} 张图片`);
			await loadImages();
		} catch (error) {
			toast.error('上传失败');
			console.error(error);
		} finally {
			isUploading = false;
			input.value = '';
		}
	}

	function handleSelectImage(id: number) {
		if (selectedImages.includes(id)) {
			selectedImages = selectedImages.filter((i) => i !== id);
		} else {
			selectedImages = [...selectedImages, id];
		}
	}

	function handleSelectAll() {
		if (selectedImages.length === images.length) {
			selectedImages = [];
		} else {
			selectedImages = images.map((img) => img.id);
		}
	}

	async function handleDelete(id: number) {
		if (confirm('确定要删除这张图片吗?')) {
			try {
				await deleteImage(id);
				images = images.filter((img) => img.id !== id);
				toast.success('删除成功');
			} catch (error) {
				toast.error('删除失败');
				console.error(error);
			}
		}
	}

	async function handleBatchDelete() {
		if (selectedImages.length === 0) {
			toast.warning('请先选择要删除的图片');
			return;
		}
		if (confirm(`确定要删除选中的 ${selectedImages.length} 张图片吗?`)) {
			try {
				await batchDeleteImages(selectedImages);
				images = images.filter((img) => !selectedImages.includes(img.id));
				selectedImages = [];
				toast.success('批量删除成功');
			} catch (error) {
				toast.error('删除失败');
				console.error(error);
			}
		}
	}

	function openEditModal(image: Image) {
		editingImage = image;
		editImageName = image.name;
		editImageCategoryId = image.categoryId;
		showEditModal = true;
	}

	async function handleEditSubmit() {
		if (!editingImage) return;

		try {
			await updateImage(editingImage.id, {
				name: editImageName,
				categoryId: editImageCategoryId
			});
			toast.success('更新成功');
			showEditModal = false;
			await loadImages();
		} catch (error) {
			toast.error('更新失败');
			console.error(error);
		}
	}

	function copyImageUrl(url: string) {
		navigator.clipboard.writeText(url);
		toast.success('已复制图片链接');
	}

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('zh-CN');
	}

	import { createCategory } from '$lib/api/category';

	async function handleCreateCategory() {
		if (!newCategoryName.trim()) {
			toast.warning('请输入分类名称');
			return;
		}

		isCreatingCategory = true;
		try {
			await createCategory({
				name: newCategoryName.trim(),
				description: newCategoryDescription.trim() || undefined,
				type: CategoryType.IMAGE
			});
			toast.success('分类创建成功');
			showNewCategoryModal = false;
			newCategoryName = '';
			newCategoryDescription = '';
			await loadCategories();
		} catch (error: any) {
			toast.error(error.message || '创建失败');
			console.error(error);
		} finally {
			isCreatingCategory = false;
		}
	}
</script>

<div class="flex h-full gap-6">
	<!-- 左侧分类列表 -->
	<div class="w-64 flex-shrink-0">
		<div class="bg-white rounded-xl  border border-slate-200 overflow-hidden">
			<div class="p-4 border-b border-slate-200 flex items-center justify-between">
				<h3 class="font-semibold text-slate-900">图片分类</h3>
				<button
					onclick={() => (showNewCategoryModal = true)}
					class="text-emerald-600 hover:text-emerald-700"
					title="新建分类"
				>
					<Plus class="w-5 h-5" />
				</button>
			</div>
			<nav class="p-2">
				<button
					onclick={() => handleCategorySelect(null)}
					class="w-full text-left px-3 py-2 rounded-lg transition-colors {selectedCategoryId ===
					null
						? 'bg-emerald-600 text-white'
						: 'text-slate-700 hover:bg-slate-100'}"
				>
					<div class="flex items-center justify-between">
						<span>未分类</span>
					</div>
				</button>
				{#each categories as category (category.id)}
					<button
						onclick={() => handleCategorySelect(category.id)}
						class="w-full text-left px-3 py-2 rounded-lg transition-colors {selectedCategoryId ===
						category.id
							? 'bg-emerald-600 text-white'
							: 'text-slate-700 hover:bg-slate-100'}"
					>
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-2">
								{#if category.icon}
									<span>{category.icon}</span>
								{/if}
								{category.name}
							</span>
						</div>
					</button>
				{/each}
			</nav>
		</div>
	</div>

	<!-- 右侧图片列表 -->
	<div class="flex-1 space-y-4">
		<!-- 工具栏 -->
		<div class="bg-white rounded-xl  border border-slate-200 p-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<h1 class="text-xl font-bold text-slate-900">
						{selectedCategoryId === null
							? '未分类'
							: categories.find((c) => c.id === selectedCategoryId)?.name || '图片管理'}
					</h1>
					<span class="text-sm text-slate-500">共 {total} 张图片</span>
				</div>
				<div class="flex items-center gap-2">
					{#if selectedImages.length > 0}
						<Button variant="outline" onclick={handleBatchDelete} class="text-red-600 border-red-300">
							删除选中 ({selectedImages.length})
						</Button>
					{/if}
					<Button onclick={() => fileInput.click()} loading={isUploading}>
						<Upload class="w-5 h-5 mr-2" />
						上传图片
					</Button>
					<input
						type="file"
						accept="image/*"
						multiple
						class="hidden"
						bind:this={fileInput}
						onchange={handleFileUpload}
					/>
				</div>
			</div>
		</div>

		<!-- 图片网格 -->
		<div class="bg-white rounded-xl  border border-slate-200 p-4">
			{#if isLoading}
				<div class="flex items-center justify-center py-12">
					<p class="text-slate-500">加载中...</p>
				</div>
			{:else if images.length === 0}
				<div class="flex flex-col items-center justify-center py-12 text-slate-500">
					<ImageIcon class="w-16 h-16 text-slate-300 mb-4" />
					<p class="text-lg font-medium">暂无图片</p>
					<p class="text-sm mt-1">点击上传按钮添加图片</p>
				</div>
			{:else}
				<div class="mb-4 flex items-center gap-4">
					<label class="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							checked={selectedImages.length === images.length && images.length > 0}
							onchange={handleSelectAll}
							class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
						/>
						<span class="text-sm text-slate-600">全选</span>
					</label>
				</div>
				<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
					{#each images as image (image.id)}
						<div
							class="group relative border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow {selectedImages.includes(
								image.id
							)
								? 'ring-2 ring-emerald-500'
								: ''}"
						>
							<!-- 选择框 -->
							<div class="absolute top-2 left-2 z-10">
								<input
									type="checkbox"
									checked={selectedImages.includes(image.id)}
									onchange={() => handleSelectImage(image.id)}
									class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 bg-white"
								/>
							</div>

							<!-- 图片 -->
							<div class="aspect-square bg-slate-100">
								<img
									src={image.url}
									alt={image.name}
									class="w-full h-full object-cover"
									loading="lazy"
								/>
							</div>

							<!-- 悬浮操作 -->
							<div
								class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
							>
								<button
									onclick={() => copyImageUrl(image.url)}
									class="p-2 bg-white rounded-full hover:bg-slate-100"
									title="复制链接"
								>
									<Copy class="w-5 h-5 text-slate-700" />
								</button>
								<button
									onclick={() => openEditModal(image)}
									class="p-2 bg-white rounded-full hover:bg-slate-100"
									title="编辑"
								>
									<Edit class="w-5 h-5 text-slate-700" />
								</button>
								<button
									onclick={() => handleDelete(image.id)}
									class="p-2 bg-white rounded-full hover:bg-slate-100"
									title="删除"
								>
									<Trash2 class="w-5 h-5 text-red-600" />
								</button>
							</div>

							<!-- 信息 -->
							<div class="p-2">
								<p class="text-sm font-medium text-slate-900 truncate" title={image.name}>
									{image.name}
								</p>
								<p class="text-xs text-slate-500">
									{formatFileSize(image.size)} · {formatDate(image.createdAt)}
								</p>
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<!-- 分页 -->
			{#if !isLoading && images.length > 0}
				<div class="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
					<div class="text-sm text-slate-600">
						显示 {images.length} / {total} 张图片
					</div>
					<div class="flex gap-2">
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
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- 新建分类弹窗 -->
{#if showNewCategoryModal}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
			<h3 class="text-lg font-semibold text-slate-900 mb-4">新建图片分类</h3>
			<div class="space-y-4">
				<div>
					<label for="categoryName" class="block text-sm font-medium text-slate-700 mb-1">
						分类名称 <span class="text-red-500">*</span>
					</label>
					<input
						id="categoryName"
						type="text"
						bind:value={newCategoryName}
						placeholder="请输入分类名称..."
						class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
					/>
				</div>
				<div>
					<label for="categoryDesc" class="block text-sm font-medium text-slate-700 mb-1">
						分类描述
					</label>
					<textarea
						id="categoryDesc"
						bind:value={newCategoryDescription}
						placeholder="简要描述分类内容..."
						rows="2"
						class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
					></textarea>
				</div>
			</div>
			<div class="mt-6 flex gap-3 justify-end">
				<Button variant="outline" onclick={() => (showNewCategoryModal = false)}>取消</Button>
				<Button onclick={handleCreateCategory} loading={isCreatingCategory}>创建</Button>
			</div>
		</div>
	</div>
{/if}

<!-- 编辑图片弹窗 -->
{#if showEditModal && editingImage}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
			<h3 class="text-lg font-semibold text-slate-900 mb-4">编辑图片</h3>
			<div class="space-y-4">
				<div class="flex justify-center">
					<img
						src={editingImage.url}
						alt={editingImage.name}
						class="max-h-48 rounded-lg"
					/>
				</div>
				<div>
					<label for="imageName" class="block text-sm font-medium text-slate-700 mb-1">
						图片名称
					</label>
					<input
						id="imageName"
						type="text"
						bind:value={editImageName}
						placeholder="请输入图片名称..."
						class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
					/>
				</div>
				<div>
					<label for="imageCategory" class="block text-sm font-medium text-slate-700 mb-1">
						所属分类
					</label>
					<select
						id="imageCategory"
						bind:value={editImageCategoryId}
						class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
					>
						<option value={null}>未分类</option>
						{#each categories as category (category.id)}
							<option value={category.id}>{category.name}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="mt-6 flex gap-3 justify-end">
				<Button variant="outline" onclick={() => (showEditModal = false)}>取消</Button>
				<Button onclick={handleEditSubmit}>保存</Button>
			</div>
		</div>
	</div>
{/if}
