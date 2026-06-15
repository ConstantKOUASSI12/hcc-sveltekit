<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
  import Topbar from '$lib/components/layout/Topbar.svelte';
  import StatCard from '$lib/components/dashboard/StatCard.svelte';
  import type { Match, News, Adherent } from '$lib/types';
  import { userStore } from '$lib/stores/user';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let u           = $derived($userStore ?? data.user);
  let role        = $derived(u?.role ?? '');
  let isAdmin     = $derived(role === 'admin');
  let isCoach     = $derived(role === 'coach');

  let matchs    = $state<Match[]>(data.matchs);
  let news      = $state<News[]>(data.news);
  let adherents = $state<Adherent[]>(data.adherents);
  let pending   = $derived(adherents.filter(a => a.role === 'pending'));

  const icons = {
    users:   `<path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>`,
    match:   `<path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
    news:    `<path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>`,
    pending: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>`,
  };

  let nextMatch = $derived(
    matchs
      .filter(m => !m.is_finished)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
  );

  let recentNews   = $derived(news.slice(0, 4));
  let recentMatchs = $derived(matchs.slice(0, 5));

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  const roleBadgeClass: Record<string, string> = {
    admin:       'badge-admin',
    coach:       'badge-coach',
    player:      'badge-player',
    contributor: 'badge-contributor',
    pending:     'badge-pending',
  };
</script>

<Topbar title="Vue d'ensemble" />

<div class="p-4 md:p-8 space-y-6 md:space-y-8 animate-fade">

  <!-- Welcome -->
  <div class="bg-gradient-hcc rounded-2xl p-5 md:p-6 text-white relative overflow-hidden">
    <div class="absolute right-0 top-0 w-64 h-64 opacity-10">
      {#each Array(4) as _, i}
        <div class="absolute rounded-full border-2 border-white"
             style="width:{80+i*50}px;height:{80+i*50}px;top:50%;right:-20px;
                    transform:translateY(-50%)"></div>
      {/each}
    </div>
    <div class="relative z-10">
      <p class="text-white/60 text-sm mb-1">Bienvenue,</p>
      <h2 class="font-display text-3xl tracking-wide">
        {u?.first_name?.toUpperCase()} {u?.last_name?.toUpperCase()}
      </h2>
      <span class="{roleBadgeClass[role ?? '']} mt-2 bg-white/20 text-white border-0 capitalize">
        {role}
      </span>
    </div>
    {#if nextMatch}
      <div class="relative z-10 mt-4 bg-white/10 backdrop-blur rounded-xl px-4 py-3 inline-flex items-center gap-3">
        <svg class="w-4 h-4 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span class="text-sm">
          Prochain match : <strong>HCC vs {nextMatch.opponent}</strong>
          — {formatDate(nextMatch.date)}
        </span>
      </div>
    {/if}
  </div>

  <!-- Stats -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {#if isAdmin}
      <StatCard label="Adhérents" value={adherents.length}
                sub="membres actifs" color="blue" icon={icons.users}/>
      <StatCard label="En attente" value={pending.length}
                sub="à valider" color="amber" icon={icons.pending}/>
    {/if}
    <StatCard label="Matchs" value={matchs.length}
              sub="cette saison" color="green" icon={icons.match}/>
    <StatCard label="Actualités" value={news.length}
              sub="publiées" color="purple" icon={icons.news}/>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

    <!-- Recent matchs -->
    <div class="card">
      <div class="flex items-center justify-between mb-5">
        <h3 class="section-title">Derniers matchs</h3>
        <a href="/dashboard/matchs" class="text-xs text-hcc-600 hover:underline font-medium">
          Voir tout →
        </a>
      </div>

      {#if recentMatchs.length === 0}
        <p class="text-gray-400 text-sm text-center py-8">Aucun match enregistré</p>
      {:else}
        <div class="space-y-2">
          {#each recentMatchs as match}
            <a href="/dashboard/matchs/{match.id}"
               class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 {match.is_finished ? 'bg-gray-100' : 'bg-hcc-50'}
                            rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 {match.is_finished ? 'text-gray-400' : 'text-hcc-600'}"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">vs {match.opponent}</p>
                  <p class="text-xs text-gray-400">{formatDate(match.date)}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                {#if match.score}
                  <span class="font-mono text-sm font-medium text-gray-700">{match.score}</span>
                {:else}
                  <span class="badge {match.is_finished ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'}">
                    {match.is_finished ? 'Terminé' : 'À venir'}
                  </span>
                {/if}
                <svg class="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Recent news -->
    <div class="card">
      <div class="flex items-center justify-between mb-5">
        <h3 class="section-title">Actualités récentes</h3>
        <a href="/dashboard/news" class="text-xs text-hcc-600 hover:underline font-medium">
          Voir tout →
        </a>
      </div>

      {#if recentNews.length === 0}
        <p class="text-gray-400 text-sm text-center py-8">Aucune actualité</p>
      {:else}
        <div class="space-y-3">
          {#each recentNews as article}
            <a href="/dashboard/news/{article.id}"
               class="block p-3 rounded-xl hover:bg-gray-50 transition-colors group">
              <div class="flex items-start justify-between gap-2">
                <p class="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-hcc-600 transition-colors">
                  {article.title}
                </p>
                <span class="text-xs text-gray-400 flex-shrink-0">{formatDate(article.created_at)}</span>
              </div>
              <p class="text-xs text-gray-400 mt-0.5 line-clamp-2">{article.content}</p>
            </a>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- Pending adherents (admin only) -->
  {#if isAdmin && pending.length > 0}
    <div class="card border-amber-200 bg-amber-50/50">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h3 class="section-title text-amber-800">
            {pending.length} adhérent{pending.length > 1 ? 's' : ''} en attente de validation
          </h3>
        </div>
        <a href="/dashboard/pending" class="btn-secondary text-amber-700 border-amber-200 hover:bg-amber-100">
          Gérer →
        </a>
      </div>
      <div class="space-y-2">
        {#each pending.slice(0, 3) as p}
          <div class="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5">
            <div class="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-xs font-medium text-gray-500">
                {p.first_name[0]}{p.last_name[0]}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {p.first_name} {p.last_name}
              </p>
              <p class="text-xs text-gray-400 truncate">{p.email}</p>
            </div>
            <span class="badge-pending">En attente</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
