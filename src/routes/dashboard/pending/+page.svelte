<!-- src/routes/dashboard/pending/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { adherentsApi } from '$lib/api';
  import Topbar from '$lib/components/layout/Topbar.svelte';
  import type { Adherent } from '$lib/types';

  let pending  = $state<Adherent[]>([]);
  let loading  = $state(true);
  let selected = $state<Record<number, number>>({});
  let saving   = $state<Record<number, boolean>>({});
  let success  = $state('');
  let error    = $state('');

  const availableRoles = [
    { id: 2, name: 'coach' },
    { id: 3, name: 'contributor' },
    { id: 4, name: 'player' },
  ];

  onMount(async () => {
    const res = await adherentsApi.getPending();
    if (res.data) {
      pending = res.data;
      pending.forEach(a => { selected[a.id] = availableRoles[2].id; });
    }
    loading = false;
  });

  async function validateAdherent(adherent: Adherent) {
    const roleId = selected[adherent.id];
    if (!roleId) { error = 'Sélectionnez un rôle.'; return; }

    saving[adherent.id] = true; error = '';

    const role_name = availableRoles.filter(a => a.id == roleId)[0].name;

    try {
      const res = await adherentsApi.validate(adherent.id, roleId);
      if (res.status === 200) {

        const syncRes = await fetch('/api/admin/sync-user', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            email:        adherent.email,
            role:         role_name,
            is_validated: true,
          }),
        });

        if (!syncRes.ok) {
          const syncJson = await syncRes.json();
          console.warn('[sync] Better Auth update failed:', syncJson);
        }

        pending = pending.filter(a => a.id !== adherent.id);
        success = `${adherent.first_name} ${adherent.last_name} activé !`;
        setTimeout(() => success = '', 3000);
      } else {
        error = (res as any).message ?? 'Erreur lors de la validation.';
      }
    } finally {
      saving[adherent.id] = false;
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }
</script>

<Topbar title="En attente de validation">
  {#if pending.length > 0}
    <span class="badge bg-amber-100 text-amber-700">
      {pending.length} en attente
    </span>
  {/if}
</Topbar>

<div class="p-4 md:p-8 space-y-6 animate-fade">

  {#if success}
    <div class="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">{success}</div>
  {/if}
  {#if error}
    <div class="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
  {/if}

  {#if loading}
    {#each Array(3) as _}
      <div class="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>
    {/each}
  {:else if pending.length === 0}
    <div class="card text-center py-16">
      <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <h3 class="font-semibold text-gray-900 mb-1">Tout est à jour !</h3>
      <p class="text-gray-400 text-sm">Aucun adhérent en attente de validation.</p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each pending as adherent}
        <div class="card flex flex-col sm:flex-row sm:items-center gap-4">
          <!-- Avatar + Info -->
          <div class="flex items-center gap-4 flex-1 min-w-0">
            <div class="w-12 h-12 bg-gradient-hcc rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-white font-semibold">
                {adherent.first_name[0]}{adherent.last_name[0]}
              </span>
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-gray-900">
                {adherent.first_name} {adherent.last_name}
              </p>
              <p class="text-sm text-gray-400 truncate">{adherent.email} · {adherent.contact}</p>
              <p class="text-xs text-gray-400 mt-0.5">Inscrit le {formatDate(adherent.created_at)}</p>
            </div>
          </div>

          <!-- Role selector -->
          <div class="flex items-center gap-3 sm:flex-shrink-0">
            <select
              bind:value={selected[adherent.id]}
              class="input flex-1 sm:w-36 py-2 text-sm">
              {#each availableRoles as role}
                <option value={role.id}>{role.name}</option>
              {/each}
            </select>

            <button
              onclick={() => validateAdherent(adherent)}
              disabled={saving[adherent.id]}
              class="btn-primary whitespace-nowrap flex-shrink-0">
              {#if saving[adherent.id]}
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              {:else}
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                Valider
              {/if}
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
