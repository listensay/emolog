<script lang="ts">
import avatar from '$lib/assets/avatar.png'
import { siteConfig } from '$lib/stores/siteConfig';

const configState = $derived($siteConfig);
</script>

<div>
  <div class="flex justify-center flex-col items-center">
    {#if configState.config.site_logo}
      <img class="w-26 mb-2 rounded-full jelly border-4 border-white/50 shadow-lg" src={configState.config.site_logo} alt={configState.config.site_title}>
    {:else}
      <img class="w-26 mb-2 rounded-full jelly border-4 border-white/50 shadow-lg" src={avatar} alt={configState.config.site_title}>
    {/if}
    <div>
      <div class="text-xl font-medium text-white drop-shadow-md">{configState.config.site_title}</div>
    </div>
  </div>
</div>

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
    0%, 100% {
      transform: scale(1, 1);
    }
    25% {
      transform: scale(0.9, 1.1);
    }
    50% {
      transform: scale(1.1, 0.9);
    }
    75% {
      transform: scale(0.95, 1.05);
    }
  }

  @keyframes jelly-hover {
    0%, 100% {
      transform: scale(1, 1);
    }
    25% {
      transform: scale(0.9, 1.1);
    }
    50% {
      transform: scale(1.1, 0.9);
    }
    75% {
      transform: scale(0.95, 1.05);
    }
  }
</style>