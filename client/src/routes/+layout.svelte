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
	<div class="p-4 fixed right-0 bottom-2">
		<nav>
			<ul class="flex items-center gap-2">
				<li><a href="/">Home</a></li>
				<li><a href="/login">login</a></li>
				<li><a href="/admin">admin</a></li>
			</ul>
		</nav>
	</div>
	{@render children()}
</div>