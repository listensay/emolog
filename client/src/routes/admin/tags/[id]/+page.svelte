<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { toast } from '$lib/stores/toast';
	import { getTag, updateTag } from '$lib/api/tag';
	import type { Tag } from '$lib/api/tag';
	import { onMount } from 'svelte';
	import { ArrowLeft } from '@lucide/svelte';

	let tag: Tag | null = $state(null);
	let name = $state('');
	let isLoading = $state(false);
	let isSaving = $state(false);

	onMount(async () => {
		const id = $page.params.id;
		if (typeof id !== 'string') return;

		isLoading = true;
		try {
			const response = await getTag(parseInt(id));
			tag = response.data;
			name = tag.name;
		} catch (error) {
			toast.error('加载标签失败');
			console.error(error);
			goto('/admin/tags');
		} finally {
			isLoading = false;
		}
	});

	async function handleSubmit() {
		if (!name.trim()) {
			toast.warning('请输入标签名称');
			return;
		}

		if (!tag) return;

		isSaving = true;

		try {
			await updateTag(tag.id, {
				name: name.trim()
			});

			toast.success('标签更新成功!');
			goto('/admin/tags');
		} catch (error: any) {
			toast.error(error.message || '更新失败,请重试');
			console.error(error);
		} finally {
			isSaving = false;
		}
	}

	function handleCancel() {
		if (name !== tag?.name) {
			if (confirm('确定要放弃编辑吗?未保存的内容将丢失。')) {
				goto('/admin/tags');
			}
		} else {
			goto('/admin/tags');
		}
	}
</script>

{#if isLoading}
	<div class="flex items-center justify-center py-12">
		<p class="text-slate-500">加载中...</p>
	</div>
{:else if tag}
	<div class="max-w-2xl mx-auto space-y-6">
		<!-- 页面标题 -->
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold text-slate-900">编辑标签</h1>
				<p class="text-sm text-slate-500 mt-1">编辑标签信息</p>
			</div>
			<Button variant="ghost" onclick={handleCancel}>
				<ArrowLeft class="w-5 h-5 mr-2" />
				返回
			</Button>
		</div>

		<!-- 编辑表单 -->
		<div class="bg-white rounded-xl  border border-slate-200 p-6 space-y-6">
			<Input
				id="name"
				label="标签名称"
				bind:value={name}
				placeholder="请输入标签名称..."
				required
			/>

			<div class="pt-4 border-t border-slate-200 flex gap-4">
				<Button type="button" onclick={handleSubmit} loading={isSaving} class="flex-1">
					更新标签
				</Button>
				<Button variant="outline" onclick={handleCancel} class="flex-1">
					取消
				</Button>
			</div>
		</div>

		<!-- 标签信息 -->
		<div class="bg-white rounded-xl  border border-slate-200 p-6 space-y-4">
			<h3 class="text-lg font-semibold text-slate-900">标签信息</h3>

			<div class="space-y-3 text-sm">
				<div class="flex justify-between">
					<span class="text-slate-600">ID</span>
					<span class="font-medium">{tag.id}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-slate-600">创建时间</span>
					<span class="font-medium">{new Date(tag.createdAt).toLocaleDateString('zh-CN')}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-slate-600">最后修改</span>
					<span class="font-medium">{new Date(tag.updatedAt).toLocaleDateString('zh-CN')}</span>
				</div>
			</div>
		</div>
	</div>
{/if}
