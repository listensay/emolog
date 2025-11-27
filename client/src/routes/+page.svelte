<script>
	import Author from "$lib/components/ui/Author.svelte";
import Menu from "$lib/components/ui/Menu.svelte";

</script>
<div class="flex">
  <div class="layout-left"></div>
  <div class="layout-right">
    <header></header>
    <div>
      <div class="flex h-screen">
        <!-- layoutside -->
        <div class="h-full bg-white w-72 border-r border-gray-200">
          <div class="bg-rose-300 p-4 py-6">
            <Author />
          </div>
          <Menu />
        </div>
        <main class="flex-1 overflow-auto">
          123
        </main>
      </div>
      <footer></footer>
    </div>
  </div>
</div>