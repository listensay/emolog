<script lang="ts">
	import Menu from '$lib/components/ui/Menu.svelte';
	import { ownerProfile } from '$lib/stores/ownerProfile';
	import { siteConfig } from '$lib/stores/siteConfig';
	import defaultAvatar from '$lib/assets/avatar.png';

	interface Props {
		avatar?: string;
		nickname?: string;
		bio?: string;
		profileBackground?: string;
		links?: Array<{ order: number; icon: string; name: string; url: string }>;
		showMenu?: boolean;
	}

	let { avatar, nickname, bio, profileBackground, links, showMenu = true }: Props = $props();

	const profileState = $derived($ownerProfile);
	const configState = $derived($siteConfig);

	const displayBackground = $derived(profileBackground ?? profileState.profile.profileBackground);
	const displayLinks = $derived(links ?? profileState.profile.links);
	const displayAvatar = $derived(avatar ?? configState.config.site_logo);
	const displayNickname = $derived(nickname ?? configState.config.site_title);
	const displayBio = $derived(bio ?? profileState.profile.bio);
</script>

<!-- 资料区域 -->
<div class="relative overflow-hidden">
	<!-- 背景图 -->
	{#if displayBackground}
		<div class="absolute inset-0">
			<img
				src={displayBackground}
				alt="背景图"
				class="w-full h-full object-cover grayscale-30 brightness-90"
			/>
			<div class="absolute inset-0 bg-black/30"></div>
		</div>
	{:else}
		<div class="absolute inset-0"></div>
	{/if}

	<!-- 资料内容 -->
	<div class="relative z-10 pt-40 mb-6">
		<div class="flex w-[1200px] mx-auto">
			<img
				class="w-32 mr-4 rounded-full jelly shadow-lg"
				src={displayAvatar || defaultAvatar}
				alt={displayNickname}
			/>
			<div class="flex flex-col justify-center">
				<div class="text-2xl font-medium text-white drop-shadow-md">{displayNickname}</div>
				{#if displayBio}
				<div class="text-white/80 mt-2 drop-shadow-md">{displayBio}</div>
				{/if}

				<!-- 用户 Links -->
				{#if displayLinks && displayLinks.length > 0}
					<div class="flex gap-3 mt-2 flex-wrap">
						{#each displayLinks.toSorted((a, b) => a.order - b.order) as link}
							<a
								href={link.url}
								target="_blank"
								rel="noopener noreferrer"
								class="p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white hover:shadow-md transition-all"
								title={link.name}
							>
								{#if link.icon}
									<img src={link.icon} alt={link.name} class="w-5 h-5 rounded object-cover" />
								{:else}
									<div class="w-4 h-4 rounded bg-slate-300 flex items-center justify-center text-xs text-slate-600">
										{link.name.charAt(0)}
									</div>
								{/if}
							</a>
						{/each}
					</div>
				{/if}
			</div>
		</div>

	</div>
</div>

{#if showMenu}
	<div>
		<Menu />
	</div>
{/if}

<style>
	.jelly {
		animation: jelly-load 0.5s;
		transform-origin: center;
		transition: transform 0.1s;
	}

	.jelly:hover {
		animation: jelly-hover 0.6s ease-in-out;
	}

	@keyframes jelly-load {
		0%, 100% { transform: scale(1, 1); }
		25% { transform: scale(0.9, 1.1); }
		50% { transform: scale(1.1, 0.9); }
		75% { transform: scale(0.95, 1.05); }
	}

	@keyframes jelly-hover {
		0%, 100% { transform: scale(1, 1); }
		25% { transform: scale(0.9, 1.1); }
		50% { transform: scale(1.1, 0.9); }
		75% { transform: scale(0.95, 1.05); }
	}
</style>
