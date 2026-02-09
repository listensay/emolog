<script lang="ts">
	import { page } from '$app/state';
	import type { ComponentType } from 'svelte';
	import { LayoutDashboard, FileText, FolderOpen, Tag, ImageIcon, MessageCircle, Users, Settings, File, Database, Link } from '@lucide/svelte';

	interface MenuItem {
		label: string;
		href: string;
		icon: ComponentType;
	}

	const menuItems: MenuItem[] = [
		{ label: '仪表盘', href: '/admin', icon: LayoutDashboard },
		{ label: '文章管理', href: '/admin/posts', icon: FileText },
		{ label: '页面管理', href: '/admin/pages', icon: File },
		{ label: '分类管理', href: '/admin/categories', icon: FolderOpen },
		{ label: '标签管理', href: '/admin/tags', icon: Tag },
		{ label: '图片管理', href: '/admin/images', icon: ImageIcon },
		{ label: '评论管理', href: '/admin/comments', icon: MessageCircle },
		{ label: '友情链接', href: '/admin/links', icon: Link },
		{ label: '用户管理', href: '/admin/users', icon: Users },
		{ label: '配置管理', href: '/admin/configs', icon: Database },
		{ label: '设置', href: '/admin/settings', icon: Settings }
	];

	const currentPath = $derived(page.url.pathname);

	function isActive(href: string): boolean {
		if (href === '/admin') {
			return currentPath === '/admin';
		}
		return currentPath.startsWith(href);
	}
</script>

<aside class="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
	<!-- Navigation -->
	<nav class="flex-1 overflow-y-auto p-4">
		<ul class="space-y-1">
			{#each menuItems as item}
				{@const Icon = item.icon}
				<li>
					<a
						href={item.href}
						class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm {isActive(
							item.href
						)
							? 'bg-emerald-600 text-white'
							: 'text-slate-300 hover:bg-slate-800 hover:text-white'}"
					>
						<Icon class="w-5 h-5" />
						<span>{item.label}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- Footer -->
	<div class="p-4 border-t border-slate-800">
		<div class="text-xs text-slate-500 text-center">
			© 2026 Emolog
		</div>
	</div>
</aside>

<style>
	/* 自定义滚动条 */
	aside::-webkit-scrollbar {
		width: 6px;
	}

	aside::-webkit-scrollbar-track {
		background: transparent;
	}

	aside::-webkit-scrollbar-thumb {
		background: rgba(148, 163, 184, 0.3);
		border-radius: 3px;
	}

	aside::-webkit-scrollbar-thumb:hover {
		background: rgba(148, 163, 184, 0.5);
	}
</style>
