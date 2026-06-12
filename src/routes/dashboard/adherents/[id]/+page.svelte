<!-- src/routes/dashboard/adherents/[id]/+page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { adherentsApi } from '$lib/api';
  import { useSession } from '$lib/auth-client';
  import Topbar from '$lib/components/layout/Topbar.svelte';
  import type { Adherent } from '$lib/types';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const session = useSession();

  let u       = $derived($session.data?.user ?? data.user);
  let role    = $derived(u?.role ?? '');
  let isAdmin = $derived(role === 'admin');
  let userId  = $derived(u?.flask_adherent_id ?? null);

  let adherent      = $state<Adherent | null>(null);
  let loading       = $state(true);
  let saving        = $state(false);
  let error         = $state('');
  let success       = $state('');
  let changingRole  = $state(false);
  let savingRole    = $state(false);

  let form = $state({
    first_name: '',
    last_name:  '',
    email:      '',
    contact:    '',
  });

  let adherentId = $derived(parseInt($page.params.id!));

  const availableRoles = [
    { id: 2, name: 'coach' },
    { id: 3, name: 'contributor' },
    { id: 4, name: 'player' },
  ];

  let selectedRoleId = $state<number | null>(null);

  const badgeClass: Record<string, string> = {
    admin:       'badge-admin',
    coach:       'badge-coach',
    player:      'badge-player',
    contributor: 'badge-contributor',
    pending:     'badge-pending',
  };

  onMount(async () => {
    const res = await adherentsApi.getOne(adherentId);
    if (res.data) {
      adherent = res.data;
      form = {
        first_name: adherent.first_name,
        last_name:  adherent.last_name,
        email:      adherent.email,
        contact:    adherent.contact,
      };
      selectedRoleId = availableRoles.find(r => r.name === adherent?.role)?.id ?? null;
    }
    loading = false;
  });

  async function saveInfo() {
    if (!form.first_name || !form.last_name || !form.email || !form.contact) {
      error = 'Tous les champs sont requis.';
      return;
    }
    saving = true;
    error  = '';
    try {
      const res = await adherentsApi.update(adherentId, form);
      if (res.data) {
        adherent = res.data;
        success  = 'Informations mises à jour avec succès.';
        setTimeout(() => (success = ''), 3000);
      } else {
        error = res.message ?? 'Erreur lors de la mise à jour.';
      }
    } catch {
      error = 'Erreur de connexion au serveur.';
    } finally {
      saving = false;
    }
  }

  async function saveRole() {
    if (!selectedRoleId || !adherent) return;
    savingRole = true;
    error      = '';
    try {
      const res = await adherentsApi.validate(adherent.id, selectedRoleId);
      if (res.status === 200) {
        if (res.data) adherent = res.data;
        changingRole = false;
        success      = 'Rôle mis à jour avec succès.';
        setTimeout(() => (success = ''), 3000);
      } else {
        error = res.message ?? 'Erreur lors du changement de rôle.';
      }
    } finally {
      savingRole = false;
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }
</script>

<Topbar title="Modifier l'adhérent">
  <a href="/dashboard/adherents" class="btn-secondary">← Retour</a>
</Topbar>

<div class="p-4 md:p-8 max-w-3xl space-y-6 animate-fade">

  {#if success}
    <div class="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
      <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
      </svg>
      {success}
    </div>
  {/if}

  {#if error}
    <div class="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
      <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
      {error}
    </div>
  {/if}

  {#if loading}
    <div class="space-y-4">
      {#each Array(3) as _}
        <div class="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>
      {/each}
    </div>

  {:else if !adherent}
    <div class="card text-center py-16">
      <p class="text-gray-400">Adhérent introuvable.</p>
    </div>

  {:else}

    <!-- Header -->
    <div class="bg-gradient-hcc rounded-2xl p-5 md:p-6 text-white flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
      <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
        <span class="font-display text-2xl">
          {adherent.first_name[0]}{adherent.last_name[0]}
        </span>
      </div>
      <div class="flex-1 min-w-0">
        <h2 class="font-display text-2xl md:text-3xl tracking-wide">
          {adherent.first_name.toUpperCase()} {adherent.last_name.toUpperCase()}
        </h2>
        <p class="text-white/60 text-sm mt-0.5 truncate">{adherent.email}</p>
        <div class="flex items-center justify-center sm:justify-start gap-2 mt-2">
          {#if adherent.role}
            <span class="badge bg-white/20 text-white border-0 capitalize">
              {adherent.role}
            </span>
          {/if}
          <span class="badge {adherent.is_validated
            ? 'bg-green-400/20 text-green-200'
            : 'bg-amber-400/20 text-amber-200'}">
            {adherent.is_validated ? '✓ Validé' : '⏳ En attente'}
          </span>
        </div>
      </div>
      <div class="hidden sm:block ml-auto text-right text-white/40 text-xs flex-shrink-0">
        <p>Membre depuis</p>
        <p class="text-white/70 font-medium mt-0.5">{formatDate(adherent.created_at)}</p>
      </div>
    </div>

    <!-- Infos personnelles -->
    <div class="card">
      <h3 class="section-title mb-5">Informations personnelles</h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label" for="first_name">Prénom</label>
          <input
            id="first_name"
            type="text"
            class="input"
            bind:value={form.first_name}
            disabled={saving}
          />
        </div>
        <div>
          <label class="label" for="last_name">Nom</label>
          <input
            id="last_name"
            type="text"
            class="input"
            bind:value={form.last_name}
            disabled={saving}
          />
        </div>
        <div>
          <label class="label" for="email">Email</label>
          <input
            id="email"
            type="email"
            class="input"
            bind:value={form.email}
            disabled={saving}
          />
        </div>
        <div>
          <label class="label" for="contact">Contact</label>
          <input
            id="contact"
            type="tel"
            class="input"
            bind:value={form.contact}
            disabled={saving}
          />
        </div>
      </div>

      <div class="flex justify-end mt-5">
        <button onclick={saveInfo} disabled={saving} class="btn-primary">
          {#if saving}
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Enregistrement...
          {:else}
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            Enregistrer les modifications
          {/if}
        </button>
      </div>
    </div>

    <!-- Rôle (admin uniquement) -->
    {#if isAdmin}
      <div class="card">
        <div class="flex items-center justify-between mb-5">
          <h3 class="section-title">Rôle et permissions</h3>
          {#if !changingRole}
            <button onclick={() => (changingRole = true)} class="btn-secondary text-xs">
              Changer le rôle
            </button>
          {/if}
        </div>

        {#if !changingRole}
          <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div class="w-10 h-10 bg-hcc-50 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-hcc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-400">Rôle actuel</p>
              {#if adherent.role}
                <span class="{badgeClass[adherent.role ?? '']} capitalize mt-1">
                  {adherent.role}
                </span>
              {:else}
                <span class="badge-pending mt-1">Aucun rôle assigné</span>
              {/if}
            </div>
          </div>

        {:else}
          <div class="space-y-4">
            <div class="grid grid-cols-3 gap-3">
              {#each availableRoles as r}
                <button
                  onclick={() => (selectedRoleId = r.id)}
                  class="p-3 rounded-xl border-2 text-sm font-medium capitalize transition-all
                         {selectedRoleId === r.id
                           ? 'border-hcc-600 bg-hcc-50 text-hcc-700'
                           : 'border-gray-200 hover:border-gray-300 text-gray-600'}">
                  {r.name}
                </button>
              {/each}
            </div>

            <div class="flex gap-3">
              <button onclick={saveRole} disabled={savingRole} class="btn-primary">
                {#if savingRole}
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Enregistrement...
                {:else}
                  Confirmer le rôle
                {/if}
              </button>
              <button
                onclick={() => { changingRole = false; selectedRoleId = availableRoles.find(r => r.name === adherent?.role)?.id ?? null; }}
                class="btn-secondary">
                Annuler
              </button>
            </div>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Informations lecture seule -->
    <div class="card bg-gray-50 border-gray-100">
      <h3 class="section-title mb-4 text-gray-400">Informations système</h3>
      <div class="grid grid-cols-2 gap-3">
        {#each [
          { label: 'ID',              value: String(adherent.id) },
          { label: 'Statut',          value: adherent.is_validated ? 'Validé' : 'En attente' },
          { label: 'Date d\'inscription', value: formatDate(adherent.created_at) },
          { label: 'Dernière mise à jour', value: formatDate(adherent.updated_at) },
        ] as info}
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{info.label}</p>
            <p class="text-sm text-gray-600 font-medium">{info.value}</p>
          </div>
        {/each}
      </div>
    </div>

  {/if}
</div>
