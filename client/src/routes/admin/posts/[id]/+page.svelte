<script lang="ts">
	import PostForm from '$lib/components/admin/PostForm.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { toast } from '$lib/stores/toast';
	import { getPost, updatePost } from '$lib/api/post';
	import { getAllCategories, CategoryType, type Category } from '$lib/api/category';
	import { getAllTags, type Tag } from '$lib/api/tag';
	import type { Post } from '$lib/api/post';
	import { onMount } from 'svelte';

	let post: Post | null = $state(null);
	let title = $state('');
	let description = $state('');
	let content = $state('');
	let categoryId = $state('');
	let coverImage = $state('');
	let isLoading = $state(false);
	let isSaving = $state(false);
	let categories = $state<Category[]>([]);
	let tags = $state<Tag[]>([]);
	let selectedTagIds = $state<number[]>([]);

	onMount(async () => {
		const id = $page.params.id;
		if (typeof id !== 'string') return;

		isLoading = true;
		try {
			// 并行加载文章、分类和标签
			const [postResponse, categoryResponse, tagResponse] = await Promise.all([
				getPost(parseInt(id)),
				getAllCategories(CategoryType.POST),
				getAllTags()
			]);

			post = postResponse.data;
			categories = categoryResponse.data;
			tags = tagResponse.data;

			title = post.title;
			description = post.description || '';
			content = post.content || '';
			categoryId = post.categoryId.toString();
			coverImage = post.cover || '';
			selectedTagIds = post.tags?.map((t) => t.id) || [];
		} catch (error) {
			toast.error('加载文章失败');
			console.error(error);
			goto('/admin/posts');
		} finally {
			isLoading = false;
		}
	});

	async function handleSubmit() {
		if (!title.trim()) {
			toast.warning('请输入文章标题');
			return;
		}

		if (!content.trim()) {
			toast.warning('请输入文章内容');
			return;
		}

		if (!post) return;

		isSaving = true;

		try {
			await updatePost(post.id, {
				title: title.trim(),
				content,
				cover: coverImage || undefined,
				description: description.trim() || undefined,
				categoryId: parseInt(categoryId) || 1,
				tagIds: selectedTagIds
			});

			toast.success('文章更新成功!');
			goto('/admin/posts');
		} catch (error) {
			toast.error('更新失败,请重试');
			console.error(error);
		} finally {
			isSaving = false;
		}
	}

	function handleCancel() {
		if (title !== post?.title || content !== post?.content) {
			if (confirm('确定要放弃编辑吗?未保存的内容将丢失。')) {
				goto('/admin/posts');
			}
		} else {
			goto('/admin/posts');
		}
	}
</script>

{#if isLoading}
	<div class="flex items-center justify-center py-12">
		<p class="text-slate-500">加载中...</p>
	</div>
{:else if post}
	<PostForm
		mode="edit"
		{post}
		{categories}
		bind:tags
		bind:title
		bind:description
		bind:content
		bind:categoryId
		bind:coverImage
		bind:selectedTagIds
		onSubmit={handleSubmit}
		onCancel={handleCancel}
		isSubmitting={isSaving}
	/>
{/if}
