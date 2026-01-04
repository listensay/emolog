<script lang="ts">
import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';
import { presets } from '$lib/theme';
import { Loader2 } from '@lucide/svelte';

type ButtonDetailedProps = HTMLButtonAttributes & {
    href?: never;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    loading?: boolean;
};

type AnchorDetailedProps = HTMLAnchorAttributes & {
    href: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    loading?: boolean;
    disabled?: boolean; 
};

let {
    children,
    variant = 'primary',
    class: className,
    loading = false,
    ...rest
}: ButtonDetailedProps | AnchorDetailedProps = $props();

const variants = {
    primary: presets.buttonPrimary,
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
    outline: 'border border-slate-300 bg-transparent hover:bg-slate-100 text-slate-700',
    ghost: 'hover:bg-slate-100 text-slate-700'
};

const baseClass = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2";
</script>

{#if rest.href}
    <a
        class="{baseClass} {variants[variant]} {className}"
        {...rest as HTMLAnchorAttributes}
    >
        {#if loading}
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        {@render children?.()}
    </a>
{:else}
    <button
        class="{baseClass} {variants[variant]} {className}"
        disabled={/* @ts-ignore */ rest.disabled || loading}
        {...rest as HTMLButtonAttributes}
    >
        {#if loading}
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        {@render children?.()}
    </button>
{/if}
