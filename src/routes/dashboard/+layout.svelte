<!-- src/routes/dashboard/+layout.svelte -->
<script lang="ts">
  import { useSession } from '$lib/auth-client';
  import { goto }       from '$app/navigation';
  import Sidebar        from '$lib/components/layout/Sidebar.svelte';
  import { sidebarOpen } from '$lib/stores/sidebar';
  import type { LayoutData } from './$types';
  import type { Snippet } from 'svelte';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  const session = useSession();

  $effect(() => {
    if (!$session.isPending && !$session.data) {
      goto('/auth/login');
    }
  });

  let user = $derived($session.data?.user ?? data.user);
</script>

{#if user}
  <div class="flex min-h-screen bg-gray-50">
    <Sidebar {user} />

    <!-- Backdrop overlay (mobile) -->
    {#if $sidebarOpen}
      <button
        class="fixed inset-0 bg-black/40 z-40 md:hidden"
        aria-label="Fermer le menu"
        onclick={() => sidebarOpen.set(false)}>
      </button>
    {/if}

    <main class="flex-1 min-h-screen overflow-x-hidden md:ml-[260px]">
      {@render children()}
    </main>
  </div>
{/if}
