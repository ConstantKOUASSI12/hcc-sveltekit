<!-- src/lib/components/layout/Topbar.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { sidebarOpen } from '$lib/stores/sidebar';
  import type { Snippet } from 'svelte';

  let { title = '', children }: { title?: string; children?: Snippet } = $props();

  const pageTitles: Record<string, string> = {
    '/dashboard':            'Vue d\'ensemble',
    '/dashboard/adherents':  'Adhérents',
    '/dashboard/pending':    'En attente de validation',
    '/dashboard/matchs':     'Matchs',
    '/dashboard/news':       'Actualités',
    '/dashboard/profile':    'Mon profil',
  };

  let currentTitle = $derived(title || pageTitles[$page.url.pathname] || 'HCC');
  let today = $derived(new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }));
</script>

<header class="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
  <div class="flex items-center gap-2 min-w-0">
    <!-- Hamburger menu (mobile only) -->
    <button
      class="md:hidden p-2 -ml-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
      onclick={() => sidebarOpen.update(v => !v)}
      aria-label="Ouvrir le menu">
      <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </button>
    <div class="min-w-0">
      <h1 class="page-title text-lg md:text-xl truncate">{currentTitle}</h1>
      <p class="text-xs text-gray-400 capitalize hidden sm:block">{today}</p>
    </div>
  </div>
  <div class="flex items-center gap-1.5 sm:gap-3 flex-shrink-0 ml-2">
    {@render children?.()}
  </div>
</header>
