<!-- src/routes/dashboard/profile/+page.svelte -->
<script lang="ts">
  import { userStore } from '$lib/stores/user';
  import Topbar from '$lib/components/layout/Topbar.svelte';
  import type { Adherent } from '$lib/types';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let u    = $derived($userStore ?? data.user);
  let role = $derived(u?.role ?? '');

  let profile = $state<Adherent | null>(data.profile ?? null);

  const roleLabels: Record<string, string> = {
    admin: 'Administrateur', coach: 'Coach',
    player: 'Joueur', contributor: 'Contributeur', pending: 'En attente'
  };
  const badgeClass: Record<string, string> = {
    admin: 'badge-admin', coach: 'badge-coach',
    player: 'badge-player', contributor: 'badge-contributor', pending: 'badge-pending'
  };

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }
</script>

<Topbar title="Mon profil" />

<div class="p-4 md:p-8 space-y-6 animate-fade max-w-4xl">
  {#if profile}

    <!-- Header card -->
    <div class="bg-gradient-hcc rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
      <div class="absolute right-0 top-0 w-48 h-48 opacity-10">
        {#each Array(3) as _, i}
          <div class="absolute rounded-full border-2 border-white"
               style="width:{60+i*40}px;height:{60+i*40}px;top:50%;right:10px;transform:translateY(-50%)"></div>
        {/each}
      </div>
      <div class="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
        <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <span class="font-display text-3xl text-white">
            {profile.first_name[0]}{profile.last_name[0]}
          </span>
        </div>
        <div>
          <h2 class="font-display text-3xl md:text-4xl tracking-wide">
            {profile.first_name.toUpperCase()} {profile.last_name.toUpperCase()}
          </h2>
          <p class="text-white/60 text-sm mt-1">{profile.email}</p>
          <span class="{badgeClass[role ?? '']} mt-2 bg-white/20 text-white border-0">
            {roleLabels[role ?? '']}
          </span>
        </div>
      </div>
    </div>

    <!-- Info cards -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="card">
        <p class="label">Prénom</p>
        <p class="font-medium text-gray-900">{profile.first_name}</p>
      </div>
      <div class="card">
        <p class="label">Nom</p>
        <p class="font-medium text-gray-900">{profile.last_name}</p>
      </div>
      <div class="card">
        <p class="label">Contact</p>
        <p class="font-medium text-gray-900">{profile.contact}</p>
      </div>
      <div class="card">
        <p class="label">Email</p>
        <p class="font-medium text-gray-900">{profile.email}</p>
      </div>
      <div class="card">
        <p class="label">Membre depuis</p>
        <p class="font-medium text-gray-900">{formatDate(profile.created_at)}</p>
      </div>
      <div class="card">
        <p class="label">Statut</p>
        <span class="{profile.is_validated ? 'badge bg-green-100 text-green-700' : 'badge-pending'}">
          {profile.is_validated ? '✓ Compte actif' : 'En attente'}
        </span>
      </div>
    </div>

    <!-- JOUEUR — matchs inscrits -->
    {#if role === 'player' && profile.registrations?.length}
      <div class="card">
        <h3 class="section-title mb-4">Mes inscriptions aux matchs</h3>
        <div class="space-y-2">
          {#each profile.registrations as reg}
            {#if reg.match}
              <a href="/dashboard/matchs/{reg.match.id}"
                 class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div class="w-8 h-8 bg-hcc-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span class="font-display text-hcc-600 text-sm">
                    {reg.match.date ? new Date(reg.match.date).getDate() : '?'}
                  </span>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">HCC vs {reg.match.opponent}</p>
                  <p class="text-xs text-gray-400">
                    Inscrit le {formatDate(reg.date_of_registration)}
                  </p>
                </div>
                <span class="badge {reg.match.is_finished ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'}">
                  {reg.match.is_finished ? 'Terminé' : 'À venir'}
                </span>
              </a>
            {/if}
          {/each}
        </div>
      </div>
    {/if}

    <!-- CONTRIBUTEUR — mes actualités -->
    {#if role === 'contributor' && profile.mes_actualites?.length}
      <div class="card">
        <h3 class="section-title mb-4">Mes actualités publiées</h3>
        <div class="space-y-3">
          {#each profile.mes_actualites as article}
            <a href="/dashboard/news/{article.id}"
               class="block p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div class="flex items-start justify-between gap-2">
                <p class="text-sm font-medium text-gray-900 hover:text-hcc-600">{article.title}</p>
                <span class="text-xs text-gray-400 flex-shrink-0">
                  {formatDate(article.created_at)}
                </span>
              </div>
              <p class="text-xs text-gray-400 mt-1 line-clamp-2">{article.content}</p>
            </a>
          {/each}
        </div>
      </div>
    {/if}

    <!-- COACH — mes matchs -->
    {#if role === 'coach' && profile.mes_matchs?.length}
      <div class="card">
        <h3 class="section-title mb-4">Matchs que je coach</h3>
        <div class="space-y-2">
          {#each profile.mes_matchs as match}
            <a href="/dashboard/matchs/{match.id}"
               class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div class="w-8 h-8 bg-hcc-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <span class="font-display text-hcc-600 text-sm">
                  {new Date(match.date).getDate()}
                </span>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">HCC vs {match.opponent}</p>
                <p class="text-xs text-gray-400">{formatDate(match.date)}</p>
              </div>
              {#if match.score}
                <span class="font-mono text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  {match.score}
                </span>
              {:else}
                <span class="badge {match.is_finished ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'}">
                  {match.is_finished ? 'Terminé' : 'À venir'}
                </span>
              {/if}
            </a>
          {/each}
        </div>
      </div>
    {/if}

  {/if}
</div>
