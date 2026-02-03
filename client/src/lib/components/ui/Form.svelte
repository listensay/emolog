<script lang="ts">
import type { HTMLFormAttributes } from 'svelte/elements';

let { children, class: className, onsubmit, ...rest }: HTMLFormAttributes = $props();

function handleSubmit(e: any) {
	e.preventDefault();

    if (onsubmit) {
        onsubmit(e);
    }
}
</script>

<form class="space-y-6 {className}" onsubmit={handleSubmit} {...rest}>
	{@render children?.()}
</form>
