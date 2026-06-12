<!-- src/routes/dashboard/news/[id]/+page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { newsApi } from '$lib/api';
  import { useSession } from '$lib/auth-client';
  import Topbar from '$lib/components/layout/Topbar.svelte';
  import type { News } from '$lib/types';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const session = useSession();

  let u       = $derived($session.data?.user ?? data.user);
  let isAdmin = $derived(u?.role === 'admin');
  let userId  = $derived(u?.flask_adherent_id ?? null);

  let article = $state<News | null>(null);
  let loading = $state(true);

  let newsId     = $derived(parseInt($page.params.id!));
  let canDelete  = $derived(isAdmin || article?.author?.id === userId);

  onMount(async () => {
    const res = await newsApi.getOne(newsId);
    if (res.data) article = res.data;
    loading = false;
  });

  async function handleDelete() {
    if (!article || !confirm('Supprimer cette actualité ?')) return;
    await newsApi.delete(article.id);
    goto('/dashboard/news');
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }
</script>

<Topbar title="Actualité">
  <a href="/dashboard/news" class="btn-secondary">← Retour</a>
  {#if canDelete && article}
    <button onclick={handleDelete} class="btn-danger">Supprimer</button>
  {/if}
</Topbar>

<div class="p-4 md:p-8 max-w-3xl animate-fade">
  {#if loading}
    <div class="space-y-4">
      <div class="h-8 bg-gray-100 rounded-xl w-3/4 animate-pulse"></div>
      <div class="h-4 bg-gray-100 rounded w-1/3 animate-pulse"></div>
      <div class="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>
    </div>
  {:else if !article}
    <div class="card text-center py-16">
      <p class="text-gray-400">Actualité introuvable</p>
    </div>
  {:else}
    <div class="card">
      <div class="mb-6">
        <h1 class="font-display text-3xl text-gray-900 tracking-wide mb-3">{article.title}</h1>
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-gradient-hcc rounded-full flex items-center justify-center">
            <span class="text-white text-xs font-semibold">
              {article.author?.first_name?.[0]}{article.author?.last_name?.[0]}
            </span>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">
              {article.author?.first_name} {article.author?.last_name}
            </p>
            <p class="text-xs text-gray-400 capitalize">{formatDate(article.created_at)}</p>
          </div>
        </div>
      </div>
      <div class="border-t border-gray-100 pt-6">
        <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{article.content}</p>
      </div>
    </div>
  {/if}
</div>
