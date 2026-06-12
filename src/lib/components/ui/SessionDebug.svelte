<!-- src/lib/components/ui/SessionDebug.svelte -->
<!-- Composant de debug — visible seulement en développement -->
<script lang="ts">
  import { dev } from '$app/environment';
  import { useSession, signOut } from '$lib/auth-client';
  import { onMount, onDestroy } from 'svelte';

  let open = $state(false);
  const session = useSession();

  function formatDate(d: string) {
    return new Date(d).toLocaleTimeString('fr-FR');
  }

  function timeLeft(expires: string): string {
    const diff = new Date(expires).getTime() - Date.now();
    if (diff <= 0) return 'Expiré ⚠️';
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}m ${secs}s`;
  }

  let now = $state(Date.now());
  let interval: ReturnType<typeof setInterval>;
  onMount(() => { interval = setInterval(() => now = Date.now(), 1000); });
  onDestroy(() => clearInterval(interval));
</script>

{#if dev && $session}
  <div class="fixed bottom-4 right-4 z-50">
    <button onclick={() => open = !open}
            class="w-8 h-8 bg-hcc-600 text-white rounded-full text-xs font-mono
                   shadow-lg hover:bg-hcc-700 transition-colors">
      🔑
    </button>

    {#if open}
      <div class="absolute bottom-10 right-0 w-72 bg-gray-900 text-green-400
                  rounded-xl p-4 font-mono text-[11px] shadow-2xl space-y-2">
        <p class="text-gray-400 font-sans font-medium text-xs mb-3">
          Better Auth — Session
        </p>

        <div>
          <span class="text-gray-500">Utilisateur : </span>
          {$session.data?.user?.first_name} {$session.data?.user?.last_name}
        </div>
        <div>
          <span class="text-gray-500">Rôle : </span>
          {$session.data?.user?.role ?? 'N/A'}
        </div>

        <div class="border-t border-gray-700 pt-2 mt-2">
          <p class="text-gray-500 mb-1">Access token :</p>
          <p class="text-yellow-400">
            Expire dans : {now && $session.data?.user?.flask_access_expires ? timeLeft($session.data.user.flask_access_expires) : 'N/A'}
          </p>
          <p class="text-gray-600 break-all">
            {$session.data?.user?.flask_access_token?.slice(0, 40) ?? 'N/A'}...
          </p>
        </div>

        <div class="border-t border-gray-700 pt-2">
          <p class="text-gray-500 mb-1">Refresh token :</p>
          <p class="text-blue-400">
            Expire dans : {now && $session.data?.user?.flask_refresh_expires ? timeLeft($session.data.user.flask_refresh_expires) : 'N/A'}
          </p>
        </div>
      </div>
    {/if}
  </div>
{/if}
