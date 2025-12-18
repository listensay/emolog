<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import ImagePicker from '$lib/components/ImagePicker.svelte';
	import { toast } from '$lib/stores/toast';
	import { getAllConfigs, setConfigs } from '$lib/api/config';
	import type { SiteConfig } from '$lib/api/config';
	import { onMount } from 'svelte';

	let isLoading = $state(true);
	let isSaving = $state(false);

	// 网站配置表单
	let siteTitle = $state('');
	let siteDescription = $state('');
	let siteIcon = $state('');
	let siteLogo = $state('');
	let siteKeywords = $state('');
	let siteFooter = $state('');

	// 图片选择器状态
	let iconPickerOpen = $state(false);
	let logoPickerOpen = $state(false);

	onMount(async () => {
		await loadConfigs();
	});

	async function loadConfigs() {
		isLoading = true;
		try {
			const response = await getAllConfigs();
			const config = response.data;
			siteTitle = config.site_title || '';
			siteDescription = config.site_description || '';
			siteIcon = config.site_icon || '';
			siteLogo = config.site_logo || '';
			siteKeywords = config.site_keywords || '';
			siteFooter = config.site_footer || '';
		} catch (error) {
			toast.error('加载配置失败');
			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	async function handleSave() {
		isSaving = true;
		try {
			await setConfigs({
				configs: [
					{ key: 'site_title', value: siteTitle },
					{ key: 'site_description', value: siteDescription },
					{ key: 'site_icon', value: siteIcon },
					{ key: 'site_logo', value: siteLogo },
					{ key: 'site_keywords', value: siteKeywords },
					{ key: 'site_footer', value: siteFooter },
				]
			});
			toast.success('配置保存成功');
		} catch (error: any) {
			toast.error(error.message || '保存失败');
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="space-y-6">
	{#if isLoading}
		<div class="bg-white rounded-xl border border-slate-200 p-8">
			<div class="animate-pulse space-y-4">
				<div class="h-6 bg-slate-200 rounded w-1/4"></div>
				<div class="h-10 bg-slate-200 rounded"></div>
				<div class="h-10 bg-slate-200 rounded"></div>
				<div class="h-10 bg-slate-200 rounded"></div>
			</div>
		</div>
	{:else}
		<!-- 网站基本信息 -->
		<div class="bg-white rounded-xl border border-slate-200 p-6">
			<h3 class="text-lg font-semibold text-slate-900 mb-4">网站基本信息</h3>

			<div class="space-y-4">
				<Input
					label="网站标题"
					bind:value={siteTitle}
					placeholder="请输入网站标题"
				/>

				<div>
					<label class="block text-sm font-medium text-slate-700 mb-1">网站描述</label>
					<textarea
						bind:value={siteDescription}
						rows={3}
						class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
						placeholder="请输入网站描述"
					></textarea>
				</div>

				<Input
					label="网站关键词"
					bind:value={siteKeywords}
					placeholder="多个关键词用逗号分隔，如：博客,技术,分享"
				/>
			</div>
		</div>

		<!-- 网站图标和Logo -->
		<div class="bg-white rounded-xl border border-slate-200 p-6">
			<h3 class="text-lg font-semibold text-slate-900 mb-4">网站图标</h3>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<!-- 网站图标 -->
				<div>
					<label class="block text-sm font-medium text-slate-700 mb-2">Favicon (网站图标)</label>
					<div class="flex items-center gap-4">
						{#if siteIcon}
							<img
								src={siteIcon}
								alt="网站图标"
								class="w-12 h-12 object-contain border border-slate-200 rounded-lg bg-slate-50"
							/>
						{:else}
							<div class="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
								<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
								</svg>
							</div>
						{/if}
						<div class="flex flex-col gap-2">
							<Button variant="outline" onclick={() => iconPickerOpen = true}>
								选择图片
							</Button>
							{#if siteIcon}
								<button
									type="button"
									onclick={() => siteIcon = ''}
									class="text-sm text-red-600 hover:text-red-700"
								>
									移除图标
								</button>
							{/if}
						</div>
					</div>
					<p class="text-xs text-slate-400 mt-2">建议尺寸：32x32 或 64x64 像素</p>
				</div>

				<!-- 网站Logo -->
				<div>
					<label class="block text-sm font-medium text-slate-700 mb-2">Logo</label>
					<div class="flex items-center gap-4">
						{#if siteLogo}
							<img
								src={siteLogo}
								alt="网站Logo"
								class="h-12 object-contain border border-slate-200 rounded-lg bg-slate-50 px-2"
							/>
						{:else}
							<div class="w-24 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
								<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
								</svg>
							</div>
						{/if}
						<div class="flex flex-col gap-2">
							<Button variant="outline" onclick={() => logoPickerOpen = true}>
								选择图片
							</Button>
							{#if siteLogo}
								<button
									type="button"
									onclick={() => siteLogo = ''}
									class="text-sm text-red-600 hover:text-red-700"
								>
									移除Logo
								</button>
							{/if}
						</div>
					</div>
					<p class="text-xs text-slate-400 mt-2">建议高度：40-60 像素</p>
				</div>
			</div>
		</div>

		<!-- 页脚设置 -->
		<div class="bg-white rounded-xl border border-slate-200 p-6">
			<h3 class="text-lg font-semibold text-slate-900 mb-4">页脚设置</h3>

			<div>
				<label class="block text-sm font-medium text-slate-700 mb-1">页脚版权信息</label>
				<textarea
					bind:value={siteFooter}
					rows={2}
					class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
					placeholder="请输入页脚版权信息"
				></textarea>
				<p class="text-xs text-slate-400 mt-1">支持 HTML 标签</p>
			</div>
		</div>

		<!-- 保存按钮 -->
		<div class="flex justify-end">
			<Button onclick={handleSave} loading={isSaving}>
				保存配置
			</Button>
		</div>
	{/if}
</div>

<!-- 图片选择器 -->
<ImagePicker
	bind:open={iconPickerOpen}
	onSelect={(url) => {
		siteIcon = url;
	}}
/>

<ImagePicker
	bind:open={logoPickerOpen}
	onSelect={(url) => {
		siteLogo = url;
	}}
/>
