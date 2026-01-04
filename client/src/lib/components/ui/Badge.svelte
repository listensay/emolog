<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'default',
		class: className = '',
		children
	}: {
		variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'emerald' | 'purple';
		class?: string;
		children: Snippet;
	} = $props();

	const variants = {
		default: 'bg-slate-100 text-slate-800',
		success: 'bg-green-100 text-green-800',
		warning: 'bg-orange-100 text-orange-800',
		danger: 'bg-red-100 text-red-800',
		info: 'bg-blue-100 text-blue-800',
		secondary: 'bg-slate-100 text-slate-600',
		emerald: 'bg-emerald-100 text-emerald-800',
		purple: 'bg-purple-100 text-purple-800'
	};
</script>

<span
	class="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium {variants[
		variant
	]} {className}"
>
	{@render children()}
</span>
