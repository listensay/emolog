<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { toast } from '$lib/stores/toast';
	import { getCategory, updateCategory, CategoryType } from '$lib/api/category';
	import type { Category } from '$lib/api/category';
	import { onMount } from 'svelte';
	import { ArrowLeft } from '@lucide/svelte';

	let category: Category | null = $state(null);
	let name = $state('');
	let description = $state('');
	let icon = $state('');
	let order = $state(0);
	let type = $state<CategoryType>(CategoryType.POST);
	let isLoading = $state(false);
	let isSaving = $state(false);

	onMount(async () => {
		const id = $page.params.id;
		if (typeof id !== 'string') return;

		isLoading = true;
		try {
			const response = await getCategory(parseInt(id));
			category = response.data;
			name = category.name;
			description = category.description || '';
			icon = category.icon || '';
			order = category.order;
			type = category.type || CategoryType.POST;
		} catch (error) {
			toast.error('加载分类失败');
			console.error(error);
			goto('/admin/categories');
		} finally {
			isLoading = false;
		}
	});

	async function handleSubmit() {
		if (!name.trim()) {
			toast.warning('请输入分类名称');
			return;
		}

		if (!category) return;

		isSaving = true;

		try {
			await updateCategory(category.id, {
				name: name.trim(),
				description: description.trim() || undefined,
				icon: icon.trim() || undefined,
				order: order,
				type: type
			});

			toast.success('分类更新成功!');
			goto('/admin/categories');
		} catch (error: any) {
			toast.error(error.message || '更新失败,请重试');
			console.error(error);
		} finally {
			isSaving = false;
		}
	}

	function handleCancel() {
		if (name !== category?.name || description !== (category?.description || '')) {
			if (confirm('确定要放弃编辑吗?未保存的内容将丢失。')) {
				goto('/admin/categories');
			}
		} else {
			goto('/admin/categories');
		}
	}
</script>

{#if isLoading}
	<div class="flex items-center justify-center py-12">
		<p class="text-slate-500">加载中...</p>
	</div>
{:else if category}
	<div class="max-w-2xl mx-auto space-y-6">
		<div>
			<Button variant="ghost" onclick={handleCancel}>
				<ArrowLeft class="w-5 h-5 mr-2" />
				返回
			</Button>
		</div>

		<!-- 编辑表单 -->
		<div class="bg-white rounded-xl  border border-slate-200 p-6 space-y-6">
			<Input
				id="name"
				label="分类名称"
				bind:value={name}
				placeholder="请输入分类名称..."
				required
			/>

			<div>
				<label for="type" class="block text-sm font-medium text-slate-700 mb-2">
					分类类型
				</label>
				<select
					id="type"
					bind:value={type}
					class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
				>
					<option value={CategoryType.POST}>文章分类</option>
					<option value={CategoryType.IMAGE}>图片分类</option>
				</select>
				<p class="text-xs text-slate-500 mt-1">选择分类用于文章还是图片</p>
			</div>

			<div>
				<label for="description" class="block text-sm font-medium text-slate-700 mb-2">
					分类描述
				</label>
				<textarea
					id="description"
					bind:value={description}
					placeholder="简要描述分类内容..."
					rows="3"
					class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
				></textarea>
				<p class="text-xs text-slate-500 mt-1">可选，用于描述该分类的用途</p>
			</div>

			<Input id="icon" label="分类图标" bind:value={icon} placeholder="输入图标（emoji或图标名称）..." />

			<div>
				<label for="order" class="block text-sm font-medium text-slate-700 mb-2">
					排序值
				</label>
				<input
					id="order"
					type="number"
					bind:value={order}
					min="0"
					class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
				/>
				<p class="text-xs text-slate-500 mt-1">数值越小排序越靠前</p>
			</div>

			<div class="pt-4 border-t border-slate-200 flex gap-4">
				<Button type="button" onclick={handleSubmit} loading={isSaving} class="flex-1">
					更新分类
				</Button>
				<Button variant="outline" onclick={handleCancel} class="flex-1">
					取消
				</Button>
			</div>
		</div>

		<!-- 分类信息 -->
		<div class="bg-white rounded-xl  border border-slate-200 p-6 space-y-4">
			<h3 class="text-lg font-semibold text-slate-900">分类信息</h3>

			<div class="space-y-3 text-sm">
				<div class="flex justify-between">
					<span class="text-slate-600">ID</span>
					<span class="font-medium">{category.id}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-slate-600">创建时间</span>
					<span class="font-medium">{new Date(category.createdAt).toLocaleDateString('zh-CN')}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-slate-600">最后修改</span>
					<span class="font-medium">{new Date(category.updatedAt).toLocaleDateString('zh-CN')}</span>
				</div>
			</div>
		</div>
	</div>
{/if}
