<!-- src/lib/components/dashboard/StatCard.svelte -->
<script lang="ts">
  let {
    label,
    value,
    sub = '',
    color = 'blue',
    icon = '',
  }: {
    label: string;
    value: string | number;
    sub?: string;
    color?: 'blue' | 'green' | 'amber' | 'purple' | 'red';
    icon?: string;
  } = $props();

  const colors = {
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   icon: 'bg-blue-100'   },
    green:  { bg: 'bg-green-50',  text: 'text-green-600',  icon: 'bg-green-100'  },
    amber:  { bg: 'bg-amber-50',  text: 'text-amber-600',  icon: 'bg-amber-100'  },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'bg-purple-100' },
    red:    { bg: 'bg-red-50',    text: 'text-red-600',    icon: 'bg-red-100'    },
  };

  let c = $derived(colors[color]);
</script>

<div class="stat-card animate-fade">
  <div class="flex items-start justify-between">
    <div>
      <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p class="text-3xl font-display tracking-wide text-gray-900 mt-1">{value}</p>
      {#if sub}
        <p class="text-xs text-gray-400 mt-0.5">{sub}</p>
      {/if}
    </div>
    {#if icon}
      <div class="w-10 h-10 {c.icon} {c.text} rounded-xl flex items-center justify-center flex-shrink-0">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          {@html icon}
        </svg>
      </div>
    {/if}
  </div>
</div>
