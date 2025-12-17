<script lang="ts">
import avatar from '$lib/assets/avatar.png'

const name = 'immki'
</script>

<div>
  <div class="flex justify-center flex-col items-center">
    <img class="w-26 mb-2 rounded-full jelly" src={avatar} alt={name}>
    <div>
      <div class="text-xl">{name}</div>
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