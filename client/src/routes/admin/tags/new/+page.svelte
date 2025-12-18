<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { goto } from '$app/navigation';
	import { toast } from '$lib/stores/toast';
	import { createTag } from '$lib/api/tag';

	let name = $state('');
	let isLoading = $state(false);

	async function handleSubmit() {
		if (!name.trim()) {
			toast.warning('请输入标签名称');
			return;
		}

		isLoading = true;

		try {
			await createTag({
				name: name.trim()
			});

			toast.success('标签创建成功!');
			goto('/admin/tags');
		} catch (error: any) {
			toast.error(error.message || '创建失败,请重试');
			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	function handleCancel() {
		if (name) {
			if (confirm('确定要放弃编辑吗?未保存的内容将丢失。')) {
				goto('/admin/tags');
			}
		} else {
			goto('/admin/tags');
		}
	}
</script>

<div class="max-w-2xl mx-auto space-y-6">
	<!-- 页面标题 -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-slate-900">新建标签</h1>
			<p class="text-sm text-slate-500 mt-1">创建一个新的标签</p>
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
		<Input id="name" label="标签名称" bind:value={name} placeholder="请输入标签名称..." required />

		<div class="pt-4 border-t border-slate-200 flex gap-4">
			<Button type="button" onclick={handleSubmit} loading={isLoading} class="flex-1">
				创建标签
			</Button>
			<Button variant="outline" onclick={handleCancel} class="flex-1">
				取消
			</Button>
		</div>
	</div>
</div>
