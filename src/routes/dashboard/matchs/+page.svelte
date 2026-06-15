<!-- src/routes/dashboard/matchs/+page.svelte -->
<script lang="ts">
  import { userStore }  from '$lib/stores/user';
  import { matchsApi }  from '$lib/api';
  import Topbar         from '$lib/components/layout/Topbar.svelte';
  import Pagination     from '$lib/components/ui/Pagination.svelte';
  import type { Match } from '$lib/types';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let u        = $derived($userStore ?? data.user);
  let role     = $derived(u?.role ?? '');
  let isCoach  = $derived(role === 'coach');
  let isPlayer = $derived(role === 'player');
  let isAdmin  = $derived(role === 'admin');

  const PER_PAGE = 8;

  let matchs      = $state<Match[]>([]);
  let dataLoaded  = $state(false);
  let loading     = $state(false);
  let showForm    = $state(false);
  let error       = $state('');
  let success     = $state('');
  let statusFilter = $state<'all' | 'upcoming' | 'finished'>('all');
  let page        = $state(1);
  let form        = $state({ date: '', time: '', opponent: '', location: '', comment: '' });
  let saving      = $state(false);

  $effect(() => {
    Promise.resolve(data.matchs).then(m => { matchs = m ?? []; dataLoaded = true; });
  });

  let filtered = $derived((() => {
    const upcoming = matchs
      .filter(m => !m.is_finished)
      .sort((a, b) => a.date.localeCompare(b.date));
    const finished = matchs
      .filter(m => m.is_finished)
      .sort((a, b) => b.date.localeCompare(a.date));
    if (statusFilter === 'upcoming') return upcoming;
    if (statusFilter === 'finished') return finished;
    return [...upcoming, ...finished];
  })());

  let totalPages   = $derived(Math.max(1, Math.ceil(filtered.length / PER_PAGE)));
  let paginated    = $derived(filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE));
  let upcomingCount = $derived(matchs.filter(m => !m.is_finished).length);
  let finishedCount = $derived(matchs.filter(m => m.is_finished).length);

  $effect(() => { statusFilter; page = 1; });

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
    const isSubscribed = match.played_matches?.some(r => r.adherent?.id !== undefined);
    try {
      if (isSubscribed) {
        await matchsApi.unsubscribe(match.id);
      } else {
        await matchsApi.subscribe(match.id);
      }
      await loadMatchs();
    } catch {
      error = "Erreur lors de l'inscription.";
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }
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

  <!-- Form création -->
  {#if showForm}
    <div class="card border-hcc-200 bg-hcc-50/30">
      <h3 class="section-title mb-4">Créer un nouveau match</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label" for="match-date">Date</label>
          <input id="match-date" type="date" class="input" bind:value={form.date}/>
        </div>
        <div>
          <label class="label" for="match-time">Heure</label>
          <input id="match-time" type="time" class="input" bind:value={form.time}/>
        </div>
        <div>
          <label class="label" for="match-opponent">Adversaire</label>
          <input id="match-opponent" type="text" class="input" placeholder="FC Lyon" bind:value={form.opponent}/>
        </div>
        <div>
          <label class="label" for="match-location">Lieu</label>
          <input id="match-location" type="text" class="input" placeholder="Salle des sports" bind:value={form.location}/>
        </div>
        <div class="col-span-2">
          <label class="label" for="match-comment">Commentaire</label>
          <textarea id="match-comment" class="input resize-none h-20" placeholder="Informations complémentaires..."
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

  {#if !dataLoaded}
    <!-- Skeleton initial pendant le streaming -->
    <div class="flex gap-2">
      {#each Array(3) as _}
        <div class="h-9 w-24 bg-gray-100 rounded-xl animate-pulse"></div>
      {/each}
    </div>
    <div class="space-y-3">
      {#each Array(5) as _}
        <div class="h-20 bg-gray-50 rounded-2xl border border-gray-100 animate-pulse"></div>
      {/each}
    </div>
  {:else}
    <!-- Filter bar -->
    <div class="flex items-center gap-2">
      {#each [
        { key: 'all',      label: `Tous (${matchs.length})` },
        { key: 'upcoming', label: `À venir (${upcomingCount})` },
        { key: 'finished', label: `Terminés (${finishedCount})` },
      ] as f}
        <button
          onclick={() => statusFilter = f.key as typeof statusFilter}
          class="text-sm px-4 py-2 rounded-xl font-medium transition-all
                 {statusFilter === f.key
                   ? 'bg-hcc-600 text-white'
                   : 'bg-white border border-gray-200 text-gray-500 hover:border-hcc-300'}">
          {f.label}
        </button>
      {/each}
    </div>

    <!-- Liste -->
    {#if loading}
      {#each Array(4) as _}
        <div class="h-20 bg-gray-100 rounded-2xl animate-pulse"></div>
      {/each}
    {:else if filtered.length === 0}
      <div class="card text-center py-16">
        <p class="text-gray-400">Aucun match trouvé</p>
      </div>
    {:else}
      <div class="space-y-3">
        {#each paginated as match}
          <a
            href="/dashboard/matchs/{match.id}"
            class="flex items-center gap-4 p-4 bg-white rounded-2xl border transition-all group
                   {match.is_finished
                     ? 'border-gray-100 hover:border-gray-200'
                     : 'border-gray-100 hover:border-hcc-200 hover:shadow-sm'}">

            <!-- Date box -->
            <div class="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0
                        {match.is_finished ? 'bg-gray-50' : 'bg-hcc-50'}">
              <span class="font-display text-xl leading-none {match.is_finished ? 'text-gray-500' : 'text-hcc-600'}">
                {new Date(match.date).getDate()}
              </span>
              <span class="text-[10px] uppercase tracking-wider {match.is_finished ? 'text-gray-400' : 'text-hcc-400'}">
                {new Date(match.date).toLocaleDateString('fr-FR', { month: 'short' })}
              </span>
            </div>

            <!-- Infos -->
            <div class="flex-1 min-w-0">
              <p class="font-semibold {match.is_finished ? 'text-gray-600' : 'text-gray-900'}">
                HCC vs {match.opponent}
              </p>
              <p class="text-sm text-gray-400 capitalize truncate">
                {formatDate(match.date)} — {match.time?.slice(0, 5)}
              </p>
              {#if match.location && !match.is_finished}
                <p class="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <svg class="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  {match.location}
                </p>
              {/if}
            </div>

            <!-- Right side -->
            <div class="flex items-center gap-2 flex-shrink-0">
              {#if match.is_finished}
                {#if match.score}
                  <span class="font-mono font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg text-sm">
                    {match.score}
                  </span>
                {:else}
                  <span class="badge bg-gray-100 text-gray-500">Terminé</span>
                {/if}
              {:else}
                <span class="badge bg-blue-50 text-blue-600 border border-blue-100">
                  {match.played_matches?.length ?? 0} inscrits
                </span>
                {#if isPlayer}
                  <button
                    onclick={(e) => { e.preventDefault(); toggleSubscription(match); }}
                    class="btn-secondary text-xs py-1.5 px-3">
                    S'inscrire
                  </button>
                {/if}
              {/if}

              <svg class="w-4 h-4 text-gray-300 group-hover:text-hcc-500 transition-colors"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </a>
        {/each}
      </div>

      <!-- Pagination -->
      {#if filtered.length > PER_PAGE}
        <div class="flex items-center justify-between gap-4 pt-2">
          <span class="text-xs text-gray-400">
            {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} sur {filtered.length}
          </span>
          <Pagination {totalPages} currentPage={page} onPageChange={(p) => page = p} />
        </div>
      {/if}
    {/if}
  {/if}
</div>
