<!-- src/lib/components/ui/Pagination.svelte -->
<script lang="ts">
  interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }

  let { currentPage, totalPages, onPageChange }: Props = $props();

  function pages(): (number | '…')[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const delta = 1;
    const left  = currentPage - delta;
    const right = currentPage + delta;
    const result: (number | '…')[] = [];

    result.push(1);
    if (left > 2)      result.push('…');
    for (let i = Math.max(2, left); i <= Math.min(totalPages - 1, right); i++) {
      result.push(i);
    }
    if (right < totalPages - 1) result.push('…');
    result.push(totalPages);

    return result;
  }
</script>

{#if totalPages > 1}
  <div class="flex items-center justify-center gap-1 mt-4">
    <!-- Prev -->
    <button
      onclick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500
             hover:border-hcc-300 hover:text-hcc-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      aria-label="Page précédente">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
      </svg>
    </button>

    <!-- Pages -->
    {#each pages() as p}
      {#if p === '…'}
        <span class="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">…</span>
      {:else}
        <button
          onclick={() => onPageChange(p as number)}
          class="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all
                 {currentPage === p
                   ? 'bg-hcc-600 text-white border border-hcc-600'
                   : 'border border-gray-200 text-gray-600 hover:border-hcc-300 hover:text-hcc-600'}">
          {p}
        </button>
      {/if}
    {/each}

    <!-- Next -->
    <button
      onclick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500
             hover:border-hcc-300 hover:text-hcc-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      aria-label="Page suivante">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
      </svg>
    </button>
  </div>
{/if}
