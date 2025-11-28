<script lang="ts">
import type { HTMLFormAttributes } from 'svelte/elements';

let { children, class: className, ...rest }: HTMLFormAttributes = $props();
</script>

<form class="space-y-6 {className}" {...rest}>
	{@render children?.()}
</form>
