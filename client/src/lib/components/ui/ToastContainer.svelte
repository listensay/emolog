<script lang="ts">
import { toast } from '$lib/stores/toast';
import Toast from './Toast.svelte';
import { flip } from 'svelte/animate';

const toasts = $derived($toast);
</script>

<div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
	{#each toasts as toastData (toastData.id)}
		<div animate:flip={{ duration: 200 }}>
			<Toast {...toastData} onClose={toast.dismiss} />
		</div>
	{/each}
</div>
