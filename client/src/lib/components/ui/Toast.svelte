<script lang="ts">
import { scale } from 'svelte/transition';
import { elasticOut, cubicIn } from 'svelte/easing';
import type { ToastData, ToastType } from '$lib/stores/toast';
import { X } from '@lucide/svelte';

let {
	id,
	type = 'info',
	message,
	duration = 3000,
	onClose
}: ToastData & {
	onClose: (id: string) => void;
} = $props();

const icons: Record<ToastType, string> = {
	success: '✓',
	error: '✕',
	warning: '!',
	info: 'i'
};

const iconColors: Record<ToastType, string> = {
	success: 'text-emerald-400',
	error: 'text-rose-400',
	warning: 'text-amber-400',
	info: 'text-sky-400'
};

const iconBg: Record<ToastType, string> = {
	success: 'bg-emerald-500/20',
	error: 'bg-rose-500/20',
	warning: 'bg-amber-500/20',
	info: 'bg-sky-500/20'
};

let timeoutId: ReturnType<typeof setTimeout> | undefined;

$effect(() => {
	if (duration > 0) {
		timeoutId = setTimeout(() => {
			onClose(id);
		}, duration);
	}

	return () => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
	};
});
</script>

<div
	in:scale|local={{ duration: 500, easing: elasticOut, start: 0.7 }}
	out:scale|local={{ duration: 200, easing: cubicIn, start: 1 }}
	class="dynamic-island flex items-center gap-3 px-5 py-3.5 rounded-full backdrop-blur-2xl bg-black/80 shadow-2xl min-w-[320px] max-w-md border border-white/20"
	role="alert"
>
	<div class="toast-icon flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 {iconBg[type]}">
		<span class="text-lg font-bold {iconColors[type]}">{icons[type]}</span>
	</div>

	<div class="flex-1 text-sm font-medium text-white/90">
		{message}
	</div>

	<button
		onclick={() => onClose(id)}
		class="toast-close flex-shrink-0 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
		aria-label="关闭"
	>
		<X class="w-3.5 h-3.5 stroke-white/70" strokeWidth={2.5} />
	</button>
</div>

<style>
	@keyframes pulse-glow {
		0%,
		100% {
			box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
		}
		50% {
			box-shadow: 0 15px 50px -10px rgba(0, 0, 0, 0.7);
		}
	}

	@keyframes icon-pop {
		0% {
			transform: scale(0.8);
			opacity: 0;
		}
		50% {
			transform: scale(1.1);
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.dynamic-island {
		animation: pulse-glow 2s ease-in-out infinite;
	}

	.toast-icon {
		animation: icon-pop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}

	.toast-close:active {
		background: rgba(255, 255, 255, 0.15);
	}
</style>
