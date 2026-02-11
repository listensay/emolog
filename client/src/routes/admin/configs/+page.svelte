<script lang="ts">
	import { toast } from '$lib/stores/toast';
	import { getAllConfigs, setConfig, deleteConfig } from '$lib/api/config';
	import { onMount } from 'svelte';
	import AdminPage from '$lib/components/admin/AdminPage.svelte';
	import AdminTable from '$lib/components/admin/AdminTable.svelte';
	import EditModal from '$lib/components/admin/EditModal.svelte';
	import { pageTitle, pageSubtitle } from '$lib/stores/admin';

	interface ConfigItem {
		key: string;
		value: string;
	}

	let configs: ConfigItem[] = $state([]);
	let isLoading = $state(false);
	let currentPage = $state(1);
	let pageSize = $state(10);
	let total = $state(0);

	let searchQuery = $state('');
	let selectedConfigs = $state<string[]>([]);

	// 编辑弹窗
	let showEditModal = $state(false);
	let editingConfig = $state<ConfigItem | null>(null);

	// 新建弹窗
	let showCreateModal = $state(false);
	let newConfig = $state<ConfigItem>({
		key: '',
		value: ''
	});

	$effect(() => {
		pageTitle.set('配置管理');
		pageSubtitle.set('管理系统配置项');
	});

	const filteredConfigs = $derived(
		configs.filter((config) => {
			const matchSearch =
				searchQuery === '' ||
				config.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
				config.value.toLowerCase().includes(searchQuery.toLowerCase());
			return matchSearch;
		})
	);

	// 分页后的数据
	const paginatedConfigs = $derived(() => {
		const start = (currentPage - 1) * pageSize;
		const end = start + pageSize;
		return filteredConfigs.slice(start, end);
	});

	onMount(async () => {
		await loadConfigs();
	});

	async function loadConfigs() {
		isLoading = true;
		try {
			const response = await getAllConfigs();
			// 将键值对对象转换为数组
			configs = Object.entries(response.data).map(([key, value]) => ({
				key,
				value: value || ''
			}));
			total = configs.length;
		} catch (error) {
			toast.error('加载配置失败');
			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	async function handleDelete(key: string) {
		if (confirm(`确定要删除配置 "${key}" 吗?`)) {
			try {
				await deleteConfig(key);
				configs = configs.filter((c) => c.key !== key);
				total = configs.length;
				toast.success('删除成功');
			} catch (error) {
				toast.error('删除失败');
				console.error(error);
			}
		}
	}

	async function handleBatchDelete() {
		if (selectedConfigs.length === 0) {
			toast.warning('请先选择要删除的配置');
			return;
		}
		if (confirm(`确定要删除选中的 ${selectedConfigs.length} 个配置吗?`)) {
			try {
				await Promise.all(selectedConfigs.map((key) => deleteConfig(key)));
				configs = configs.filter((c) => !selectedConfigs.includes(c.key));
				total = configs.length;
				selectedConfigs = [];
				toast.success('批量删除成功');
			} catch (error) {
				toast.error('删除失败');
				console.error(error);
			}
		}
	}

	function openEditModal(config: ConfigItem) {
		editingConfig = { ...config };
		showEditModal = true;
	}

	async function handleEditSubmit(data: ConfigItem) {
		if (!editingConfig) return;
		try {
			await setConfig(data.key, data.value);
			// 更新本地数据
			const index = configs.findIndex((c) => c.key === editingConfig!.key);
			if (index !== -1) {
				configs[index] = { key: data.key, value: data.value };
			}
			toast.success('更新成功');
		} catch (error: any) {
			toast.error(error.message || '更新失败');
			throw error;
		}
	}

	async function handleCreateSubmit(data: ConfigItem) {
		if (!data.key.trim()) {
			toast.warning('配置键名不能为空');
			throw new Error('配置键名不能为空');
		}

		// 检查是否已存在
		if (configs.some((c) => c.key === data.key)) {
			toast.warning('配置键名已存在');
			throw new Error('配置键名已存在');
		}

		try {
			await setConfig(data.key, data.value);
			configs = [...configs, { key: data.key, value: data.value }];
			total = configs.length;
			newConfig = { key: '', value: '' };
			toast.success('创建成功');
		} catch (error: any) {
			toast.error(error.message || '创建失败');
			throw error;
		}
	}
</script>

<AdminPage
	createText="新建配置"
	onCreate={() => (showCreateModal = true)}
	bind:searchQuery
	searchPlaceholder="搜索配置键名或值..."
	total={filteredConfigs.length}
	bind:currentPage
	bind:pageSize
	onBatchDelete={handleBatchDelete}
	selectedCount={selectedConfigs.length}
>
	<AdminTable items={paginatedConfigs()} {isLoading} bind:selectedIds={selectedConfigs} itemKey="key">
		{#snippet header()}
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				配置键名
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				配置值
			</th>
			<th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
				操作
			</th>
		{/snippet}

		{#snippet row(config)}
			<td class="px-6 py-4">
				<span class="text-sm font-medium text-slate-900 font-mono">{config.key}</span>
			</td>
			<td class="px-6 py-4">
				<div class="text-sm text-slate-600 max-w-md truncate" title={config.value}>
					{config.value || '-'}
				</div>
			</td>
			<td class="px-6 py-4 text-right">
				<div class="flex items-center justify-end gap-2">
					<button
						onclick={() => openEditModal(config)}
						class="text-emerald-600 hover:text-emerald-900 text-sm font-medium"
					>
						编辑
					</button>
					<button
						onclick={() => handleDelete(config.key)}
						class="text-red-600 hover:text-red-900 text-sm font-medium"
					>
						删除
					</button>
				</div>
			</td>
		{/snippet}
	</AdminTable>
</AdminPage>

<!-- 编辑弹窗 -->
<EditModal
	bind:open={showEditModal}
	title="编辑配置"
	data={editingConfig}
	fields={[
		{ name: 'key', label: '配置键名', type: 'text', required: true, disabled: true },
		{
			name: 'value',
			label: '配置值',
			type: 'textarea',
			rows: 3,
			hint: '输入配置的值'
		}
	]}
	onSubmit={handleEditSubmit}
	onClose={() => {}}
/>

<!-- 新建弹窗 -->
<EditModal
	bind:open={showCreateModal}
	title="新建配置"
	data={newConfig}
	fields={[
		{
			name: 'key',
			label: '配置键名',
			type: 'text',
			required: true,
			placeholder: '例如: site_name',
			hint: '使用下划线分隔的小写字母'
		},
		{
			name: 'value',
			label: '配置值',
			type: 'textarea',
			rows: 3,
			hint: '输入配置的值'
		}
	]}
	onSubmit={handleCreateSubmit}
	onClose={() => {}}
/>
