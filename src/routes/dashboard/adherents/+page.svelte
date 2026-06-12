<!-- src/routes/dashboard/adherents/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { adherentsApi } from '$lib/api';
  import { useSession } from '$lib/auth-client';
  import Topbar from '$lib/components/layout/Topbar.svelte';
  import type { Adherent } from '$lib/types';

  const session = useSession();

  let adherents = $state<Adherent[]>([]);
  let loading    = $state(true);
  let search     = $state('');
  let roleFilter = $state('all');

  const roles = ['all', 'admin', 'coach', 'player', 'contributor', 'pending'];
  const roleLabels: Record<string, string> = {
    all: 'Tous', admin: 'Admin', coach: 'Coach',
    player: 'Joueurs', contributor: 'Contributeurs', pending: 'pending'
  };
  const badgeClass: Record<string, string> = {
    admin: 'badge-admin', coach: 'badge-coach',
    player: 'badge-player', contributor: 'badge-contributor',
    pending: 'badge-pending'
  };

  onMount(async () => {
    const res = await adherentsApi.getAll();
    if (res.data) adherents = res.data;
    loading = false;
  });

  let filtered = $derived(
    adherents.filter(a => {
      const matchSearch = !search ||
        `${a.first_name} ${a.last_name} ${a.email}`.toLowerCase()
          .includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' || a.role === roleFilter;
      return matchSearch && matchRole;
    })
  );

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }
</script>

<Topbar title="Adhérents">
  <div class="text-sm text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">
    {filtered.length} / {adherents.length} membres
  </div>
</Topbar>

<div class="p-4 md:p-8 space-y-6 animate-fade">

  <!-- Filters -->
  <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
    <!-- Search -->
    <div class="relative flex-1 min-w-0">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
           fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input type="text" class="input pl-9" placeholder="Rechercher un adhérent..."
             bind:value={search}/>
    </div>

    <!-- Role filter -->
    <div class="flex gap-1.5 overflow-x-auto pb-0.5 flex-nowrap shrink-0">
      {#each roles as r}
        <button
          onclick={() => roleFilter = r}
          class="text-xs px-3 py-2 rounded-xl font-medium transition-all
                 {roleFilter === r
                   ? 'bg-hcc-600 text-white'
                   : 'bg-white border border-gray-200 text-gray-500 hover:border-hcc-300'}">
          {roleLabels[r]}
        </button>
      {/each}
    </div>
  </div>

  <!-- Table -->
  <div class="card p-0 overflow-hidden">
    <div class="overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr class="border-b border-gray-100">
          <th class="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Membre</th>
          <th class="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
          <th class="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
          <th class="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Rôle</th>
          <th class="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Inscription</th>
          <th class="px-6 py-4"></th>
        </tr>
      </thead>
      <tbody>
        {#if loading}
          {#each Array(5) as _}
            <tr class="border-b border-gray-50">
              {#each Array(6) as _}
                <td class="px-6 py-4">
                  <div class="h-4 bg-gray-100 rounded animate-pulse"></div>
                </td>
              {/each}
            </tr>
          {/each}
        {:else if filtered.length === 0}
          <tr>
            <td colspan="6" class="text-center py-16 text-gray-400">Aucun adhérent trouvé</td>
          </tr>
        {:else}
          {#each filtered as adherent}
            <tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-gradient-hcc rounded-full flex items-center justify-center flex-shrink-0">
                    <span class="text-white text-xs font-semibold">
                      {adherent.first_name[0]}{adherent.last_name[0]}
                    </span>
                  </div>
                  <span class="text-sm font-medium text-gray-900">
                    {adherent.first_name} {adherent.last_name}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">{adherent.email}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{adherent.contact}</td>
              <td class="px-6 py-4">
                {#if adherent.role}
                  <span class="{badgeClass[adherent.role ?? ''] ?? 'badge-pending'} capitalize">
                    {adherent.role}
                  </span>
                {:else}
                  <span class="badge-pending">En attente</span>
                {/if}
              </td>
              <td class="px-6 py-4 text-sm text-gray-400">{formatDate(adherent.created_at)}</td>
              <td class="px-6 py-4">
                <a href="/dashboard/adherents/{adherent.id}"
                   class="text-hcc-600 hover:underline text-sm font-medium">
                  Voir →
                </a>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
    </div>
  </div>
</div>
