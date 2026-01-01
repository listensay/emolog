<script lang="ts">
import type { HTMLButtonAttributes } from 'svelte/elements';
import { presets } from '$lib/theme';
import { Loader2 } from '@lucide/svelte';

let {
    children,
    variant = 'primary',
    class: className,
    loading = false,
    disabled,
    ...rest
}: HTMLButtonAttributes & {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    loading?: boolean;
} = $props();

const variants = {
    primary: presets.buttonPrimary,
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
    outline: 'border border-slate-300 bg-transparent hover:bg-slate-100 text-slate-700',
    ghost: 'hover:bg-slate-100 text-slate-700'
};
</script>

<button
	class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 {variants[
		variant
	]} {className}"
	disabled={disabled || loading}
	{...rest}
>
	{#if loading}
		<Loader2 class="mr-2 h-4 w-4 animate-spin" />
	{/if}
	{@render children?.()}
</button>
