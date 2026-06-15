<!-- src/routes/dashboard/news/+page.svelte -->
<script lang="ts">
  import { userStore } from '$lib/stores/user';
  import { newsApi }   from '$lib/api';
  import Topbar        from '$lib/components/layout/Topbar.svelte';
  import Pagination    from '$lib/components/ui/Pagination.svelte';
  import type { News } from '$lib/types';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let u             = $derived($userStore ?? data.user);
  let role          = $derived(u?.role ?? '');
  let isContributor = $derived(role === 'contributor');
  let isAdmin       = $derived(role === 'admin');
  let userId        = $derived(u?.flask_adherent_id ?? null);

  const PER_PAGE = 8;

  let articles     = $state<News[]>(data.articles);
  let showForm     = $state(false);
  let form         = $state({ title: '', content: '' });
  let saving       = $state(false);
  let error        = $state('');
  let success      = $state('');
  let search       = $state('');
  let authorFilter = $state<'all' | 'mine'>('all');
  let page         = $state(1);

  let filtered = $derived(
    articles.filter(a => {
      const matchSearch = !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.content.toLowerCase().includes(search.toLowerCase());
      const matchAuthor = authorFilter === 'all' || a.author?.id === userId;
      return matchSearch && matchAuthor;
    })
  );

  let totalPages = $derived(Math.max(1, Math.ceil(filtered.length / PER_PAGE)));
  let paginated  = $derived(filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE));

  $effect(() => { search; authorFilter; page = 1; });

  async function createNews() {
    if (!form.title || !form.content) {
      error = 'Titre et contenu sont requis.'; return;
    }
    saving = true; error = '';
    try {
      const res = await newsApi.create(form);
      if (res.status === 201 && res.data) {
        articles = [res.data, ...articles];
        showForm = false;
        form = { title: '', content: '' };
        success = 'Actualité publiée !';
        setTimeout(() => success = '', 3000);
      } else {
        error = res.message;
      }
    } finally {
      saving = false;
    }
  }

  async function deleteNews(id: number) {
    if (!confirm('Supprimer cette actualité ?')) return;
    await newsApi.delete(id);
    articles = articles.filter(a => a.id !== id);
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }
</script>

<Topbar title="Actualités">
  {#if isContributor || isAdmin}
    <button onclick={() => showForm = !showForm} class="btn-primary">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
      </svg>
      Publier
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

  <!-- Form -->
  {#if showForm}
    <div class="card border-hcc-200 bg-hcc-50/20">
      <h3 class="section-title mb-4">Nouvelle actualité</h3>
      <div class="space-y-4">
        <div>
          <label class="label" for="news-title">Titre</label>
          <input id="news-title" type="text" class="input" placeholder="Titre de l'actualité" bind:value={form.title}/>
        </div>
        <div>
          <label class="label" for="news-content">Contenu</label>
          <textarea id="news-content" class="input resize-none h-36" placeholder="Rédigez votre actualité..."
                    bind:value={form.content}></textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-4">
        <button onclick={createNews} disabled={saving} class="btn-primary">
          {saving ? 'Publication...' : 'Publier'}
        </button>
        <button onclick={() => showForm = false} class="btn-secondary">Annuler</button>
      </div>
    </div>
  {/if}

  <!-- Filter bar -->
  <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
    <!-- Search -->
    <div class="relative flex-1 min-w-0">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
           fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input type="text" class="input pl-9" placeholder="Rechercher une actualité..."
             bind:value={search}/>
    </div>

    <!-- Author filter (only for contributor/admin) -->
    {#if isContributor || isAdmin}
      <div class="flex gap-1.5 shrink-0">
        {#each [
          { key: 'all',  label: `Tous (${articles.length})` },
          { key: 'mine', label: 'Mes articles' },
        ] as f}
          <button
            onclick={() => authorFilter = f.key as typeof authorFilter}
            class="text-sm px-4 py-2 rounded-xl font-medium transition-all
                   {authorFilter === f.key
                     ? 'bg-hcc-600 text-white'
                     : 'bg-white border border-gray-200 text-gray-500 hover:border-hcc-300'}">
            {f.label}
          </button>
        {/each}
      </div>
    {/if}

    <div class="text-sm text-gray-400 bg-gray-100 px-3 py-2 rounded-lg shrink-0">
      {filtered.length} / {articles.length} articles
    </div>
  </div>

  <!-- Grid -->
  {#if filtered.length === 0}
    <div class="card text-center py-16">
      <p class="text-gray-400">Aucune actualité trouvée</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {#each paginated as article}
        <div class="card hover:border-hcc-200 transition-all group">
          <div class="flex items-start justify-between gap-3 mb-3">
            <a href="/dashboard/news/{article.id}"
               class="font-semibold text-gray-900 group-hover:text-hcc-600 transition-colors line-clamp-2">
              {article.title}
            </a>
            {#if isAdmin || article.author?.id === userId}
              <button onclick={() => deleteNews(article.id)} aria-label="Supprimer l'article"
                      class="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 p-1">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            {/if}
          </div>

          <p class="text-sm text-gray-500 line-clamp-3 mb-4">{article.content}</p>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 bg-gradient-hcc rounded-full flex items-center justify-center">
                <span class="text-white text-[10px] font-semibold">
                  {article.author?.first_name?.[0]}{article.author?.last_name?.[0]}
                </span>
              </div>
              <span class="text-xs text-gray-400">
                {article.author?.first_name} {article.author?.last_name}
              </span>
            </div>
            <span class="text-xs text-gray-400">{formatDate(article.created_at)}</span>
          </div>
        </div>
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
</div>
