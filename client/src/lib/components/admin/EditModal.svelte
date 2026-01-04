<script lang="ts" generics="T extends Record<string, any>">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { toast } from '$lib/stores/toast';

	interface Field {
		name: string;
		label: string;
		type: 'text' | 'textarea' | 'number' | 'select';
		placeholder?: string;
		hint?: string;
		required?: boolean;
		options?: { value: any; label: string }[];
		rows?: number;
		min?: number;
	}

	interface Props {
		open: boolean;
		title: string;
		data: T | null;
		fields: Field[];
		onSubmit: (data: T) => Promise<void>;
		onClose: () => void;
		imageUrl?: string;
	}

	let {
		open = $bindable(false),
		title,
		data,
		fields,
		onSubmit,
		onClose,
		imageUrl
	}: Props = $props();

	let formData = $state<Record<string, any>>({});
	let isSaving = $state(false);

	$effect(() => {
		if (open && data) {
			formData = { ...data };
		}
	});

	async function handleSubmit() {
		// 验证必填字段
		for (const field of fields) {
			if (field.required && !formData[field.name]?.toString().trim()) {
				toast.warning(`请输入${field.label}`);
				return;
			}
		}

		isSaving = true;
		try {
			await onSubmit(formData as T);
			toast.success('更新成功');
			open = false;
		} catch (error: any) {
			toast.error(error.message || '更新失败');
			console.error(error);
		} finally {
			isSaving = false;
		}
	}

	function handleClose() {
		if (!isSaving) {
			open = false;
			onClose();
		}
	}
</script>

{#if open && data}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
			<h3 class="text-lg font-semibold text-slate-900 mb-4">{title}</h3>

			<div class="space-y-4">
				<!-- 图片预览（如果提供） -->
				{#if imageUrl}
					<div class="flex justify-center">
						<img src={imageUrl} alt="Preview" class="max-h-48 rounded-lg" />
					</div>
				{/if}

				<!-- 动态表单字段 -->
				{#each fields as field (field.name)}
					<div>
						<label for={field.name} class="block text-sm font-medium text-slate-700 mb-1">
							{field.label}
							{#if field.required}
								<span class="text-red-500">*</span>
							{/if}
						</label>

						{#if field.type === 'text'}
							<input
								id={field.name}
								type="text"
								bind:value={formData[field.name]}
								placeholder={field.placeholder || `请输入${field.label}...`}
								class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
							/>
						{:else if field.type === 'number'}
							<input
								id={field.name}
								type="number"
								bind:value={formData[field.name]}
								min={field.min}
								placeholder={field.placeholder || `请输入${field.label}...`}
								class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
							/>
						{:else if field.type === 'textarea'}
							<textarea
								id={field.name}
								bind:value={formData[field.name]}
								placeholder={field.placeholder || `请输入${field.label}...`}
								rows={field.rows || 3}
								class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
							></textarea>
						{:else if field.type === 'select'}
							<select
								id={field.name}
								bind:value={formData[field.name]}
								class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
							>
								{#each field.options || [] as option (option.value)}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
						{/if}

						{#if field.hint}
							<p class="text-xs text-slate-500 mt-1">{field.hint}</p>
						{/if}
					</div>
				{/each}
			</div>

			<div class="mt-6 flex gap-3 justify-end">
				<Button variant="outline" onclick={handleClose} disabled={isSaving}>取消</Button>
				<Button onclick={handleSubmit} loading={isSaving}>保存</Button>
			</div>
		</div>
	</div>
{/if}
