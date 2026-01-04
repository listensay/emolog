<script lang="ts">
	import PostForm from '$lib/components/admin/PostForm.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { toast } from '$lib/stores/toast';
	import { getPage, updatePage, getPageTypeOptions, PageType } from '$lib/api/page';
	import type { Page } from '$lib/api/page';
	import { getAllCategories, CategoryType, type Category } from '$lib/api/category';
	import { getAllTags, type Tag } from '$lib/api/tag';
	import { onMount } from 'svelte';
	import { pageTitle, pageSubtitle } from '$lib/stores/admin';

	let pageData: Page | null = $state(null);
	let title = $state('');
	let description = $state('');
	let content = $state('');
	let categoryId = $state('');
	let coverImage = $state('');
	let pageType = $state(PageType.SIMPLE);
	let isLoading = $state(false);
	let categories = $state<Category[]>([]);
	let tags = $state<Tag[]>([]);
	let selectedTagIds = $state<number[]>([]);

	const pageTypeOptions = getPageTypeOptions();

	$effect(() => {
		pageTitle.set('编辑页面');
		pageSubtitle.set('修改页面内容');
	});

	onMount(async () => {
		const id = parseInt($page.params.id);
		if (isNaN(id)) {
			toast.error('无效的页面 ID');
			goto('/admin/pages');
			return;
		}

		try {
			const [pageResponse, categoryResponse, tagResponse] = await Promise.all([
				getPage(id),
				getAllCategories(CategoryType.POST),
				getAllTags()
			]);

			pageData = pageResponse.data;
			title = pageData.title;
			description = pageData.description || '';
			content = pageData.content;
			categoryId = pageData.categoryId.toString();
			coverImage = pageData.cover || '';
			pageType = pageData.pageType || PageType.SIMPLE;
			selectedTagIds = pageData.tags?.map((tag) => tag.id) || [];

			categories = categoryResponse.data;
			tags = tagResponse.data;
		} catch (error) {
			toast.error('加载页面失败');
			console.error(error);
			goto('/admin/pages');
		}
	});

	async function handleSubmit() {
		if (!title.trim()) {
			toast.warning('请输入页面标题');
			return;
		}

		if (!content.trim()) {
			toast.warning('请输入页面内容');
			return;
		}

		if (!pageData) {
			toast.error('页面数据未加载');
			return;
		}

		isLoading = true;

		try {
			await updatePage(pageData.id, {
				title: title.trim(),
				content,
				cover: coverImage || undefined,
				description: description.trim() || undefined,
				categoryId: parseInt(categoryId),
				pageType: pageType,
				tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined
			});

			toast.success('页面更新成功!');
			goto('/admin/pages');
		} catch (error) {
			toast.error('更新失败,请重试');
			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	function handleCancel() {
		goto('/admin/pages');
	}
</script>

{#if pageData}
	<PostForm
		mode="edit"
		{categories}
		bind:tags
		bind:title
		bind:description
		bind:content
		bind:categoryId
		bind:coverImage
		bind:selectedTagIds
		bind:pageType
		isPage={true}
		{pageTypeOptions}
		onSubmit={handleSubmit}
		onCancel={handleCancel}
		isSubmitting={isLoading}
	/>
{:else}
	<div class="flex items-center justify-center h-64">
		<div class="text-slate-500">加载中...</div>
	</div>
{/if}
