<script lang="ts">
import './layout.css';
import favicon from '$lib/assets/favicon.svg';
import ToastContainer from '$lib/components/ui/ToastContainer.svelte';

let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ToastContainer />

<div class="bg-slate-100 min-h-screen">
	{@render children()}
</div>