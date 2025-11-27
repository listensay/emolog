<script lang="ts">
import avatar from '$lib/assets/avatar.png'

const name = '你说话漏风（@immk）'
const description = '想转生成为东京帅哥'
</script>

<div>
  <div class="flex items-center gap-4 text-white text-shadow-xs">
    <img class="w-16 rounded-full jelly" src={avatar} alt={name}>
    <div>
      <div>{name}</div>
      <div class="text-sm mt-0.5">{description}</div>
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