<script lang="ts">
	import UserProfile from './UserProfile.svelte';
</script>

<aside class="w-80 bg-white border-l border-slate-200 hidden xl:flex flex-col h-screen sticky top-0">
	<!-- Check UserProfile -->
	<UserProfile />

	<!-- Calendar or other widgets -->
	<div class="p-6"></div>
</aside>
