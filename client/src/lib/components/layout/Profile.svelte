<script lang="ts">
	import Author from '$lib/components/ui/Author.svelte';
	import Menu from '$lib/components/ui/Menu.svelte';
	import { ownerProfile } from '$lib/stores/ownerProfile';

	const profileState = $derived($ownerProfile);
</script>

<!-- 资料区域 -->
<div class="relative mt-6 rounded-t-xl overflow-hidden">
	<!-- 背景图 -->
	{#if profileState.profile.profileBackground}
		<div class="absolute inset-0">
			<img
				src={profileState.profile.profileBackground}
				alt="背景图"
				class="w-full h-full object-cover grayscale-30 brightness-90"
			/>
			<div class="absolute inset-0 bg-black/30"></div>
		</div>
	{:else}
		<div class="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500"></div>
	{/if}

	<!-- 资料内容 -->
	<div class="relative z-10 py-10 px-4">
		<Author />

		<!-- 用户 Links -->
		{#if profileState.profile.links && profileState.profile.links.length > 0}
			<div class="flex justify-center gap-3 mt-4 flex-wrap">
				{#each profileState.profile.links.sort((a, b) => a.order - b.order) as link}
					<a
						href={link.url}
						target="_blank"
						rel="noopener noreferrer"
						class="p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white hover:shadow-md transition-all"
						title={link.name}
					>
						{#if link.icon}
							<img src={link.icon} alt={link.name} class="w-6 h-6 rounded object-cover" />
						{:else}
							<div class="w-6 h-6 rounded bg-slate-300 flex items-center justify-center text-xs text-slate-600">
								{link.name.charAt(0)}
							</div>
						{/if}
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>

<div>
	<Menu />
</div>
