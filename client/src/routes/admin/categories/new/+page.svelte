<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { goto } from '$app/navigation';
	import { toast } from '$lib/stores/toast';
	import { createCategory, CategoryType } from '$lib/api/category';

	let name = $state('');
	let description = $state('');
	let icon = $state('');
	let order = $state(0);
	let type = $state<CategoryType>(CategoryType.POST);
	let isLoading = $state(false);

	async function handleSubmit() {
		if (!name.trim()) {
			toast.warning('请输入分类名称');
			return;
		}

		isLoading = true;

		try {
			await createCategory({
				name: name.trim(),
				description: description.trim() || undefined,
				icon: icon.trim() || undefined,
				order: order,
				type: type
			});

			toast.success('分类创建成功!');
			goto('/admin/categories');
		} catch (error: any) {
			toast.error(error.message || '创建失败,请重试');
			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	function handleCancel() {
		if (name || description) {
			if (confirm('确定要放弃编辑吗?未保存的内容将丢失。')) {
				goto('/admin/categories');
			}
		} else {
			goto('/admin/categories');
		}
	}
</script>

<div class="max-w-2xl mx-auto space-y-6">
	<!-- 页面标题 -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-slate-900">新建分类</h1>
			<p class="text-sm text-slate-500 mt-1">创建一个新的分类</p>
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

		<Input
			id="icon"
			label="分类图标"
			bind:value={icon}
			placeholder="输入图标（emoji或图标名称）..."
		/>

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
			<Button type="button" onclick={handleSubmit} loading={isLoading} class="flex-1">
				创建分类
			</Button>
			<Button variant="outline" onclick={handleCancel} class="flex-1">
				取消
			</Button>
		</div>
	</div>
</div>
