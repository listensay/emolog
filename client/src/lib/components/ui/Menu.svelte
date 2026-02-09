<script lang="ts">
	import { page } from '$app/stores';

	interface MenuItem {
		label: string;
		href: string;
		icon?: string;
	}

	const menuItems: MenuItem[] = [
		{ label: '首页', href: '/' },
		{ label: '归档', href: '/archives' },
		{ label: '关于', href: '/about', },
		{ label: '朋友', href: '/links', }
	];

	const currentPath = $derived($page.url.pathname);

	function isActive(href: string): boolean {
		if (href === '/') {
			return currentPath === '/';
		}
		return currentPath.startsWith(href);
	}
</script>

<div class="menu">
	<nav class="bg-white border-b border-slate-200">
		<ul class="flex justify-center items-center gap-1 p-3 w-[1200px] mx-auto">
			{#each menuItems as item}
				<li class="w-full">
					<a
						href={item.href}
						class="flex items-center justify-center gap-2 p-3 rounded-xl {isActive(item.href)
							? 'text-emerald-600 font-medium'
							: 'text-slate-600'}"
					>
						{#if item.icon}
							<span>{item.icon}</span>
						{/if}
						<span>{item.label}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</div>
