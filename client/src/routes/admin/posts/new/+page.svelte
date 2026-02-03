<script lang="ts">
	import PostForm from '$lib/components/admin/PostForm.svelte';
	import { goto } from '$app/navigation';
	import { toast } from '$lib/stores/toast';
	import { createPost } from '$lib/api/post';
	import { getAllCategories, CategoryType, type Category } from '$lib/api/category';
	import { getAllTags, type Tag } from '$lib/api/tag';
	import { auth } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	let title = $state('');
	let description = $state('');
	let content = $state('');
	let categoryId = $state('');
	let coverImage = $state('');
	let isLoading = $state(false);
	let categories = $state<Category[]>([]);
	let tags = $state<Tag[]>([]);
	let selectedTagIds = $state<number[]>([]);

	onMount(async () => {
		try {
			const [categoryResponse, tagResponse] = await Promise.all([
				getAllCategories(CategoryType.POST),
				getAllTags()
			]);
			categories = categoryResponse.data;
			tags = tagResponse.data;
			if (categories.length > 0) {
				categoryId = categories[0].id.toString();
			}
		} catch (error) {
			console.error('加载数据失败', error);
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

		if (!$auth.user?.id) {
			toast.error('请先登录');
			goto('/auth/login');
			return;
		}

		isLoading = true;

		try {
			await createPost({
				title: title.trim(),
				content,
				cover: coverImage || undefined,
				description: description.trim() || undefined,
				authorId: $auth.user?.id || 0,
				categoryId: parseInt(categoryId) || 1,
				tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined
			});

			toast.success('文章创建成功!');
			goto('/admin/posts');
		} catch (error) {
			toast.error('创建失败,请重试');
			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	function handleCancel() {
		if (title || content) {
			if (confirm('确定要放弃编辑吗?未保存的内容将丢失。')) {
				goto('/admin/posts');
			}
		} else {
			goto('/admin/posts');
		}
	}
</script>

<PostForm
	mode="create"
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
	isSubmitting={isLoading}
/>
