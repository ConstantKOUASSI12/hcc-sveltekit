<!-- src/routes/dashboard/matchs/+page.svelte -->
<script lang="ts">
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
  let isPlayer = $derived(role === 'player');
  let isAdmin  = $derived(role === 'admin');

  let matchs   = $state<Match[]>(data.matchs);
  let loading  = $state(false);
  let showForm = $state(false);
  let error    = $state('');
  let success  = $state('');

  let form   = $state({ date: '', time: '', opponent: '', location: '', comment: '' });
  let saving = $state(false);

  async function loadMatchs() {
    loading = true;
    try {
      const res = await matchsApi.getAll();
      if (res.data) matchs = res.data;
    } finally {
      loading = false;
    }
  }

  async function createMatch() {
    if (!form.date || !form.time || !form.opponent) {
      error = 'Date, heure et adversaire sont requis.'; return;
    }
    saving = true; error = '';
    try {
      const res = await matchsApi.create(form);
      if (res.status === 201 && res.data) {
        matchs = [res.data, ...matchs];
        showForm = false;
        form = { date: '', time: '', opponent: '', location: '', comment: '' };
        success = 'Match créé avec succès !';
        setTimeout(() => success = '', 3000);
      } else {
        error = res.message;
      }
    } finally {
      saving = false;
    }
  }

  async function toggleSubscription(match: Match) {
    const isSubscribed = match.played_matches?.some(
      r => r.adherent?.id !== undefined
    );
    try {
      if (isSubscribed) {
        await matchsApi.unsubscribe(match.id);
      } else {
        await matchsApi.subscribe(match.id);
      }
      await loadMatchs();
    } catch {
      error = 'Erreur lors de l\'inscription.';
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  let upcoming = $derived(matchs.filter(m => !m.is_finished));
  let finished = $derived(matchs.filter(m => m.is_finished));
</script>

<Topbar title="Matchs">
  {#if isCoach || isAdmin}
    <button onclick={() => showForm = !showForm} class="btn-primary">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
      </svg>
      Nouveau match
    </button>
  {/if}
</Topbar>

<div class="p-4 md:p-8 space-y-6 animate-fade">

  {#if success}
    <div class="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">{success}</div>
  {/if}
  {#if error}
    <div class="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
  {/if}

  <!-- Form création (coach/admin) -->
  {#if showForm}
    <div class="card border-hcc-200 bg-hcc-50/30">
      <h3 class="section-title mb-4">Créer un nouveau match</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label">Date</label>
          <input type="date" class="input" bind:value={form.date}/>
        </div>
        <div>
          <label class="label">Heure</label>
          <input type="time" class="input" bind:value={form.time}/>
        </div>
        <div>
          <label class="label">Adversaire</label>
          <input type="text" class="input" placeholder="FC Lyon" bind:value={form.opponent}/>
        </div>
        <div>
          <label class="label">Lieu</label>
          <input type="text" class="input" placeholder="Salle des sports" bind:value={form.location}/>
        </div>
        <div class="col-span-2">
          <label class="label">Commentaire</label>
          <textarea class="input resize-none h-20" placeholder="Informations complémentaires..."
                    bind:value={form.comment}></textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-4">
        <button onclick={createMatch} disabled={saving} class="btn-primary">
          {saving ? 'Création...' : 'Créer le match'}
        </button>
        <button onclick={() => showForm = false} class="btn-secondary">Annuler</button>
      </div>
    </div>
  {/if}

  <!-- Matchs à venir -->
  <div>
    <h3 class="section-title mb-4">Matchs à venir ({upcoming.length})</h3>
    {#if loading}
      {#each Array(3) as _}
        <div class="h-20 bg-gray-100 rounded-2xl mb-3 animate-pulse"></div>
      {/each}
    {:else if upcoming.length === 0}
      <div class="card text-center py-12">
        <p class="text-gray-400">Aucun match à venir</p>
      </div>
    {:else}
      <div class="space-y-3">
        {#each upcoming as match}
          <a href="/dashboard/matchs/{match.id}"
             class="card flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:border-hcc-200 hover:shadow-glow/10 transition-all group">
            <div class="w-14 h-14 bg-hcc-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
              <span class="font-display text-hcc-600 text-xl leading-none">
                {new Date(match.date).getDate()}
              </span>
              <span class="text-[10px] text-hcc-400 uppercase tracking-wider">
                {new Date(match.date).toLocaleDateString('fr-FR', { month: 'short' })}
              </span>
            </div>

            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-900">HCC vs {match.opponent}</p>
              <p class="text-sm text-gray-400 capitalize">{formatDate(match.date)} — {match.time?.slice(0,5)}</p>
              {#if match.location}
                <p class="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  {match.location}
                </p>
              {/if}
            </div>

            <div class="flex items-center gap-2 sm:gap-3 sm:ml-auto flex-shrink-0">
              <span class="badge bg-blue-100 text-blue-700">
                {match.played_matches?.length ?? 0} inscrits
              </span>

              {#if isPlayer}
                <button
                  onclick={(e) => { e.preventDefault(); toggleSubscription(match); }}
                  class="btn-secondary text-xs py-1.5 px-3">
                  S'inscrire
                </button>
              {/if}

              <svg class="w-4 h-4 text-gray-300 group-hover:text-hcc-500 transition-colors"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Matchs terminés -->
  {#if finished.length > 0}
    <div>
      <h3 class="section-title mb-4 text-gray-400">Matchs terminés ({finished.length})</h3>
      <div class="space-y-2">
        {#each finished as match}
          <a href="/dashboard/matchs/{match.id}"
             class="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all group">
            <div class="w-12 h-12 bg-gray-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
              <span class="font-display text-gray-500 text-lg leading-none">
                {new Date(match.date).getDate()}
              </span>
              <span class="text-[10px] text-gray-400 uppercase tracking-wider">
                {new Date(match.date).toLocaleDateString('fr-FR', { month: 'short' })}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-600">HCC vs {match.opponent}</p>
              <p class="text-xs text-gray-400">{formatDate(match.date)}</p>
            </div>
            {#if match.score}
              <span class="font-mono font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg text-sm">
                {match.score}
              </span>
            {:else}
              <span class="badge bg-gray-100 text-gray-500">Terminé</span>
            {/if}
            <svg class="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>
