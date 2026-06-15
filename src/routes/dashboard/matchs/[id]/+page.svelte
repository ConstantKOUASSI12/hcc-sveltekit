<!-- src/routes/dashboard/matchs/[id]/+page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { useSession } from '$lib/auth-client';
  import { matchsApi } from '$lib/api';
  import Topbar from '$lib/components/layout/Topbar.svelte';
  import type { Match } from '$lib/types';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const session = useSession();

  let u       = $derived($session.data?.user ?? data.user);
  let role    = $derived(u?.role ?? '');
  let isCoach  = $derived(role === 'coach');
  let isAdmin  = $derived(role === 'admin');
  let isPlayer = $derived(role === 'player');
  let userId   = $derived(u?.flask_adherent_id ?? null);

  let match   = $state<Match | null>(data.match ?? null);
  let editing = $state(false);
  let saving  = $state(false);
  let error   = $state('');
  let success = $state('');

  let editForm = $state({
    score:       data.match?.score       ?? '',
    comment:     data.match?.comment     ?? '',
    is_finished: data.match?.is_finished ?? false,
  });

  let matchId      = $derived(parseInt($page.params.id!));
  let isSubscribed = $derived(
    match?.played_matches?.some(r => r.adherent?.id === userId) ?? false
  );

  async function saveMatch() {
    if (!match) return;
    saving = true; error = '';
    try {
      const res = await matchsApi.update(match.id, editForm);
      if (res.data) {
        match   = res.data;
        editing = false;
        success = 'Match mis à jour !';
        setTimeout(() => success = '', 3000);
      }
    } finally {
      saving = false;
    }
  }

  async function toggleSubscription() {
    if (!match) return;
    try {
      if (isSubscribed) {
        await matchsApi.unsubscribe(match.id);
      } else {
        await matchsApi.subscribe(match.id);
      }
      const res = await matchsApi.getOne(match.id);
      if (res.data) match = res.data;
    } catch {
      error = 'Erreur lors de l\'inscription.';
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }
</script>

<Topbar title={match ? `HCC vs ${match.opponent}` : 'Match'}>
  {#if (isCoach || isAdmin) && match}
    <button onclick={() => editing = !editing} class="btn-secondary">
      {editing ? 'Annuler' : 'Modifier'}
    </button>
  {/if}
  {#if isPlayer && match && !match.is_finished}
    <button
      onclick={toggleSubscription}
      class="{isSubscribed ? 'btn-danger' : 'btn-primary'}">
      {isSubscribed ? 'Se désinscrire' : 'S\'inscrire'}
    </button>
  {/if}
</Topbar>

<div class="p-4 md:p-8 animate-fade">
  {#if !match}
    <div class="card text-center py-16">
      <p class="text-gray-400">Match introuvable</p>
    </div>
  {:else}
    {#if success}
      <div class="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-6">{success}</div>
    {/if}
    {#if error}
      <div class="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>
    {/if}

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Main info -->
      <div class="lg:col-span-2 space-y-4">

        <!-- Score banner -->
        <div class="bg-gradient-hcc rounded-2xl p-8 text-white text-center">
          <p class="text-white/60 text-sm mb-1 uppercase tracking-widest">Match</p>
          <div class="flex items-center justify-center gap-3 md:gap-6 my-4">
            <div class="text-center">
              <div class="font-display text-2xl md:text-4xl tracking-wide">HCC</div>
              <div class="text-white/50 text-xs mt-1">Comines</div>
            </div>
            <div class="font-display text-3xl md:text-5xl text-white/40 flex-shrink-0">
              {match.score ?? 'VS'}
            </div>
            <div class="text-center min-w-0">
              <div class="font-display text-2xl md:text-4xl tracking-wide truncate max-w-[100px] md:max-w-none">{match.opponent}</div>
              <div class="text-white/50 text-xs mt-1">Adversaire</div>
            </div>
          </div>
          <span class="badge {match.is_finished ? 'bg-white/20 text-white' : 'bg-accent-400/20 text-accent-400'}">
            {match.is_finished ? 'Match terminé' : 'À venir'}
          </span>
        </div>

        <!-- Details -->
        <div class="card">
          <h3 class="section-title mb-4">Informations</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {#each [
              { label: 'Date',  value: formatDate(match.date) },
              { label: 'Heure', value: match.time?.slice(0,5) ?? 'N/A' },
              { label: 'Lieu',  value: match.location ?? 'Non défini' },
              { label: 'Coach', value: `${match.coach?.first_name ?? ''} ${match.coach?.last_name ?? ''}` },
            ] as info}
              <div class="bg-gray-50 rounded-xl p-3">
                <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">{info.label}</p>
                <p class="text-sm font-medium text-gray-900">{info.value}</p>
              </div>
            {/each}
          </div>

          {#if match.comment}
            <div class="mt-4 bg-gray-50 rounded-xl p-3">
              <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Commentaire</p>
              <p class="text-sm text-gray-700">{match.comment}</p>
            </div>
          {/if}
        </div>

        <!-- Edit form (coach/admin) -->
        {#if editing}
          <div class="card border-hcc-200 bg-hcc-50/20">
            <h3 class="section-title mb-4">Modifier le match</h3>
            <div class="space-y-4">
              <div>
                <label class="label">Score (ex: 24-18)</label>
                <input type="text" class="input" placeholder="24-18" bind:value={editForm.score}/>
              </div>
              <div>
                <label class="label">Commentaire</label>
                <textarea class="input resize-none h-24" bind:value={editForm.comment}></textarea>
              </div>
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" class="w-4 h-4 rounded text-hcc-600"
                       bind:checked={editForm.is_finished}/>
                <span class="text-sm font-medium text-gray-700">Match terminé</span>
              </label>
            </div>
            <div class="flex gap-3 mt-4">
              <button onclick={saveMatch} disabled={saving} class="btn-primary">
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button onclick={() => editing = false} class="btn-secondary">Annuler</button>
            </div>
          </div>
        {/if}
      </div>

      <!-- Participants -->
      <div class="card">
        <h3 class="section-title mb-4">
          Participants
          <span class="ml-2 badge bg-hcc-100 text-hcc-600">
            {match.played_matches?.length ?? 0}
          </span>
        </h3>

        {#if !match.played_matches?.length}
          <p class="text-gray-400 text-sm text-center py-8">Aucun participant</p>
        {:else}
          <div class="space-y-2">
            {#each match.played_matches as reg}
              <div class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50">
                <div class="w-8 h-8 bg-gradient-hcc rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-white text-xs font-semibold">
                    {reg.adherent?.first_name?.[0]}{reg.adherent?.last_name?.[0]}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {reg.adherent?.first_name} {reg.adherent?.last_name}
                  </p>
                  {#if reg.date_of_registration}
                    <p class="text-xs text-gray-400">
                      Inscrit le {new Date(reg.date_of_registration).toLocaleDateString('fr-FR')}
                    </p>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
