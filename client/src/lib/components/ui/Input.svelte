<script lang="ts">
import type { HTMLInputAttributes } from 'svelte/elements';

let {
    value = $bindable(),
    label,
    error,
    id,
    class: className,
    ...rest
}: HTMLInputAttributes & {
    value?: string;
    label?: string;
    error?: string;
    id?: string;
} = $props();
</script>

<div class="flex flex-col gap-1.5 w-full">
	{#if label}
		<label for={id} class="text-sm font-medium text-slate-700">
			{label}
		</label>
	{/if}
	<input
		{id}
		bind:value
		class="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 {className}"
		{...rest}
	/>
	{#if error}
		<p class="text-xs text-red-500">{error}</p>
	{/if}
</div>
