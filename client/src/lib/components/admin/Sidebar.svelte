<script lang="ts">
import { page } from '$app/state';

interface MenuItem {
	label: string;
	href: string;
	icon: string;
}

const menuItems: MenuItem[] = [
	{ label: '仪表盘', href: '/admin', icon: '📊' },
	{ label: '文章管理', href: '/admin/posts', icon: '📝' },
	{ label: '分类管理', href: '/admin/categories', icon: '🏷️' },
	{ label: '标签管理', href: '/admin/tags', icon: '🔖' },
	{ label: '图片管理', href: '/admin/images', icon: '🖼️' },
	{ label: '评论管理', href: '/admin/comments', icon: '💬' },
	{ label: '用户管理', href: '/admin/users', icon: '👥' },
	{ label: '设置', href: '/admin/settings', icon: '⚙️' }
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
	<!-- Logo -->
	<div class="p-6 border-b border-slate-800">
		<h1 class="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
			Emolog
		</h1>
		<p class="text-xs text-slate-400 mt-1">后台管理系统</p>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 overflow-y-auto p-4">
		<ul class="space-y-1">
			{#each menuItems as item}
				<li>
					<a
						href={item.href}
						class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 {isActive(
							item.href
						)
							? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/50'
							: 'text-slate-300 hover:bg-slate-800 hover:text-white'}"
					>
						<span class="text-xl">{item.icon}</span>
						<span class="font-medium">{item.label}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- Footer -->
	<div class="p-4 border-t border-slate-800">
		<div class="text-xs text-slate-500 text-center">
			© 2024 Emolog
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
